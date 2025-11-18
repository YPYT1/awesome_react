# Joi验证库

## 概述

Joi是一个强大的数据验证库,最初为Node.js设计,现在也可以在浏览器中使用。Joi提供了描述性的API和丰富的验证规则,虽然在React生态中不如Yup和Zod流行,但在某些场景下仍是优秀的选择。本文将介绍Joi在React表单验证中的应用。

## 安装和基础配置

### 安装

```bash
# npm
npm install joi @hookform/resolvers

# yarn
yarn add joi @hookform/resolvers

# pnpm
pnpm add joi @hookform/resolvers
```

### 基础使用

```jsx
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';

// 定义schema
const schema = Joi.object({
  username: Joi.string().min(3).required().messages({
    'string.min': '用户名至少3个字符',
    'any.required': '用户名不能为空',
  }),
  email: Joi.string().email({ tlds: { allow: false } }).required().messages({
    'string.email': '邮箱格式不正确',
    'any.required': '邮箱不能为空',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': '密码至少8个字符',
    'any.required': '密码不能为空',
  }),
});

function BasicJoiForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(schema),
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

## Joi基础类型

### 字符串验证

```jsx
import Joi from 'joi';

const stringSchema = Joi.object({
  // 基本字符串
  basic: Joi.string(),
  
  // 必填
  required: Joi.string().required(),
  
  // 长度限制
  minLength: Joi.string().min(3),
  maxLength: Joi.string().max(20),
  exactLength: Joi.string().length(10),
  
  // 邮箱
  email: Joi.string().email({ tlds: { allow: false } }),
  
  // URI
  uri: Joi.string().uri(),
  
  // 域名
  domain: Joi.string().domain(),
  
  // IP地址
  ip: Joi.string().ip(),
  
  // 正则表达式
  pattern: Joi.string().pattern(/^[a-zA-Z0-9_]+$/),
  
  // 字母数字
  alphanum: Joi.string().alphanum(),
  
  // 大小写
  lowercase: Joi.string().lowercase(),
  uppercase: Joi.string().uppercase(),
  
  // trim
  trimmed: Joi.string().trim(),
  
  // 替换
  replaced: Joi.string().replace(/\s+/g, ' '),
  
  // 自定义错误消息
  withMessages: Joi.string().min(3).messages({
    'string.min': '至少3个字符',
    'string.empty': '不能为空',
  }),
});
```

### 数字验证

```jsx
import Joi from 'joi';

const numberSchema = Joi.object({
  // 基本数字
  basic: Joi.number(),
  
  // 必填
  required: Joi.number().required(),
  
  // 范围
  min: Joi.number().min(0),
  max: Joi.number().max(100),
  greater: Joi.number().greater(0),
  less: Joi.number().less(100),
  
  // 整数
  integer: Joi.number().integer(),
  
  // 正数/负数
  positive: Joi.number().positive(),
  negative: Joi.number().negative(),
  
  // 精度
  precision: Joi.number().precision(2), // 2位小数
  
  // 倍数
  multiple: Joi.number().multiple(5),
  
  // 端口号
  port: Joi.number().port(),
  
  // 自定义消息
  withMessages: Joi.number().min(18).messages({
    'number.min': '必须年满18岁',
  }),
});
```

### 布尔值验证

```jsx
import Joi from 'joi';

const booleanSchema = Joi.object({
  // 基本布尔值
  basic: Joi.boolean(),
  
  // 必须为true
  mustBeTrue: Joi.boolean().valid(true).required(),
  
  // 敏感转换(将字符串转为布尔)
  sensitive: Joi.boolean().sensitive(),
  
  // 真值列表
  truthy: Joi.boolean().truthy('yes', '1', 'true'),
  
  // 假值列表
  falsy: Joi.boolean().falsy('no', '0', 'false'),
});
```

### 日期验证

```jsx
import Joi from 'joi';

const dateSchema = Joi.object({
  // 基本日期
  basic: Joi.date(),
  
  // 必填
  required: Joi.date().required(),
  
  // 最小/最大日期
  minDate: Joi.date().min('now'),
  maxDate: Joi.date().max('2025-12-31'),
  
  // 大于/小于
  greater: Joi.date().greater('now'),
  less: Joi.date().less('2025-12-31'),
  
  // ISO格式
  iso: Joi.date().iso(),
  
  // 时间戳
  timestamp: Joi.date().timestamp('unix'), // 'javascript' | 'unix'
});
```

## 对象和嵌套验证

### 嵌套对象

```jsx
import Joi from 'joi';

const profileSchema = Joi.object({
  personal: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
  }),
  
  contact: Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    phone: Joi.string().pattern(/^\d{11}$/).required(),
  }),
  
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    zipCode: Joi.string().length(6).required(),
  }),
}).messages({
  'any.required': '此字段不能为空',
});

// 在表单中使用
function NestedObjectForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(profileSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('personal.firstName')} placeholder="名" />
      {errors.personal?.firstName && (
        <span>{errors.personal.firstName.message}</span>
      )}
      
      <input {...register('contact.email')} placeholder="邮箱" />
      {errors.contact?.email && (
        <span>{errors.contact.email.message}</span>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 可选和必填

```jsx
import Joi from 'joi';

const schema = Joi.object({
  // 必填
  required: Joi.string().required(),
  
  // 可选
  optional: Joi.string().optional(),
  
  // 默认值
  withDefault: Joi.string().default('默认值'),
  
  // 允许null
  allowNull: Joi.string().allow(null),
  
  // 允许空字符串
  allowEmpty: Joi.string().allow(''),
  
  // 禁止
  forbidden: Joi.forbidden(),
  
  // 条件必填
  conditionalRequired: Joi.when('accountType', {
    is: 'business',
    then: Joi.string().required(),
    otherwise: Joi.string().optional(),
  }),
});
```

## 数组验证

### 数组Schema

```jsx
import Joi from 'joi';
import { useFieldArray } from 'react-hook-form';

// 字符串数组
const tagsSchema = Joi.array()
  .items(Joi.string())
  .min(1)
  .max(10)
  .unique();

// 对象数组
const itemsSchema = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      quantity: Joi.number().integer().positive().required(),
      price: Joi.number().positive().required(),
    })
  )
  .min(1);

// 完整schema
const orderSchema = Joi.object({
  customerName: Joi.string().required(),
  tags: tagsSchema,
  items: itemsSchema,
});

function ArrayValidationForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(orderSchema),
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
      <input {...register('customerName')} placeholder="客户名称" />
      
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
import Joi from 'joi';

const arrayConstraints = Joi.object({
  // 最小/最大长度
  minItems: Joi.array().min(1),
  maxItems: Joi.array().max(10),
  
  // 精确长度
  exactLength: Joi.array().length(3),
  
  // 唯一值
  unique: Joi.array().unique(),
  
  // 有序
  ordered: Joi.array().ordered(
    Joi.string(),
    Joi.number(),
    Joi.boolean()
  ),
  
  // 稀疏数组
  sparse: Joi.array().sparse(),
  
  // 单一类型
  single: Joi.array().single(),
});
```

## 条件验证

### when条件

```jsx
import Joi from 'joi';

const conditionalSchema = Joi.object({
  accountType: Joi.string().valid('personal', 'business').required(),
  
  // 简单条件
  companyName: Joi.when('accountType', {
    is: 'business',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
  
  // 多个条件
  taxId: Joi.when('accountType', {
    is: 'business',
    then: Joi.string().required(),
  }),
  
  // 复杂条件
  discount: Joi.when(Joi.object({
    accountType: Joi.string().valid('business'),
    isPremium: Joi.boolean().valid(true),
  }).unknown(), {
    then: Joi.number().min(10),
  }),
  
  // 引用其他字段
  endDate: Joi.date().when('startDate', {
    is: Joi.date().required(),
    then: Joi.date().min(Joi.ref('startDate')),
  }),
});

function ConditionalForm() {
  const { register, watch, handleSubmit, formState: { errors } } = useForm({
    resolver: joiResolver(conditionalSchema),
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
        </>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### alternatives替代方案

```jsx
import Joi from 'joi';

const alternativesSchema = Joi.object({
  // 联合类型
  stringOrNumber: Joi.alternatives().try(
    Joi.string(),
    Joi.number()
  ),
  
  // 条件替代
  contactMethod: Joi.alternatives()
    .conditional('contactType', {
      switch: [
        { is: 'email', then: Joi.string().email() },
        { is: 'phone', then: Joi.string().pattern(/^\d{11}$/) },
        { is: 'address', then: Joi.string().min(10) },
      ],
    }),
});
```

## 自定义验证

### custom方法

```jsx
import Joi from 'joi';

const customSchema = Joi.object({
  username: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (value === 'admin') {
        return helpers.error('custom.notAdmin');
      }
      
      if (value.includes(' ')) {
        return helpers.error('custom.noSpaces');
      }
      
      return value;
    })
    .messages({
      'custom.notAdmin': '不能使用admin作为用户名',
      'custom.noSpaces': '用户名不能包含空格',
    }),
  
  password: Joi.string()
    .required()
    .custom((value, helpers) => {
      const hasUpper = /[A-Z]/.test(value);
      const hasLower = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*]/.test(value);
      
      if (!(hasUpper && hasLower && hasNumber && hasSpecial)) {
        return helpers.error('custom.weakPassword');
      }
      
      return value;
    })
    .messages({
      'custom.weakPassword': '密码必须包含大小写字母、数字和特殊字符',
    }),
});
```

### external异步验证

```jsx
import Joi from 'joi';

const asyncSchema = Joi.object({
  username: Joi.string()
    .required()
    .external(async (value) => {
      const response = await fetch(`/api/check-username?username=${value}`);
      const data = await response.json();
      
      if (!data.available) {
        throw new Error('该用户名已被使用');
      }
      
      return value;
    }),
  
  email: Joi.string()
    .email()
    .external(async (value) => {
      const response = await fetch(`/api/check-email?email=${value}`);
      const data = await response.json();
      
      if (!data.available) {
        throw new Error('该邮箱已被注册');
      }
      
      return value;
    }),
});

// 使用异步验证
function AsyncValidationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValidating },
  } = useForm({
    resolver: joiResolver(asyncSchema),
    mode: 'onBlur',
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('username')} />
      {isValidating && <span>验证中...</span>}
      {errors.username && <span>{errors.username.message}</span>}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 引用和依赖

### ref引用

```jsx
import Joi from 'joi';

const refSchema = Joi.object({
  password: Joi.string().min(8).required(),
  
  // 引用password字段
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      'any.only': '密码不匹配',
    }),
  
  // 日期比较
  startDate: Joi.date().required(),
  
  endDate: Joi.date()
    .required()
    .min(Joi.ref('startDate'))
    .messages({
      'date.min': '结束日期不能早于开始日期',
    }),
  
  // 数字比较
  minPrice: Joi.number().positive(),
  
  maxPrice: Joi.number()
    .positive()
    .greater(Joi.ref('minPrice'))
    .messages({
      'number.greater': '最大价格必须大于最小价格',
    }),
  
  // 复杂引用
  discountPercentage: Joi.number()
    .min(0)
    .max(Joi.ref('maxDiscount', {
      adjust: (value) => value * 100,
    })),
});
```

## 错误消息定制

### 自定义消息

```jsx
import Joi from 'joi';

// 全局消息
const schema = Joi.object({
  username: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(18).max(100).required(),
}).messages({
  'string.min': '{#label}至少{#limit}个字符',
  'string.max': '{#label}最多{#limit}个字符',
  'string.email': '请输入有效的邮箱地址',
  'number.min': '{#label}不能小于{#limit}',
  'number.max': '{#label}不能大于{#limit}',
  'any.required': '{#label}不能为空',
});

// 字段级消息
const detailedSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': '密码至少8个字符',
      'string.pattern.base': '密码必须包含大小写字母和数字',
      'any.required': '密码不能为空',
    }),
});

// 自定义标签
const labeledSchema = Joi.object({
  username: Joi.string()
    .label('用户名')
    .min(3)
    .messages({
      'string.min': '{#label}至少3个字符',
    }),
  
  email: Joi.string()
    .label('邮箱地址')
    .email()
    .messages({
      'string.email': '{#label}格式不正确',
    }),
});
```

## 实战案例

### 完整表单验证

```jsx
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import Joi from 'joi';

// 定义schema
const schema = Joi.object({
  personal: Joi.object({
    firstName: Joi.string().required().label('名'),
    lastName: Joi.string().required().label('姓'),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .label('邮箱'),
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .required()
      .label('手机号'),
  }),
  
  account: Joi.object({
    username: Joi.string()
      .min(3)
      .max(20)
      .pattern(/^[a-zA-Z0-9_]+$/)
      .required()
      .label('用户名')
      .messages({
        'string.pattern.base': '只能包含字母、数字和下划线',
      }),
    
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .label('密码')
      .messages({
        'string.pattern.base': '密码必须包含大小写字母和数字',
      }),
    
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('password'))
      .label('确认密码')
      .messages({
        'any.only': '密码不匹配',
      }),
  }),
  
  preferences: Joi.object({
    newsletter: Joi.boolean().default(false),
    language: Joi.string().valid('zh', 'en').default('zh'),
  }),
  
  agreeToTerms: Joi.boolean()
    .valid(true)
    .required()
    .messages({
      'any.only': '请同意服务条款',
    }),
}).messages({
  'any.required': '{#label}不能为空',
  'string.min': '{#label}至少{#limit}个字符',
  'string.max': '{#label}最多{#limit}个字符',
});

function CompleteForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: joiResolver(schema),
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
        
        <input {...register('personal.email')} placeholder="邮箱" />
        {errors.personal?.email && (
          <span className="error">{errors.personal.email.message}</span>
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

Joi验证库要点：

1. **功能丰富**：提供全面的验证规则
2. **描述性API**：链式调用,易于阅读
3. **条件验证**：when和alternatives灵活控制
4. **异步验证**：external方法支持异步
5. **引用字段**：ref实现字段间验证
6. **自定义消息**：灵活的错误消息系统

Joi是功能强大的验证库,适合复杂的验证场景。

## 第四部分：Joi高级应用

### 4.1 高级Schema模式

```javascript
import Joi from 'joi';

// 动态条件验证
const advancedConditionalSchema = Joi.object({
  userType: Joi.string().valid('student', 'teacher', 'admin').required(),
  
  // 基于userType的条件字段
  studentId: Joi.when('userType', {
    is: 'student',
    then: Joi.string().pattern(/^S\d{6}$/).required().messages({
      'string.pattern.base': '学生ID格式：S + 6位数字'
    }),
    otherwise: Joi.forbidden()
  }),
  
  teacherId: Joi.when('userType', {
    is: 'teacher',
    then: Joi.string().pattern(/^T\d{6}$/).required(),
    otherwise: Joi.forbidden()
  }),
  
  // 多条件联合验证
  adminLevel: Joi.when('userType', {
    is: 'admin',
    then: Joi.number().integer().min(1).max(5).required(),
    otherwise: Joi.forbidden()
  }),
  
  privilege: Joi.when(
    Joi.ref('userType'),
    {
      is: 'admin',
      then: Joi.when(Joi.ref('adminLevel'), {
        is: Joi.number().min(3),
        then: Joi.string().required().messages({
          'any.required': '高级管理员必须选择权限'
        }),
        otherwise: Joi.optional()
      }),
      otherwise: Joi.forbidden()
    }
  )
});

// Alternatives复杂分支
const polymorphicSchema = Joi.object({
  type: Joi.string().valid('text', 'number', 'date', 'file').required(),
  
  value: Joi.alternatives().conditional('type', {
    switch: [
      {
        is: 'text',
        then: Joi.string().min(1).max(1000)
      },
      {
        is: 'number',
        then: Joi.number().precision(2)
      },
      {
        is: 'date',
        then: Joi.date().max('now')
      },
      {
        is: 'file',
        then: Joi.object({
          filename: Joi.string().required(),
          size: Joi.number().max(10 * 1024 * 1024), // 10MB
          mimeType: Joi.string().valid('image/jpeg', 'image/png', 'application/pdf')
        })
      }
    ],
    otherwise: Joi.forbidden()
  })
});

// 递归Schema
const recursiveSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  children: Joi.array().items(Joi.link('#node')).default([])
}).id('node');

const treeSchema = Joi.object({
  root: recursiveSchema
});

// 动态数组验证
const dynamicListSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('product', 'service').required(),
      
      // 产品特定字段
      sku: Joi.when('type', {
        is: 'product',
        then: Joi.string().pattern(/^[A-Z]{3}-\d{6}$/).required(),
        otherwise: Joi.forbidden()
      }),
      
      quantity: Joi.when('type', {
        is: 'product',
        then: Joi.number().integer().min(1).max(9999).required(),
        otherwise: Joi.forbidden()
      }),
      
      // 服务特定字段
      duration: Joi.when('type', {
        is: 'service',
        then: Joi.number().min(0.5).max(24).required(),
        otherwise: Joi.forbidden()
      }),
      
      hourlyRate: Joi.when('type', {
        is: 'service',
        then: Joi.number().precision(2).min(0).required(),
        otherwise: Joi.forbidden()
      }),
      
      // 通用字段
      price: Joi.number().precision(2).positive().required(),
      description: Joi.string().max(500).optional()
    })
  ).min(1).max(100).unique('sku')
});
```

### 4.2 高级转换和预处理

```javascript
// 自定义扩展方法
const customJoi = Joi.extend((joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.creditCard': '{{#label}} 必须是有效的信用卡号'
  },
  rules: {
    creditCard: {
      validate(value, helpers) {
        // Luhn算法验证信用卡号
        const digits = value.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) {
          return helpers.error('string.creditCard');
        }
        
        let sum = 0;
        let isEven = false;
        
        for (let i = digits.length - 1; i >= 0; i--) {
          let digit = parseInt(digits[i]);
          
          if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          
          sum += digit;
          isEven = !isEven;
        }
        
        if (sum % 10 !== 0) {
          return helpers.error('string.creditCard');
        }
        
        return value;
      }
    }
  }
}));

// 扩展自定义phone验证
const extendedJoi = customJoi.extend((joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.phone': '{{#label}} 必须是有效的手机号',
    'string.phone.country': '{{#label}} 必须是{{#country}}的手机号'
  },
  rules: {
    phone: {
      method(country) {
        return this.$_addRule({ name: 'phone', args: { country } });
      },
      args: [
        {
          name: 'country',
          assert: joi.string().valid('CN', 'US', 'UK'),
          message: '不支持的国家代码'
        }
      ],
      validate(value, helpers, args) {
        const patterns = {
          CN: /^1[3-9]\d{9}$/,
          US: /^\+?1?\d{10}$/,
          UK: /^\+?44\d{10}$/
        };
        
        const pattern = patterns[args.country || 'CN'];
        
        if (!pattern.test(value)) {
          return helpers.error('string.phone.country', { country: args.country });
        }
        
        return value;
      }
    }
  }
}));

// 使用自定义扩展
const paymentSchema = Joi.object({
  cardNumber: customJoi.string().creditCard().required(),
  phone: extendedJoi.string().phone('CN').required()
});

// 预处理和转换
const transformSchema = Joi.object({
  // 自动trim和转小写
  username: Joi.string()
    .trim()
    .lowercase()
    .alphanum()
    .min(3)
    .max(20)
    .required(),
  
  // 数值字符串转数字
  price: Joi.number()
    .custom((value, helpers) => {
      if (typeof value === 'string') {
        const cleaned = value.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned);
      }
      return value;
    })
    .precision(2)
    .positive(),
  
  // 日期字符串转Date对象
  birthDate: Joi.date()
    .custom((value, helpers) => {
      if (typeof value === 'string') {
        return new Date(value);
      }
      return value;
    })
    .max('now'),
  
  // JSON字符串解析
  metadata: Joi.string()
    .custom((value, helpers) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        return helpers.error('any.invalid');
      }
    })
    .optional(),
  
  // 标签字符串分割为数组
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()),
      Joi.string().custom((value, helpers) => {
        return value.split(',').map(tag => tag.trim()).filter(Boolean);
      })
    )
    .required()
});
```

### 4.3 异步验证优化

```javascript
// 防抖异步验证
const debounce = (fn, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

// 缓存异步验证结果
const createCachedValidator = (validator) => {
  const cache = new Map();
  const maxCacheSize = 100;
  
  return async (value) => {
    if (cache.has(value)) {
      return cache.get(value);
    }
    
    const result = await validator(value);
    
    cache.set(value, result);
    
    if (cache.size > maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// 优化后的异步Schema
const optimizedAsyncSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(20)
    .required()
    .external(
      createCachedValidator(
        debounce(async (value) => {
          const response = await fetch(`/api/check-username?username=${value}`);
          const data = await response.json();
          
          if (!data.available) {
            throw new Error('用户名已被使用');
          }
        }, 500)
      )
    ),
  
  email: Joi.string()
    .email()
    .required()
    .external(
      createCachedValidator(async (value) => {
        const response = await fetch(`/api/check-email?email=${value}`);
        const data = await response.json();
        
        if (!data.available) {
          throw new Error('邮箱已被使用');
        }
      })
    )
});

// 并行异步验证
const parallelAsyncSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required()
}).external(async (value) => {
  const [usernameCheck, emailCheck] = await Promise.all([
    fetch(`/api/check-username?username=${value.username}`).then(r => r.json()),
    fetch(`/api/check-email?email=${value.email}`).then(r => r.json())
  ]);
  
  const errors = [];
  
  if (!usernameCheck.available) {
    errors.push({
      message: '用户名已被使用',
      path: ['username'],
      type: 'external'
    });
  }
  
  if (!emailCheck.available) {
    errors.push({
      message: '邮箱已被使用',
      path: ['email'],
      type: 'external'
    });
  }
  
  if (errors.length > 0) {
    throw new Joi.ValidationError('验证失败', errors, value);
  }
});

// 条件异步验证
const conditionalAsyncSchema = Joi.object({
  accountType: Joi.string().valid('email', 'phone').required(),
  
  identifier: Joi.string()
    .required()
    .external(async (value, helpers) => {
      const { accountType } = helpers.state.ancestors[0];
      
      const endpoint = accountType === 'email'
        ? `/api/check-email?email=${value}`
        : `/api/check-phone?phone=${value}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (!data.available) {
        throw new Error(`${accountType === 'email' ? '邮箱' : '手机号'}已被使用`);
      }
    })
});
```

### 4.4 错误处理和国际化

```javascript
// 自定义错误消息
const customMessages = {
  'any.required': '{{#label}}是必填项',
  'any.invalid': '{{#label}}值无效',
  'string.base': '{{#label}}必须是文本',
  'string.empty': '{{#label}}不能为空',
  'string.min': '{{#label}}至少{{#limit}}个字符',
  'string.max': '{{#label}}最多{{#limit}}个字符',
  'string.email': '{{#label}}必须是有效的邮箱',
  'string.pattern.base': '{{#label}}格式不正确',
  'number.base': '{{#label}}必须是数字',
  'number.min': '{{#label}}最小值为{{#limit}}',
  'number.max': '{{#label}}最大值为{{#limit}}',
  'number.positive': '{{#label}}必须是正数',
  'date.base': '{{#label}}必须是有效日期',
  'date.max': '{{#label}}不能晚于{{#limit}}',
  'array.min': '{{#label}}至少{{#limit}}项',
  'array.max': '{{#label}}最多{{#limit}}项'
};

const schemaWithCustomMessages = Joi.object({
  username: Joi.string().min(3).max(20).required().messages(customMessages),
  email: Joi.string().email().required().messages(customMessages),
  age: Joi.number().min(18).max(100).required().messages(customMessages)
});

// i18n国际化
import i18n from 'i18next';

const createI18nMessages = (t) => ({
  'any.required': t('validation.required', { field: '{{#label}}' }),
  'string.min': t('validation.string.min', {
    field: '{{#label}}',
    min: '{{#limit}}'
  }),
  'string.email': t('validation.string.email', { field: '{{#label}}' })
  // ... 其他消息
});

function useJoiI18n() {
  return useMemo(() => {
    return createI18nMessages(i18n.t);
  }, [i18n.language]);
}

// 错误格式化
function formatJoiError(error) {
  if (!error.details) {
    return { message: error.message };
  }
  
  return error.details.reduce((acc, detail) => {
    const path = detail.path.join('.');
    acc[path] = detail.message;
    return acc;
  }, {});
}

// 自定义错误处理器
class JoiErrorHandler {
  constructor() {
    this.errors = new Map();
  }
  
  handleError(error, context = {}) {
    if (!error.isJoi) {
      throw error;
    }
    
    error.details.forEach(detail => {
      const path = detail.path.join('.');
      const message = this.interpolateMessage(detail.message, {
        ...detail.context,
        ...context
      });
      
      this.errors.set(path, {
        type: detail.type,
        message,
        value: detail.context.value
      });
    });
    
    return this.errors;
  }
  
  interpolateMessage(template, context) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const cleanKey = key.trim().replace(/^#/, '');
      return context[cleanKey] || match;
    });
  }
  
  getError(path) {
    return this.errors.get(path);
  }
  
  hasError(path) {
    return this.errors.has(path);
  }
  
  clearError(path) {
    this.errors.delete(path);
  }
  
  clearAll() {
    this.errors.clear();
  }
  
  toObject() {
    const result = {};
    this.errors.forEach((error, path) => {
      result[path] = error.message;
    });
    return result;
  }
}
```

### 4.5 性能优化策略

```javascript
// Schema缓存
const schemaCache = new Map();

function getCachedSchema(key, creator) {
  if (!schemaCache.has(key)) {
    schemaCache.set(key, creator());
  }
  return schemaCache.get(key);
}

// 部分验证
async function validatePartial(schema, data, fields) {
  const fieldsToValidate = {};
  
  fields.forEach(field => {
    if (field in data) {
      fieldsToValidate[field] = data[field];
    }
  });
  
  // 提取指定字段的Schema
  const partialSchema = Joi.object(
    Object.keys(schema.describe().keys)
      .filter(key => fields.includes(key))
      .reduce((acc, key) => {
        acc[key] = schema.extract(key);
        return acc;
      }, {})
  );
  
  return partialSchema.validateAsync(fieldsToValidate, {
    abortEarly: false
  });
}

// 增量验证Hook
function useIncrementalJoiValidation(schema) {
  const [errors, setErrors] = useState({});
  const [validatedFields, setValidatedFields] = useState(new Set());
  
  const validateField = useCallback(async (field, value) => {
    try {
      const fieldSchema = schema.extract(field);
      await fieldSchema.validateAsync(value);
      
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      
      setValidatedFields(prev => new Set([...prev, field]));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [field]: error.message
      }));
      
      setValidatedFields(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }
  }, [schema]);
  
  return { errors, validatedFields, validateField };
}

// 智能验证模式
function useSmartJoiValidation(schema) {
  const [mode, setMode] = useState('onSubmit');
  const errorHistory = useRef({});
  
  const validate = useCallback(async (data) => {
    try {
      await schema.validateAsync(data, { abortEarly: false });
      errorHistory.current = {};
      return { valid: true, errors: {} };
    } catch (error) {
      const errors = formatJoiError(error);
      
      // 如果有错误，切换到实时验证
      if (Object.keys(errors).length > 0 && mode === 'onSubmit') {
        setMode('onChange');
      }
      
      errorHistory.current = errors;
      return { valid: false, errors };
    }
  }, [schema, mode]);
  
  const validateField = useCallback(async (field, value) => {
    // 只对有错误历史的字段进行实时验证
    if (!errorHistory.current[field] && mode === 'onSubmit') {
      return;
    }
    
    try {
      const fieldSchema = schema.extract(field);
      await fieldSchema.validateAsync(value);
      delete errorHistory.current[field];
    } catch (error) {
      errorHistory.current[field] = error.message;
    }
  }, [schema, mode]);
  
  return { validate, validateField, mode };
}

// 延迟验证
const useDebouncedJoiValidation = (schema, delay = 300) => {
  const [errors, setErrors] = useState({});
  const timeoutRef = useRef();
  
  const validate = useCallback((data) => {
    clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      try {
        await schema.validateAsync(data, { abortEarly: false });
        setErrors({});
      } catch (error) {
        setErrors(formatJoiError(error));
      }
    }, delay);
  }, [schema, delay]);
  
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);
  
  return { errors, validate };
};
```

### 4.6 实战综合案例

```javascript
// 复杂电商订单Schema
const orderSchema = Joi.object({
  // 客户信息
  customer: Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      'string.min': '姓名至少2个字符',
      'any.required': '姓名是必填项'
    }),
    
    email: Joi.string().email().lowercase().required(),
    
    phone: extendedJoi.string().phone('CN').required()
  }).required(),
  
  // 送货地址
  shippingAddress: Joi.object({
    street: Joi.string().min(5).required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
    zipCode: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': '邮编必须是6位数字'
    }),
    isDefault: Joi.boolean().default(false)
  }).required(),
  
  // 账单地址
  billingAddress: Joi.alternatives().conditional(
    Joi.ref('useSameAddress'),
    {
      is: true,
      then: Joi.valid(Joi.ref('shippingAddress')),
      otherwise: Joi.object({
        street: Joi.string().min(5).required(),
        city: Joi.string().required(),
        province: Joi.string().required(),
        zipCode: Joi.string().pattern(/^\d{6}$/).required()
      })
    }
  ),
  
  useSameAddress: Joi.boolean().default(true),
  
  // 订单项
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      
      sku: Joi.string().pattern(/^[A-Z]{3}-\d{6}$/).required(),
      
      quantity: Joi.number().integer().min(1).max(999).required(),
      
      price: Joi.number().precision(2).positive().required(),
      
      discount: Joi.number().min(0).max(100).default(0),
      
      // 计算总价
      total: Joi.number().custom((value, helpers) => {
        const item = helpers.state.ancestors[0];
        const calculated = item.price * item.quantity * (1 - item.discount / 100);
        
        if (Math.abs(value - calculated) > 0.01) {
          return helpers.error('any.invalid');
        }
        
        return value;
      })
    })
  ).min(1).max(50).unique('sku').required(),
  
  // 支付方式
  paymentMethod: Joi.object({
    type: Joi.string().valid('credit_card', 'debit_card', 'alipay', 'wechat').required(),
    
    // 信用卡特定字段
    cardNumber: Joi.when('type', {
      is: Joi.string().valid('credit_card', 'debit_card'),
      then: customJoi.string().creditCard().required(),
      otherwise: Joi.forbidden()
    }),
    
    cardHolderName: Joi.when('type', {
      is: Joi.string().valid('credit_card', 'debit_card'),
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    }),
    
    expiryDate: Joi.when('type', {
      is: Joi.string().valid('credit_card', 'debit_card'),
      then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/\d{2}$/).required(),
      otherwise: Joi.forbidden()
    }),
    
    cvv: Joi.when('type', {
      is: Joi.string().valid('credit_card', 'debit_card'),
      then: Joi.string().pattern(/^\d{3,4}$/).required(),
      otherwise: Joi.forbidden()
    }),
    
    // 第三方支付账号
    accountId: Joi.when('type', {
      is: Joi.string().valid('alipay', 'wechat'),
      then: Joi.string().required(),
      otherwise: Joi.forbidden()
    })
  }).required(),
  
  // 优惠券
  couponCode: Joi.string().pattern(/^[A-Z0-9]{8}$/).optional(),
  
  // 备注
  notes: Joi.string().max(500).optional(),
  
  // 协议同意
  agreedToTerms: Joi.boolean().valid(true).required().messages({
    'any.only': '必须同意服务条款'
  })
  
}).custom((value, helpers) => {
  // 验证订单总额
  const itemsTotal = value.items.reduce((sum, item) => sum + item.total, 0);
  
  if (itemsTotal < 0.01) {
    return helpers.error('any.invalid', {
      message: '订单金额必须大于0'
    });
  }
  
  return value;
});

// 使用完整Schema
function ComplexOrderForm() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: joiResolver(orderSchema)
  });
  
  const useSameAddress = watch('useSameAddress');
  const paymentType = watch('paymentMethod.type');
  
  const onSubmit = async (data) => {
    console.log('订单数据:', data);
    
    // 提交订单
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 表单实现 */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '提交订单'}
      </button>
    </form>
  );
}
```

## Joi最佳实践总结

### 核心技巧
```
1. Schema设计
   ✅ 使用alternatives处理多态
   ✅ when实现条件验证
   ✅ link支持递归结构

2. 扩展能力
   ✅ extend自定义类型
   ✅ custom自定义验证逻辑
   ✅ external异步验证

3. 性能优化
   ✅ Schema缓存复用
   ✅ 部分验证减少开销
   ✅ 防抖和缓存异步验证

4. 错误处理
   ✅ 自定义错误消息
   ✅ 详细的错误路径
   ✅ i18n国际化支持

5. 实战技巧
   ✅ 智能验证策略
   ✅ 增量验证优化
   ✅ 复杂业务逻辑封装
```

Joi凭借其强大的功能和灵活性，特别适合需要复杂验证逻辑的大型应用。
