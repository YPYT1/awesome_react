# Zod Schema验证

## 概述

Zod是一个TypeScript优先的schema声明和验证库,它提供了类型安全的数据验证方案。Zod与React Hook Form结合使用,可以实现强大的类型推导和验证功能。本文将全面介绍Zod的核心概念和在React表单中的应用。

## 安装和基础配置

### 安装

```bash
# npm
npm install zod @hookform/resolvers

# yarn
yarn add zod @hookform/resolvers

# pnpm
pnpm add zod @hookform/resolvers
```

### 基础使用

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 定义schema
const schema = z.object({
  username: z.string().min(3, '用户名至少3个字符'),
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(8, '密码至少8个字符'),
});

// 推导TypeScript类型
type FormData = z.infer<typeof schema>;

function BasicZodForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = (data: FormData) => {
    console.log(data); // 类型安全
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

## Zod基础类型

### 原始类型

```jsx
import { z } from 'zod';

// 字符串
const stringSchema = z.string();
const stringWithMinMax = z.string().min(3).max(20);
const emailSchema = z.string().email();
const urlSchema = z.string().url();
const uuidSchema = z.string().uuid();

// 数字
const numberSchema = z.number();
const positiveNumber = z.number().positive();
const integerSchema = z.number().int();
const rangeNumber = z.number().min(0).max(100);

// 布尔值
const booleanSchema = z.boolean();

// 日期
const dateSchema = z.date();
const futureDate = z.date().min(new Date());

// 使用示例
const userSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  age: z.number().int().positive().max(120),
  isActive: z.boolean(),
  createdAt: z.date(),
});

type User = z.infer<typeof userSchema>;
```

### 字符串验证

```jsx
import { z } from 'zod';

const stringValidations = z.object({
  // 基本字符串
  basic: z.string(),
  
  // 长度限制
  minLength: z.string().min(3, '至少3个字符'),
  maxLength: z.string().max(20, '最多20个字符'),
  exactLength: z.string().length(10, '必须是10个字符'),
  
  // 邮箱
  email: z.string().email('邮箱格式不正确'),
  
  // URL
  url: z.string().url('URL格式不正确'),
  
  // UUID
  uuid: z.string().uuid('UUID格式不正确'),
  
  // 正则表达式
  regex: z.string().regex(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'),
  
  // 自定义验证
  custom: z.string().refine(
    (val) => !val.includes('admin'),
    { message: '不能包含admin' }
  ),
  
  // 非空字符串
  nonEmpty: z.string().min(1, '不能为空'),
  
  // trim后验证
  trimmed: z.string().trim().min(1, '不能为空白字符'),
  
  // 转换
  transformed: z.string().transform((val) => val.toLowerCase()),
});
```

### 数字验证

```jsx
import { z } from 'zod';

const numberValidations = z.object({
  // 基本数字
  basic: z.number(),
  
  // 范围
  min: z.number().min(0, '不能小于0'),
  max: z.number().max(100, '不能大于100'),
  range: z.number().min(0).max(100),
  
  // 整数
  int: z.number().int('必须是整数'),
  
  // 正数/负数
  positive: z.number().positive('必须是正数'),
  negative: z.number().negative('必须是负数'),
  nonNegative: z.number().nonnegative('不能是负数'),
  nonPositive: z.number().nonpositive('不能是正数'),
  
  // 有限数
  finite: z.number().finite('必须是有限数'),
  
  // 多个小数位
  decimal: z.number().multipleOf(0.01, '最多2位小数'),
  
  // 自定义验证
  custom: z.number().refine(
    (val) => val % 5 === 0,
    { message: '必须是5的倍数' }
  ),
});
```

## 对象和嵌套验证

### 对象Schema

```jsx
import { z } from 'zod';

// 基本对象
const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  age: z.number().int().positive(),
});

// 嵌套对象
const profileSchema = z.object({
  personal: z.object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.date(),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().regex(/^\d{11}$/, '手机号格式不正确'),
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().length(6),
  }),
});

// 类型推导
type Profile = z.infer<typeof profileSchema>;

// 在表单中使用
function NestedObjectForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Profile>({
    resolver: zodResolver(profileSchema),
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
import { z } from 'zod';

const schema = z.object({
  // 必填
  required: z.string(),
  
  // 可选
  optional: z.string().optional(),
  
  // 可选with默认值
  withDefault: z.string().default('默认值'),
  
  // nullable
  nullable: z.string().nullable(),
  
  // nullish (null | undefined)
  nullish: z.string().nullish(),
  
  // 可选并提供默认值
  optionalWithDefault: z.string().optional().default('默认'),
});

type FormData = z.infer<typeof schema>;
/* 
{
  required: string;
  optional?: string | undefined;
  withDefault: string;
  nullable: string | null;
  nullish?: string | null | undefined;
  optionalWithDefault: string;
}
*/
```

## 数组验证

### 数组Schema

```jsx
import { z } from 'zod';
import { useFieldArray } from 'react-hook-form';

// 字符串数组
const tagsSchema = z.array(z.string()).min(1, '至少一个标签');

// 对象数组
const itemsSchema = z.array(
  z.object({
    name: z.string().min(1, '名称不能为空'),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })
).min(1, '至少一个项目');

// 完整表单schema
const orderSchema = z.object({
  customerName: z.string(),
  tags: tagsSchema,
  items: itemsSchema,
});

type OrderFormData = z.infer<typeof orderSchema>;

function ArrayValidationForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
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
          
          <input
            type="number"
            {...register(`items.${index}.price`, {
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
      
      {errors.items?.message && (
        <span>{errors.items.message}</span>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 数组约束

```jsx
import { z } from 'zod';

const arrayConstraints = z.object({
  // 最小长度
  minItems: z.array(z.string()).min(1, '至少一项'),
  
  // 最大长度
  maxItems: z.array(z.string()).max(10, '最多10项'),
  
  // 长度范围
  rangeItems: z.array(z.string()).min(1).max(5),
  
  // 固定长度
  exactLength: z.array(z.string()).length(3, '必须是3项'),
  
  // 非空数组
  nonEmpty: z.array(z.string()).nonempty('不能为空数组'),
  
  // 唯一值
  unique: z.array(z.string()).refine(
    (arr) => new Set(arr).size === arr.length,
    { message: '不能有重复值' }
  ),
});
```

## 联合和枚举

### 枚举类型

```jsx
import { z } from 'zod';

// 字符串枚举
const roleEnum = z.enum(['admin', 'user', 'guest']);
type Role = z.infer<typeof roleEnum>; // 'admin' | 'user' | 'guest'

// 数字枚举
const statusEnum = z.nativeEnum({
  Pending: 0,
  Active: 1,
  Inactive: 2,
});

// 在schema中使用
const userSchema = z.object({
  username: z.string(),
  role: roleEnum,
  status: statusEnum,
});

// 表单使用
function EnumForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <select {...register('role')}>
        <option value="">选择角色</option>
        <option value="admin">管理员</option>
        <option value="user">用户</option>
        <option value="guest">访客</option>
      </select>
      {errors.role && <span>{errors.role.message}</span>}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 联合类型

```jsx
import { z } from 'zod';

// 基本联合
const stringOrNumber = z.union([z.string(), z.number()]);

// 区分联合(Discriminated Union)
const paymentSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('credit_card'),
    cardNumber: z.string().length(16),
    cvv: z.string().length(3),
  }),
  z.object({
    method: z.literal('paypal'),
    email: z.string().email(),
  }),
  z.object({
    method: z.literal('bank_transfer'),
    accountNumber: z.string(),
    bankCode: z.string(),
  }),
]);

type Payment = z.infer<typeof paymentSchema>;

function PaymentForm() {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Payment>({
    resolver: zodResolver(paymentSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <select
        {...register('method')}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="credit_card">信用卡</option>
        <option value="paypal">PayPal</option>
        <option value="bank_transfer">银行转账</option>
      </select>
      
      {paymentMethod === 'credit_card' && (
        <>
          <input {...register('cardNumber')} placeholder="卡号" />
          <input {...register('cvv')} placeholder="CVV" />
        </>
      )}
      
      {paymentMethod === 'paypal' && (
        <input {...register('email')} placeholder="PayPal邮箱" />
      )}
      
      {paymentMethod === 'bank_transfer' && (
        <>
          <input {...register('accountNumber')} placeholder="账号" />
          <input {...register('bankCode')} placeholder="银行代码" />
        </>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 自定义验证

### refine方法

```jsx
import { z } from 'zod';

const passwordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '密码不匹配',
    path: ['confirmPassword'], // 错误路径
  }
);

// 多个refine
const registrationSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
  age: z.number(),
})
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: '密码不匹配',
      path: ['confirmPassword'],
    }
  )
  .refine(
    (data) => data.age >= 18,
    {
      message: '必须年满18岁',
      path: ['age'],
    }
  );
```

### superRefine方法

```jsx
import { z } from 'zod';

const complexSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  type: z.enum(['hourly', 'daily']),
  rate: z.number(),
}).superRefine((data, ctx) => {
  // 多个验证条件
  if (data.endDate < data.startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '结束日期不能早于开始日期',
      path: ['endDate'],
    });
  }
  
  if (data.type === 'hourly' && data.rate > 1000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '时薪不能超过1000',
      path: ['rate'],
    });
  }
  
  if (data.type === 'daily' && data.rate < 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '日薪不能低于100',
      path: ['rate'],
    });
  }
});
```

### 异步验证

```jsx
import { z } from 'zod';

const asyncSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
}).refine(
  async (data) => {
    const response = await fetch(`/api/check-username?username=${data.username}`);
    const result = await response.json();
    return result.available;
  },
  {
    message: '该用户名已被使用',
    path: ['username'],
  }
);

// 在表单中使用异步验证
function AsyncValidationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValidating },
  } = useForm({
    resolver: zodResolver(asyncSchema),
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

## 转换和预处理

### transform方法

```jsx
import { z } from 'zod';

const transformSchema = z.object({
  // 转换为小写
  email: z.string().email().transform((val) => val.toLowerCase()),
  
  // 去除空格
  username: z.string().transform((val) => val.trim()),
  
  // 字符串转数字
  age: z.string().transform((val) => parseInt(val, 10)),
  
  // 数组转字符串
  tags: z.array(z.string()).transform((arr) => arr.join(',')),
  
  // 复杂转换
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .transform((val) => parseFloat(val)),
});

type TransformedData = z.infer<typeof transformSchema>;
```

### preprocess方法

```jsx
import { z } from 'zod';

const preprocessSchema = z.object({
  // 预处理输入
  date: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    },
    z.date()
  ),
  
  // 处理空字符串
  optionalString: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional()
  ),
  
  // 数字处理
  number: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        const num = parseFloat(val);
        return isNaN(num) ? undefined : num;
      }
      return val;
    },
    z.number()
  ),
});
```

## 实战案例

### 完整注册表单

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 定义schema
const registrationSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'),
  
  email: z.string()
    .email('邮箱格式不正确')
    .transform((val) => val.toLowerCase()),
  
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  
  password: z.string()
    .min(8, '密码至少8个字符')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  
  confirmPassword: z.string(),
  
  age: z.number()
    .int('年龄必须是整数')
    .min(18, '必须年满18岁')
    .max(100, '年龄不能超过100岁'),
  
  gender: z.enum(['male', 'female', 'other'], {
    required_error: '请选择性别',
  }),
  
  interests: z.array(z.string())
    .min(1, '至少选择一个兴趣')
    .max(5, '最多选择5个兴趣'),
  
  agreeToTerms: z.boolean()
    .refine((val) => val === true, {
      message: '请同意服务条款',
    }),
})
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: '密码不匹配',
      path: ['confirmPassword'],
    }
  );

type RegistrationFormData = z.infer<typeof registrationSchema>;

function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });
  
  const onSubmit = async (data: RegistrationFormData) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('注册失败');
      
      alert('注册成功!');
    } catch (error) {
      alert(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
      <h2>用户注册</h2>
      
      <div className="form-group">
        <label>用户名</label>
        <input {...register('username')} />
        {errors.username && (
          <span className="error">{errors.username.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>邮箱</label>
        <input type="email" {...register('email')} />
        {errors.email && (
          <span className="error">{errors.email.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>手机号</label>
        <input {...register('phone')} />
        {errors.phone && (
          <span className="error">{errors.phone.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>密码</label>
        <input type="password" {...register('password')} />
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>确认密码</label>
        <input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>年龄</label>
        <input
          type="number"
          {...register('age', { valueAsNumber: true })}
        />
        {errors.age && (
          <span className="error">{errors.age.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>性别</label>
        <select {...register('gender')}>
          <option value="">请选择</option>
          <option value="male">男</option>
          <option value="female">女</option>
          <option value="other">其他</option>
        </select>
        {errors.gender && (
          <span className="error">{errors.gender.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>兴趣爱好</label>
        <div className="checkbox-group">
          <label>
            <input type="checkbox" value="reading" {...register('interests')} />
            阅读
          </label>
          <label>
            <input type="checkbox" value="sports" {...register('interests')} />
            运动
          </label>
          <label>
            <input type="checkbox" value="music" {...register('interests')} />
            音乐
          </label>
        </div>
        {errors.interests && (
          <span className="error">{errors.interests.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>
          <input type="checkbox" {...register('agreeToTerms')} />
          我已阅读并同意服务条款
        </label>
        {errors.agreeToTerms && (
          <span className="error">{errors.agreeToTerms.message}</span>
        )}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

## 总结

Zod Schema验证要点：

1. **类型安全**：TypeScript优先,自动类型推导
2. **丰富的验证**：内置多种验证方法
3. **嵌套对象**：支持复杂的嵌套结构
4. **自定义验证**：refine和superRefine
5. **数据转换**：transform和preprocess
6. **与RHF集成**：通过zodResolver无缝集成

Zod提供了强大的类型安全验证方案,是React表单验证的理想选择。

## 第四部分：高级Zod应用

### 4.1 Zod高级转换

```typescript
// 数据预处理和转换
const transformSchema = z.object({
  // 字符串转数字
  age: z.string().transform(val => parseInt(val, 10)).pipe(
    z.number().min(18, '必须年满18岁')
  ),
  
  // 日期转换
  birthDate: z.string().transform(val => new Date(val)).pipe(
    z.date().max(new Date(), '出生日期不能是未来')
  ),
  
  // JSON字符串解析
  metadata: z.string().transform(val => {
    try {
      return JSON.parse(val);
    } catch {
      throw new Error('无效的JSON');
    }
  }).pipe(
    z.object({
      theme: z.enum(['light', 'dark']),
      language: z.string()
    })
  ),
  
  // 数组转换
  tags: z.string().transform(val => val.split(',').map(t => t.trim())).pipe(
    z.array(z.string().min(1))
  ),
  
  // 布尔值转换
  terms: z.union([z.boolean(), z.string()]).transform(val => 
    typeof val === 'string' ? val === 'true' : val
  ).pipe(z.literal(true, { message: '必须同意条款' }))
});

type TransformData = z.infer<typeof transformSchema>;

function TransformForm() {
  const { register, handleSubmit } = useForm<TransformData>({
    resolver: zodResolver(transformSchema)
  });
  
  const onSubmit = (data: TransformData) => {
    // data.age 是 number
    // data.birthDate 是 Date
    // data.metadata 是 object
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('age')} placeholder="年龄" />
      <input {...register('birthDate')} type="date" />
      <textarea {...register('metadata')} placeholder='{"theme":"dark","language":"zh"}' />
      <input {...register('tags')} placeholder="标签1, 标签2" />
      <input {...register('terms')} type="checkbox" value="true" />
      <button type="submit">提交</button>
    </form>
  );
}

// 管道链式转换
const pipelineSchema = z.object({
  price: z.string()
    .trim()
    .transform(val => val.replace(/[^0-9.]/g, ''))
    .pipe(z.string().regex(/^\d+\.?\d{0,2}$/, '价格格式不正确'))
    .transform(val => parseFloat(val))
    .pipe(z.number().positive('价格必须为正数').max(999999, '价格过高'))
});

// 条件转换
const conditionalTransformSchema = z.object({
  type: z.enum(['personal', 'business']),
  identifier: z.string()
}).transform((data) => {
  if (data.type === 'personal') {
    // 身份证号验证和格式化
    return {
      ...data,
      identifier: data.identifier.toUpperCase(),
      idType: 'ID_CARD'
    };
  } else {
    // 营业执照号验证和格式化
    return {
      ...data,
      identifier: data.identifier.replace(/-/g, ''),
      idType: 'BUSINESS_LICENSE'
    };
  }
});
```

### 4.2 复杂验证逻辑

```typescript
// 跨字段验证
const crossFieldSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword']
});

// 多条件refine
const complexRefineSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  duration: z.number()
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return days === data.duration;
}, {
  message: '日期范围与时长不匹配',
  path: ['duration']
}).refine(data => {
  return new Date(data.startDate) < new Date(data.endDate);
}, {
  message: '开始日期必须早于结束日期',
  path: ['endDate']
});

// superRefine用于复杂验证
const superRefineSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  age: z.number()
}).superRefine((data, ctx) => {
  // 用户名长度根据年龄调整
  const minLength = data.age < 18 ? 6 : 3;
  
  if (data.username.length < minLength) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `用户名至少${minLength}个字符`,
      path: ['username']
    });
  }
  
  // 邮箱域名验证
  const emailDomain = data.email.split('@')[1];
  const allowedDomains = ['example.com', 'company.com'];
  
  if (!allowedDomains.includes(emailDomain)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `只允许 ${allowedDomains.join(', ')} 域名`,
      path: ['email']
    });
  }
  
  // 年龄和用户名关联验证
  if (data.age < 13 && !data.username.startsWith('kid_')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '13岁以下用户名必须以 kid_ 开头',
      path: ['username']
    });
  }
});

// 异步验证
const asyncSchema = z.object({
  username: z.string().min(3)
}).refine(async (data) => {
  const response = await fetch(`/api/check-username?username=${data.username}`);
  const result = await response.json();
  return result.available;
}, {
  message: '用户名已被使用',
  path: ['username']
});

function AsyncValidationForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(asyncSchema)
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '验证中...' : '提交'}
      </button>
    </form>
  );
}
```

### 4.3 Schema复用和组合

```typescript
// 基础Schema复用
const userBaseSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email()
});

// 扩展Schema
const userRegistrationSchema = userBaseSchema.extend({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: '密码不一致',
  path: ['confirmPassword']
});

const userProfileSchema = userBaseSchema.extend({
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  socialLinks: z.object({
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    linkedin: z.string().url().optional()
  }).optional()
});

// Schema合并
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
  zipCode: z.string().regex(/^\d{5}$/)
});

const contactSchema = z.object({
  phone: z.string().regex(/^\d{10,11}$/),
  email: z.string().email()
});

const fullContactSchema = addressSchema.merge(contactSchema);

// Pick和Omit
const loginSchema = userRegistrationSchema.pick({
  username: true,
  password: true
});

const publicProfileSchema = userProfileSchema.omit({
  email: true
});

// Partial和Required
const updateProfileSchema = userProfileSchema.partial(); // 所有字段可选

const strictProfileSchema = userProfileSchema.required(); // 所有字段必填

// 嵌套Schema组合
const companySchema = z.object({
  name: z.string(),
  address: addressSchema,
  contact: contactSchema,
  employees: z.array(userProfileSchema)
});

// 条件Schema
const conditionalSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('personal'),
    firstName: z.string(),
    lastName: z.string(),
    idCard: z.string()
  }),
  z.object({
    type: z.literal('business'),
    companyName: z.string(),
    taxId: z.string(),
    legalRepresentative: z.string()
  })
]);

function ConditionalForm() {
  const { register, watch, handleSubmit } = useForm({
    resolver: zodResolver(conditionalSchema)
  });
  
  const type = watch('type');
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <select {...register('type')}>
        <option value="personal">个人</option>
        <option value="business">企业</option>
      </select>
      
      {type === 'personal' && (
        <>
          <input {...register('firstName')} placeholder="名" />
          <input {...register('lastName')} placeholder="姓" />
          <input {...register('idCard')} placeholder="身份证号" />
        </>
      )}
      
      {type === 'business' && (
        <>
          <input {...register('companyName')} placeholder="公司名称" />
          <input {...register('taxId')} placeholder="税号" />
          <input {...register('legalRepresentative')} placeholder="法定代表人" />
        </>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 4.4 错误处理和国际化

```typescript
// 自定义错误映射
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') {
      return { message: '请输入文本' };
    }
    if (issue.expected === 'number') {
      return { message: '请输入数字' };
    }
  }
  
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === 'string') {
      return { message: `至少${issue.minimum}个字符` };
    }
    if (issue.type === 'number') {
      return { message: `最小值为${issue.minimum}` };
    }
  }
  
  if (issue.code === z.ZodIssueCode.too_big) {
    if (issue.type === 'string') {
      return { message: `最多${issue.maximum}个字符` };
    }
    if (issue.type === 'number') {
      return { message: `最大值为${issue.maximum}` };
    }
  }
  
  return { message: ctx.defaultError };
};

// 应用自定义错误映射
z.setErrorMap(customErrorMap);

// 国际化支持
const createI18nErrorMap = (t: (key: string) => string): z.ZodErrorMap => {
  return (issue, ctx) => {
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        return { message: t(`errors.invalid_type.${issue.expected}`) };
      
      case z.ZodIssueCode.too_small:
        return { message: t('errors.too_small', { minimum: issue.minimum }) };
      
      case z.ZodIssueCode.too_big:
        return { message: t('errors.too_big', { maximum: issue.maximum }) };
      
      case z.ZodIssueCode.invalid_string:
        if (issue.validation === 'email') {
          return { message: t('errors.invalid_email') };
        }
        if (issue.validation === 'url') {
          return { message: t('errors.invalid_url') };
        }
        break;
      
      default:
        return { message: ctx.defaultError };
    }
    
    return { message: ctx.defaultError };
  };
};

// 使用i18n
import { useTranslation } from 'react-i18next';

function I18nForm() {
  const { t } = useTranslation();
  
  const schema = z.object({
    email: z.string().email(),
    age: z.number().min(18)
  });
  
  z.setErrorMap(createI18nErrorMap(t));
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">{t('form.submit')}</button>
    </form>
  );
}

// 错误收集和格式化
function formatZodErrors(error: z.ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }));
}
```

## Zod最佳实践总结

### Schema设计原则
```
1. 类型优先
   ✅ 充分利用TypeScript类型推导
   ✅ 使用z.infer获取类型
   ✅ 避免any和unknown

2. Schema组织
   ✅ 复用基础Schema
   ✅ 使用extend和merge组合
   ✅ 条件Schema用discriminatedUnion

3. 验证策略
   ✅ 优先使用内置验证器
   ✅ refine用于跨字段验证
   ✅ superRefine用于复杂逻辑

4. 性能考虑
   ✅ 缓存Schema实例
   ✅ 惰性验证大对象
   ✅ 部分验证减少开销

5. 错误处理
   ✅ 自定义错误映射
   ✅ 支持国际化
   ✅ 提供友好提示
```

Zod的强大类型系统和灵活的API使其成为TypeScript项目中表单验证的首选方案。
