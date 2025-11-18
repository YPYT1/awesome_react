# Yup验证库

## 概述

Yup是一个JavaScript schema构建器,用于值解析和验证。它与React Hook Form集成良好,提供了简洁的API和强大的验证功能。虽然Zod在TypeScript支持上更优秀,但Yup因其成熟度和广泛使用仍然是热门选择。本文将全面介绍Yup的使用方法。

## 安装和基础配置

### 安装

```bash
# npm
npm install yup @hookform/resolvers

# yarn
yarn add yup @hookform/resolvers

# pnpm
pnpm add yup @hookform/resolvers
```

### 基础使用

```jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// 定义schema
const schema = yup.object({
  username: yup.string().required('用户名不能为空').min(3, '用户名至少3个字符'),
  email: yup.string().required('邮箱不能为空').email('邮箱格式不正确'),
  password: yup.string().required('密码不能为空').min(8, '密码至少8个字符'),
}).required();

function BasicYupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## Yup基础类型

### 字符串验证

```jsx
import * as yup from 'yup';

const stringSchema = yup.object({
  // 基本字符串
  basic: yup.string(),
  
  // 必填
  required: yup.string().required('此字段必填'),
  
  // 长度限制
  minLength: yup.string().min(3, '至少3个字符'),
  maxLength: yup.string().max(20, '最多20个字符'),
  length: yup.string().length(10, '必须是10个字符'),
  
  // 邮箱
  email: yup.string().email('邮箱格式不正确'),
  
  // URL
  url: yup.string().url('URL格式不正确'),
  
  // 正则表达式
  matches: yup.string().matches(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'),
  
  // 小写
  lowercase: yup.string().lowercase(),
  
  // 大写
  uppercase: yup.string().uppercase(),
  
  // trim
  trimmed: yup.string().trim(),
  
  // 枚举值
  oneOf: yup.string().oneOf(['admin', 'user', 'guest'], '无效的角色'),
});
```

### 数字验证

```jsx
import * as yup from 'yup';

const numberSchema = yup.object({
  // 基本数字
  basic: yup.number(),
  
  // 必填
  required: yup.number().required('数字不能为空'),
  
  // 范围
  min: yup.number().min(0, '不能小于0'),
  max: yup.number().max(100, '不能大于100'),
  
  // 整数
  integer: yup.number().integer('必须是整数'),
  
  // 正数
  positive: yup.number().positive('必须是正数'),
  
  // 负数
  negative: yup.number().negative('必须是负数'),
  
  // 小数位数
  round: yup.number().round('floor'), // 'floor' | 'ceil' | 'trunc' | 'round'
  
  // 类型转换
  transformed: yup.number().transform((value, originalValue) => {
    return originalValue === '' ? undefined : value;
  }),
});
```

### 布尔值验证

```jsx
import * as yup from 'yup';

const booleanSchema = yup.object({
  // 基本布尔值
  basic: yup.boolean(),
  
  // 必须为true
  mustBeTrue: yup.boolean().oneOf([true], '必须同意条款'),
  
  // 默认值
  withDefault: yup.boolean().default(false),
});
```

### 日期验证

```jsx
import * as yup from 'yup';

const dateSchema = yup.object({
  // 基本日期
  basic: yup.date(),
  
  // 必填
  required: yup.date().required('日期不能为空'),
  
  // 最小日期
  minDate: yup.date().min(new Date(), '日期不能早于今天'),
  
  // 最大日期
  maxDate: yup.date().max(new Date('2025-12-31'), '日期不能晚于2025年'),
  
  // 自定义验证
  custom: yup.date().test(
    'is-weekday',
    '只能选择工作日',
    (value) => {
      if (!value) return true;
      const day = value.getDay();
      return day !== 0 && day !== 6; // 不是周末
    }
  ),
});
```

## 对象和嵌套验证

### 嵌套对象

```jsx
import * as yup from 'yup';

const profileSchema = yup.object({
  personal: yup.object({
    firstName: yup.string().required('名不能为空'),
    lastName: yup.string().required('姓不能为空'),
    dateOfBirth: yup.date().required('出生日期不能为空'),
  }),
  
  contact: yup.object({
    email: yup.string().required('邮箱不能为空').email('邮箱格式不正确'),
    phone: yup.string().matches(/^\d{11}$/, '手机号格式不正确'),
  }),
  
  address: yup.object({
    street: yup.string().required('街道不能为空'),
    city: yup.string().required('城市不能为空'),
    zipCode: yup.string().length(6, '邮编必须是6位'),
  }).required(),
}).required();

// 在表单中使用
function NestedObjectForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('personal.firstName')} />
      {errors.personal?.firstName && (
        <span>{errors.personal.firstName.message}</span>
      )}
      
      <input {...register('contact.email')} />
      {errors.contact?.email && (
        <span>{errors.contact.email.message}</span>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 可选字段和默认值

```jsx
import * as yup from 'yup';

const schema = yup.object({
  // 必填
  required: yup.string().required('此字段必填'),
  
  // 可选
  optional: yup.string(),
  
  // 可选,但不允许null
  notNullable: yup.string().nullable(false),
  
  // 可以为null
  nullable: yup.string().nullable(),
  
  // 默认值
  withDefault: yup.string().default('默认值'),
  
  // 可选并提供默认值
  optionalWithDefault: yup.string().default('默认'),
  
  // 当字段不存在时的处理
  undefined: yup.string().notRequired(),
});
```

## 数组验证

### 数组Schema

```jsx
import * as yup from 'yup';
import { useFieldArray } from 'react-hook-form';

// 字符串数组
const tagsSchema = yup.array()
  .of(yup.string().required('标签不能为空'))
  .min(1, '至少一个标签')
  .max(10, '最多10个标签');

// 对象数组
const itemsSchema = yup.array()
  .of(
    yup.object({
      name: yup.string().required('名称不能为空'),
      quantity: yup.number().required('数量不能为空').positive().integer(),
      price: yup.number().required('价格不能为空').positive(),
    })
  )
  .min(1, '至少一个项目');

// 完整schema
const orderSchema = yup.object({
  customerName: yup.string().required('客户名称不能为空'),
  tags: tagsSchema,
  items: itemsSchema,
}).required();

function ArrayValidationForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(orderSchema),
    defaultValues: {
      items: [{ name: '', quantity: 1, price: 0 }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('customerName')} />
      
      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...register(`items.${index}.name`)}
            placeholder="名称"
          />
          {errors.items?.[index]?.name && (
            <span>{errors.items[index].name.message}</span>
          )}
          
          <input
            type="number"
            {...register(`items.${index}.quantity`, {
              valueAsNumber: true,
            })}
          />
          
          <button type="button" onClick={() => remove(index)}>
            删除
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => append({ name: '', quantity: 1, price: 0 })}
      >
        添加项目
      </button>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 数组约束

```jsx
import * as yup from 'yup';

const arrayConstraints = yup.object({
  // 最小长度
  minItems: yup.array().min(1, '至少一项'),
  
  // 最大长度
  maxItems: yup.array().max(10, '最多10项'),
  
  // 唯一值
  unique: yup.array().test(
    'unique',
    '不能有重复值',
    (value) => {
      if (!value) return true;
      return new Set(value).size === value.length;
    }
  ),
  
  // 紧凑数组(过滤falsy值)
  compact: yup.array().compact(),
  
  // 确保是数组
  ensureArray: yup.array().ensure(),
});
```

## 自定义验证

### test方法

```jsx
import * as yup from 'yup';

const customSchema = yup.object({
  username: yup.string()
    .required('用户名不能为空')
    .test('no-admin', '不能使用admin', (value) => {
      return value !== 'admin';
    }),
  
  password: yup.string()
    .required('密码不能为空')
    .test('strong-password', '密码强度不足', function(value) {
      if (!value) return true;
      
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*]/.test(value);
      
      return hasUpper && hasLower && hasNumber && hasSpecial;
    }),
  
  // 访问其他字段
  email: yup.string()
    .email()
    .test('unique-email', '该邮箱已被使用', async function(value) {
      if (!value) return true;
      
      const response = await fetch(`/api/check-email?email=${value}`);
      const data = await response.json();
      
      return data.available;
    }),
});
```

### when条件验证

```jsx
import * as yup from 'yup';

const conditionalSchema = yup.object({
  accountType: yup.string().oneOf(['personal', 'business']),
  
  // 根据accountType动态验证
  companyName: yup.string().when('accountType', {
    is: 'business',
    then: (schema) => schema.required('公司名称不能为空'),
    otherwise: (schema) => schema.notRequired(),
  }),
  
  taxId: yup.string().when('accountType', {
    is: 'business',
    then: (schema) => schema.required('税号不能为空'),
  }),
  
  // 多条件
  discount: yup.number().when(['accountType', 'isPremium'], {
    is: (accountType, isPremium) => accountType === 'business' && isPremium,
    then: (schema) => schema.min(10, '折扣至少10%'),
  }),
});

// 使用示例
function ConditionalForm() {
  const { register, watch, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(conditionalSchema),
  });
  
  const accountType = watch('accountType');
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <select {...register('accountType')}>
        <option value="">选择账户类型</option>
        <option value="personal">个人</option>
        <option value="business">企业</option>
      </select>
      
      {accountType === 'business' && (
        <>
          <input {...register('companyName')} placeholder="公司名称" />
          {errors.companyName && <span>{errors.companyName.message}</span>}
          
          <input {...register('taxId')} placeholder="税号" />
          {errors.taxId && <span>{errors.taxId.message}</span>}
        </>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### ref方法 - 字段引用

```jsx
import * as yup from 'yup';

const refSchema = yup.object({
  password: yup.string().required('密码不能为空').min(8),
  
  // 引用password字段
  confirmPassword: yup.string()
    .required('请确认密码')
    .oneOf([yup.ref('password')], '密码不匹配'),
  
  // 日期范围
  startDate: yup.date().required('开始日期不能为空'),
  
  endDate: yup.date()
    .required('结束日期不能为空')
    .min(yup.ref('startDate'), '结束日期不能早于开始日期'),
  
  // 数字比较
  minPrice: yup.number().positive(),
  
  maxPrice: yup.number()
    .positive()
    .moreThan(yup.ref('minPrice'), '最大价格必须大于最小价格'),
});
```

## 转换和预处理

### transform方法

```jsx
import * as yup from 'yup';

const transformSchema = yup.object({
  // 转换为小写
  email: yup.string()
    .email()
    .transform((value) => value.toLowerCase()),
  
  // trim空格
  username: yup.string()
    .transform((value) => value.trim()),
  
  // 数字转换
  price: yup.number()
    .transform((value, originalValue) => {
      return originalValue === '' ? undefined : value;
    }),
  
  // 数组处理
  tags: yup.array()
    .transform((value) => {
      if (typeof value === 'string') {
        return value.split(',').map(tag => tag.trim());
      }
      return value;
    }),
});
```

### 类型转换

```jsx
import * as yup from 'yup';

const castSchema = yup.object({
  // 字符串转数字
  stringToNumber: yup.number().transform((value, originalValue) => {
    if (typeof originalValue === 'string') {
      return parseFloat(originalValue);
    }
    return value;
  }),
  
  // 字符串转布尔
  stringToBoolean: yup.boolean().transform((value, originalValue) => {
    if (originalValue === 'true') return true;
    if (originalValue === 'false') return false;
    return value;
  }),
  
  // 字符串转日期
  stringToDate: yup.date().transform((value, originalValue) => {
    if (typeof originalValue === 'string') {
      return new Date(originalValue);
    }
    return value;
  }),
});
```

## 错误消息定制

### 自定义错误消息

```jsx
import * as yup from 'yup';

// 全局默认消息
yup.setLocale({
  mixed: {
    required: '${path}不能为空',
  },
  string: {
    email: '请输入有效的邮箱地址',
    min: '${path}至少${min}个字符',
    max: '${path}最多${max}个字符',
  },
  number: {
    min: '${path}不能小于${min}',
    max: '${path}不能大于${max}',
  },
});

// 字段级别自定义消息
const schema = yup.object({
  username: yup.string()
    .required('用户名不能为空')
    .min(3, '用户名至少3个字符'),
  
  age: yup.number()
    .required('年龄不能为空')
    .min(18, ({ min }) => `必须年满${min}岁`)
    .max(100, ({ max }) => `年龄不能超过${max}岁`),
});
```

## 实战案例

### 完整表单验证

```jsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// 定义schema
const schema = yup.object({
  personal: yup.object({
    firstName: yup.string().required('名不能为空'),
    lastName: yup.string().required('姓不能为空'),
    email: yup.string()
      .required('邮箱不能为空')
      .email('邮箱格式不正确')
      .transform((value) => value.toLowerCase()),
    phone: yup.string()
      .required('手机号不能为空')
      .matches(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  }),
  
  account: yup.object({
    username: yup.string()
      .required('用户名不能为空')
      .min(3, '用户名至少3个字符')
      .max(20, '用户名最多20个字符')
      .matches(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'),
    password: yup.string()
      .required('密码不能为空')
      .min(8, '密码至少8个字符')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
    confirmPassword: yup.string()
      .required('请确认密码')
      .oneOf([yup.ref('password')], '密码不匹配'),
  }),
  
  preferences: yup.object({
    newsletter: yup.boolean(),
    notifications: yup.boolean(),
    language: yup.string().oneOf(['zh', 'en'], '无效的语言选项'),
  }),
  
  agreeToTerms: yup.boolean()
    .oneOf([true], '请同意服务条款'),
}).required();

function CompleteForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      personal: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
      account: {
        username: '',
        password: '',
        confirmPassword: '',
      },
      preferences: {
        newsletter: false,
        notifications: true,
        language: 'zh',
      },
      agreeToTerms: false,
    },
  });
  
  const onSubmit = async (data) => {
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      alert('注册成功!');
    } catch (error) {
      alert('注册失败: ' + error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="complete-form">
      <section>
        <h3>个人信息</h3>
        
        <input {...register('personal.firstName')} placeholder="名" />
        {errors.personal?.firstName && (
          <span className="error">{errors.personal.firstName.message}</span>
        )}
        
        <input {...register('personal.lastName')} placeholder="姓" />
        {errors.personal?.lastName && (
          <span className="error">{errors.personal.lastName.message}</span>
        )}
        
        <input {...register('personal.email')} placeholder="邮箱" />
        {errors.personal?.email && (
          <span className="error">{errors.personal.email.message}</span>
        )}
        
        <input {...register('personal.phone')} placeholder="手机号" />
        {errors.personal?.phone && (
          <span className="error">{errors.personal.phone.message}</span>
        )}
      </section>
      
      <section>
        <h3>账户信息</h3>
        
        <input {...register('account.username')} placeholder="用户名" />
        {errors.account?.username && (
          <span className="error">{errors.account.username.message}</span>
        )}
        
        <input
          type="password"
          {...register('account.password')}
          placeholder="密码"
        />
        {errors.account?.password && (
          <span className="error">{errors.account.password.message}</span>
        )}
        
        <input
          type="password"
          {...register('account.confirmPassword')}
          placeholder="确认密码"
        />
        {errors.account?.confirmPassword && (
          <span className="error">{errors.account.confirmPassword.message}</span>
        )}
      </section>
      
      <section>
        <h3>偏好设置</h3>
        
        <label>
          <input type="checkbox" {...register('preferences.newsletter')} />
          订阅新闻邮件
        </label>
        
        <label>
          <input type="checkbox" {...register('preferences.notifications')} />
          接收通知
        </label>
        
        <select {...register('preferences.language')}>
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </section>
      
      <label>
        <input type="checkbox" {...register('agreeToTerms')} />
        我已阅读并同意服务条款
      </label>
      {errors.agreeToTerms && (
        <span className="error">{errors.agreeToTerms.message}</span>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

## 总结

Yup验证库要点：

1. **成熟稳定**：广泛使用,社区支持好
2. **API简洁**：链式调用,易于理解
3. **功能丰富**：支持各种验证类型
4. **条件验证**：when方法实现动态验证
5. **引用字段**：ref方法实现字段间验证
6. **自定义验证**：test方法灵活扩展

Yup是React表单验证的经典选择,与React Hook Form配合使用效果很好。

## 第四部分：Yup高级技巧

### 4.1 高级Schema模式

```javascript
// 条件链式验证
const advancedConditionalSchema = yup.object({
  userType: yup.string().oneOf(['student', 'teacher', 'admin']),
  
  studentId: yup.string().when('userType', {
    is: 'student',
    then: schema => schema.required('学生ID必填').matches(/^S\d{6}$/, '格式：S + 6位数字'),
    otherwise: schema => schema.notRequired()
  }),
  
  teacherId: yup.string().when('userType', {
    is: 'teacher',
    then: schema => schema.required('教师ID必填').matches(/^T\d{6}$/, '格式：T + 6位数字'),
    otherwise: schema => schema.notRequired()
  }),
  
  adminLevel: yup.number().when('userType', {
    is: 'admin',
    then: schema => schema.required('管理员级别必填').min(1).max(5),
    otherwise: schema => schema.notRequired()
  }),
  
  // 多字段联合条件
  privilege: yup.string().when(['userType', 'adminLevel'], {
    is: (userType, adminLevel) => userType === 'admin' && adminLevel >= 3,
    then: schema => schema.required('高级管理员必须选择权限'),
    otherwise: schema => schema.notRequired()
  })
});

// 动态数组验证
const dynamicArraySchema = yup.object({
  items: yup.array().of(
    yup.object({
      type: yup.string().oneOf(['text', 'number', 'date']),
      value: yup.mixed().when('type', {
        is: 'text',
        then: schema => yup.string().required().min(1).max(100),
        otherwise: schema => yup.mixed()
      }).when('type', {
        is: 'number',
        then: schema => yup.number().required().positive(),
        otherwise: schema => yup.mixed()
      }).when('type', {
        is: 'date',
        then: schema => yup.date().required().max(new Date()),
        otherwise: schema => yup.mixed()
      })
    })
  ).min(1, '至少添加一项').max(10, '最多10项')
});

// 递归Schema
const recursiveSchema = yup.lazy(() => 
  yup.object({
    id: yup.string().required(),
    name: yup.string().required(),
    children: yup.array().of(recursiveSchema).default([])
  })
);

const treeSchema = yup.object({
  root: recursiveSchema
});
```

### 4.2 高级转换和预处理

```javascript
import * as yup from 'yup';

// 自定义转换方法
yup.addMethod(yup.string, 'trimmed', function() {
  return this.transform(value => value?.trim());
});

yup.addMethod(yup.string, 'normalized', function() {
  return this.transform(value => {
    if (!value) return value;
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
  });
});

yup.addMethod(yup.number, 'currency', function() {
  return this.transform((value, originalValue) => {
    if (typeof originalValue === 'string') {
      return parseFloat(originalValue.replace(/[^0-9.-]/g, ''));
    }
    return value;
  }).round(2);
});

yup.addMethod(yup.array, 'uniqueBy', function(key) {
  return this.test('unique', `${key}值必须唯一`, function(value) {
    if (!value || !Array.isArray(value)) return true;
    
    const seen = new Set();
    for (const item of value) {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return this.createError({
          path: this.path,
          message: `${key} "${keyValue}" 重复`
        });
      }
      seen.add(keyValue);
    }
    return true;
  });
});

// 使用自定义方法
const transformSchema = yup.object({
  username: yup.string().trimmed().normalized().required(),
  price: yup.number().currency().min(0).max(999999),
  items: yup.array().of(
    yup.object({
      id: yup.string().required(),
      name: yup.string().required()
    })
  ).uniqueBy('id')
});

// 复杂预处理
const preprocessSchema = yup.object({
  tags: yup.string().transform((value) => {
    if (!value) return [];
    return value.split(',').map(tag => tag.trim()).filter(Boolean);
  }).test('array-length', '至少1个标签，最多5个', function(value) {
    return Array.isArray(value) && value.length >= 1 && value.length <= 5;
  }),
  
  metadata: yup.string().transform((value) => {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }).nullable().test('valid-json-object', '必须是有效的JSON对象', function(value) {
    return value === null || (typeof value === 'object' && !Array.isArray(value));
  })
});
```

### 4.3 异步验证优化

```javascript
// 防抖异步验证
import { debounce } from 'lodash';

const createDebouncedTest = (testFn, delay = 500) => {
  const debouncedFn = debounce(testFn, delay);
  
  return function(value) {
    return new Promise((resolve, reject) => {
      debouncedFn.call(this, value, resolve, reject);
    });
  };
};

// 带缓存的异步验证
const createCachedAsyncTest = (testFn) => {
  const cache = new Map();
  
  return async function(value) {
    if (cache.has(value)) {
      return cache.get(value);
    }
    
    const result = await testFn.call(this, value);
    cache.set(value, result);
    
    // 限制缓存大小
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// 使用优化后的异步验证
const optimizedAsyncSchema = yup.object({
  username: yup.string()
    .required('用户名必填')
    .min(3, '至少3个字符')
    .test(
      'username-available',
      '用户名已被使用',
      createCachedAsyncTest(
        createDebouncedTest(async (value) => {
          const response = await fetch(`/api/check-username?username=${value}`);
          const data = await response.json();
          return data.available;
        })
      )
    ),
  
  email: yup.string()
    .email('邮箱格式不正确')
    .required('邮箱必填')
    .test(
      'email-available',
      '邮箱已被使用',
      createCachedAsyncTest(async (value) => {
        const response = await fetch(`/api/check-email?email=${value}`);
        const data = await response.json();
        return data.available;
      })
    )
});

// 并行异步验证
const parallelAsyncSchema = yup.object({
  username: yup.string().required(),
  email: yup.string().email().required()
}).test('parallel-check', '验证失败', async function(value) {
  const [usernameAvailable, emailAvailable] = await Promise.all([
    fetch(`/api/check-username?username=${value.username}`).then(r => r.json()),
    fetch(`/api/check-email?email=${value.email}`).then(r => r.json())
  ]);
  
  if (!usernameAvailable.available) {
    return this.createError({
      path: 'username',
      message: '用户名已被使用'
    });
  }
  
  if (!emailAvailable.available) {
    return this.createError({
      path: 'email',
      message: '邮箱已被使用'
    });
  }
  
  return true;
});
```

### 4.4 错误处理和国际化

```javascript
// 自定义错误消息函数
yup.setLocale({
  mixed: {
    default: '字段无效',
    required: '${path}是必填项',
    oneOf: '${path}必须是以下值之一：${values}',
    notOneOf: '${path}不能是以下值之一：${values}'
  },
  string: {
    length: '${path}必须正好${length}个字符',
    min: '${path}至少${min}个字符',
    max: '${path}最多${max}个字符',
    email: '${path}必须是有效的邮箱',
    url: '${path}必须是有效的URL',
    trim: '${path}不能包含前导或尾随空格',
    lowercase: '${path}必须是小写',
    uppercase: '${path}必须是大写'
  },
  number: {
    min: '${path}必须大于或等于${min}',
    max: '${path}必须小于或等于${max}',
    lessThan: '${path}必须小于${less}',
    moreThan: '${path}必须大于${more}',
    positive: '${path}必须是正数',
    negative: '${path}必须是负数',
    integer: '${path}必须是整数'
  },
  date: {
    min: '${path}必须晚于${min}',
    max: '${path}必须早于${max}'
  },
  array: {
    min: '${path}至少${min}项',
    max: '${path}最多${max}项',
    length: '${path}必须有${length}项'
  }
});

// i18n集成
import { useTranslation } from 'react-i18next';

function useYupLocale() {
  const { t } = useTranslation();
  
  useEffect(() => {
    yup.setLocale({
      mixed: {
        required: ({ path }) => t('validation.required', { field: path })
      },
      string: {
        email: ({ path }) => t('validation.email', { field: path }),
        min: ({ path, min }) => t('validation.min', { field: path, min })
      }
    });
  }, [t]);
}

// 错误格式化
function formatYupErrors(error) {
  if (error.inner && error.inner.length > 0) {
    return error.inner.reduce((acc, err) => {
      acc[err.path] = err.message;
      return acc;
    }, {});
  }
  
  return { [error.path]: error.message };
}

// 自定义错误处理器
class ValidationErrorHandler {
  constructor() {
    this.errors = {};
    this.touched = new Set();
  }
  
  addError(path, message) {
    this.errors[path] = message;
  }
  
  clearError(path) {
    delete this.errors[path];
  }
  
  touch(path) {
    this.touched.add(path);
  }
  
  shouldShowError(path) {
    return this.touched.has(path) && this.errors[path];
  }
  
  getError(path) {
    return this.shouldShowError(path) ? this.errors[path] : null;
  }
  
  clear() {
    this.errors = {};
    this.touched.clear();
  }
}
```

### 4.5 性能优化技巧

```javascript
// Schema缓存
const schemaCache = new WeakMap();

function getCachedSchema(key, createFn) {
  if (!schemaCache.has(key)) {
    schemaCache.set(key, createFn());
  }
  return schemaCache.get(key);
}

// 部分验证
async function validateFields(schema, data, fields) {
  try {
    // 只验证指定字段
    const fieldSchemas = fields.reduce((acc, field) => {
      if (schema.fields[field]) {
        acc[field] = schema.fields[field];
      }
      return acc;
    }, {});
    
    const partialSchema = yup.object(fieldSchemas);
    await partialSchema.validate(data, { abortEarly: false });
    
    return { valid: true, errors: {} };
  } catch (error) {
    return { valid: false, errors: formatYupErrors(error) };
  }
}

// 增量验证Hook
function useIncrementalValidation(schema) {
  const [errors, setErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState(new Set());
  
  const validateField = useCallback(async (fieldName, value) => {
    try {
      const fieldSchema = schema.fields[fieldName];
      if (!fieldSchema) return;
      
      await fieldSchema.validate(value);
      
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      
      setValidatedFields(prev => new Set([...prev, fieldName]));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }));
      
      setValidatedFields(prev => {
        const next = new Set(prev);
        next.delete(fieldName);
        return next;
      });
    }
  }, [schema]);
  
  return { errors, validatedFields, validateField };
}

// 智能验证策略
function useSmartValidation(schema) {
  const [validationMode, setValidationMode] = useState('onSubmit');
  const previousErrors = useRef({});
  
  const validate = useCallback(async (data) => {
    try {
      await schema.validate(data, { abortEarly: false });
      previousErrors.current = {};
      return { valid: true, errors: {} };
    } catch (error) {
      const errors = formatYupErrors(error);
      
      // 如果有错误，切换到实时验证
      if (Object.keys(errors).length > 0 && validationMode === 'onSubmit') {
        setValidationMode('onChange');
      }
      
      previousErrors.current = errors;
      return { valid: false, errors };
    }
  }, [schema, validationMode]);
  
  const validateField = useCallback(async (fieldName, value) => {
    // 只在有过错误的字段上进行实时验证
    if (!previousErrors.current[fieldName] && validationMode === 'onSubmit') {
      return;
    }
    
    try {
      await schema.fields[fieldName]?.validate(value);
      delete previousErrors.current[fieldName];
    } catch (error) {
      previousErrors.current[fieldName] = error.message;
    }
  }, [schema, validationMode]);
  
  return { validate, validateField, validationMode };
}
```

### 4.6 实战综合案例

```javascript
// 复杂注册表单
const registrationSchema = yup.object({
  // 基本信息
  personalInfo: yup.object({
    firstName: yup.string()
      .required('名字必填')
      .matches(/^[a-zA-Z\u4e00-\u9fa5]+$/, '只能包含字母或汉字'),
    
    lastName: yup.string()
      .required('姓氏必填')
      .matches(/^[a-zA-Z\u4e00-\u9fa5]+$/, '只能包含字母或汉字'),
    
    birthDate: yup.date()
      .required('出生日期必填')
      .max(new Date(), '出生日期不能是未来')
      .test('age', '必须年满18岁', function(value) {
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        return age >= 18;
      }),
    
    gender: yup.string()
      .required('性别必填')
      .oneOf(['male', 'female', 'other'], '请选择有效的性别')
  }),
  
  // 联系方式
  contactInfo: yup.object({
    email: yup.string()
      .required('邮箱必填')
      .email('邮箱格式不正确')
      .test('email-domain', '只允许特定域名', (value) => {
        const allowedDomains = ['gmail.com', 'outlook.com', 'company.com'];
        const domain = value?.split('@')[1];
        return allowedDomains.includes(domain);
      }),
    
    phone: yup.string()
      .required('手机号必填')
      .matches(/^1[3-9]\d{9}$/, '手机号格式不正确'),
    
    alternatePhone: yup.string()
      .notRequired()
      .when('phone', {
        is: (value) => value && value.length > 0,
        then: schema => schema.test(
          'different-from-primary',
          '备用号码不能与主号码相同',
          function(value) {
            return !value || value !== this.parent.phone;
          }
        )
      })
  }),
  
  // 地址信息
  addressInfo: yup.object({
    country: yup.string().required('国家必填'),
    
    province: yup.string().when('country', {
      is: 'China',
      then: schema => schema.required('省份必填'),
      otherwise: schema => schema.notRequired()
    }),
    
    city: yup.string().required('城市必填'),
    
    zipCode: yup.string().when('country', {
      is: 'China',
      then: schema => schema.matches(/^\d{6}$/, '邮编必须是6位数字'),
      otherwise: schema => schema.matches(/^[A-Za-z0-9\s-]{3,10}$/, '邮编格式不正确')
    })
  }),
  
  // 账号设置
  accountSettings: yup.object({
    username: yup.string()
      .required('用户名必填')
      .min(3, '用户名至少3个字符')
      .max(20, '用户名最多20个字符')
      .matches(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线')
      .test(
        'username-available',
        '用户名已被使用',
        createCachedAsyncTest(async (value) => {
          const response = await fetch(`/api/check-username?username=${value}`);
          const data = await response.json();
          return data.available;
        })
      ),
    
    password: yup.string()
      .required('密码必填')
      .min(8, '密码至少8个字符')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        '密码必须包含大小写字母、数字和特殊字符'
      ),
    
    confirmPassword: yup.string()
      .required('请确认密码')
      .oneOf([yup.ref('password')], '两次密码不一致')
  }),
  
  // 附加信息
  additionalInfo: yup.object({
    referralCode: yup.string()
      .notRequired()
      .matches(/^REF-\d{6}$/, '推荐码格式：REF-XXXXXX'),
    
    interests: yup.array()
      .of(yup.string())
      .min(1, '至少选择1个兴趣')
      .max(5, '最多选择5个兴趣'),
    
    agreedToTerms: yup.boolean()
      .oneOf([true], '必须同意服务条款'),
    
    newsletter: yup.boolean().default(false)
  })
});

function ComplexRegistrationForm() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(registrationSchema)
  });
  
  const country = watch('addressInfo.country');
  
  const onSubmit = async (data) => {
    console.log('注册数据:', data);
    
    // 提交到服务器
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
      {/* 基本信息 */}
      <section>
        <h2>基本信息</h2>
        <input {...register('personalInfo.firstName')} placeholder="名字" />
        {errors.personalInfo?.firstName && (
          <span className="error">{errors.personalInfo.firstName.message}</span>
        )}
        
        <input {...register('personalInfo.lastName')} placeholder="姓氏" />
        <input {...register('personalInfo.birthDate')} type="date" />
        <select {...register('personalInfo.gender')}>
          <option value="">选择性别</option>
          <option value="male">男</option>
          <option value="female">女</option>
          <option value="other">其他</option>
        </select>
      </section>
      
      {/* 联系方式 */}
      <section>
        <h2>联系方式</h2>
        <input {...register('contactInfo.email')} type="email" placeholder="邮箱" />
        <input {...register('contactInfo.phone')} placeholder="手机号" />
        <input {...register('contactInfo.alternatePhone')} placeholder="备用号码（可选）" />
      </section>
      
      {/* 地址信息 */}
      <section>
        <h2>地址信息</h2>
        <select {...register('addressInfo.country')}>
          <option value="">选择国家</option>
          <option value="China">中国</option>
          <option value="USA">美国</option>
        </select>
        
        {country === 'China' && (
          <input {...register('addressInfo.province')} placeholder="省份" />
        )}
        
        <input {...register('addressInfo.city')} placeholder="城市" />
        <input {...register('addressInfo.zipCode')} placeholder="邮编" />
      </section>
      
      {/* 账号设置 */}
      <section>
        <h2>账号设置</h2>
        <input {...register('accountSettings.username')} placeholder="用户名" />
        <input {...register('accountSettings.password')} type="password" placeholder="密码" />
        <input {...register('accountSettings.confirmPassword')} type="password" placeholder="确认密码" />
      </section>
      
      {/* 附加信息 */}
      <section>
        <h2>附加信息</h2>
        <input {...register('additionalInfo.referralCode')} placeholder="推荐码（可选）" />
        
        <label>
          <input type="checkbox" {...register('additionalInfo.agreedToTerms')} />
          我同意服务条款
        </label>
        
        <label>
          <input type="checkbox" {...register('additionalInfo.newsletter')} />
          订阅新闻通讯
        </label>
      </section>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

## Yup最佳实践总结

### 核心技巧
```
1. Schema设计
   ✅ 模块化组织Schema
   ✅ 使用when实现条件验证
   ✅ ref引用其他字段值

2. 性能优化
   ✅ 缓存Schema实例
   ✅ 部分验证减少开销
   ✅ 异步验证防抖和缓存

3. 错误处理
   ✅ 自定义locale
   ✅ 格式化错误信息
   ✅ i18n国际化支持

4. 自定义扩展
   ✅ addMethod添加方法
   ✅ transform数据转换
   ✅ test自定义验证

5. 实战技巧
   ✅ 智能验证策略
   ✅ 增量验证优化
   ✅ 复杂表单拆分
```

Yup凭借其成熟稳定和丰富的功能,仍然是React表单验证的优秀选择。
