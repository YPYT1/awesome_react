# React Hook Form 入门

## 概述

React Hook Form 是一个高性能、灵活且易于扩展的表单库,它通过使用非受控组件和最小化重新渲染来优化性能。与传统的受控组件相比,React Hook Form能够显著减少代码量和提升性能。本文将全面介绍React Hook Form的核心概念和基础用法。

## 安装和基础配置

### 安装

```bash
# npm
npm install react-hook-form

# yarn
yarn add react-hook-form

# pnpm
pnpm add react-hook-form
```

### 第一个表单

```jsx
import { useForm } from 'react-hook-form';

function BasicForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="名" />
      <input {...register('lastName')} placeholder="姓" />
      <input {...register('email')} placeholder="邮箱" />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 核心API

### useForm Hook

```jsx
import { useForm } from 'react-hook-form';

function FormWithOptions() {
  const {
    register,           // 注册输入字段
    handleSubmit,       // 处理表单提交
    formState,          // 表单状态
    watch,              // 监听字段值
    getValues,          // 获取表单值
    setValue,           // 设置字段值
    reset,              // 重置表单
    trigger,            // 手动触发验证
    setError,           // 设置错误
    clearErrors,        // 清除错误
  } = useForm({
    mode: 'onChange',              // 验证模式
    reValidateMode: 'onChange',    // 重新验证模式
    defaultValues: {               // 默认值
      firstName: '',
      lastName: '',
      email: '',
    },
    criteriaMode: 'all',           // 显示所有错误
    shouldFocusError: true,        // 自动聚焦到错误字段
    shouldUnregister: false,       // 卸载时是否注销字段
  });
  
  return <form onSubmit={handleSubmit(onSubmit)}>{/* ... */}</form>;
}
```

### 验证模式

```jsx
// onSubmit - 提交时验证(默认)
const { register } = useForm({ mode: 'onSubmit' });

// onBlur - 失焦时验证
const { register } = useForm({ mode: 'onBlur' });

// onChange - 值改变时验证
const { register } = useForm({ mode: 'onChange' });

// onTouched - 首次失焦后,后续改变时验证
const { register } = useForm({ mode: 'onTouched' });

// all - 失焦和改变时都验证
const { register } = useForm({ mode: 'all' });

// 实际使用示例
function ValidationModeExample() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange',  // 实时验证
  });
  
  const onSubmit = (data) => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('username', {
          required: '用户名不能为空',
          minLength: {
            value: 3,
            message: '用户名至少3个字符',
          },
        })}
      />
      {errors.username && <span>{errors.username.message}</span>}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## register方法

### 基础用法

```jsx
function RegisterBasics() {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* 基本注册 */}
      <input {...register('firstName')} />
      
      {/* 带验证规则 */}
      <input
        {...register('email', {
          required: true,
          pattern: /^\S+@\S+$/i,
        })}
      />
      
      {/* 数字类型 */}
      <input
        type="number"
        {...register('age', {
          valueAsNumber: true,
          min: 18,
        })}
      />
      
      {/* 日期类型 */}
      <input
        type="date"
        {...register('birthDate', {
          valueAsDate: true,
        })}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 验证规则

```jsx
function ValidationRules() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* required - 必填 */}
      <input
        {...register('username', {
          required: '用户名不能为空',
        })}
      />
      {errors.username && <span>{errors.username.message}</span>}
      
      {/* minLength/maxLength - 长度限制 */}
      <input
        {...register('password', {
          required: '密码不能为空',
          minLength: {
            value: 8,
            message: '密码至少8个字符',
          },
          maxLength: {
            value: 20,
            message: '密码最多20个字符',
          },
        })}
        type="password"
      />
      {errors.password && <span>{errors.password.message}</span>}
      
      {/* min/max - 数值范围 */}
      <input
        type="number"
        {...register('age', {
          required: '年龄不能为空',
          min: {
            value: 18,
            message: '必须年满18岁',
          },
          max: {
            value: 100,
            message: '年龄不能超过100岁',
          },
          valueAsNumber: true,
        })}
      />
      {errors.age && <span>{errors.age.message}</span>}
      
      {/* pattern - 正则验证 */}
      <input
        {...register('email', {
          required: '邮箱不能为空',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '邮箱格式不正确',
          },
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      {/* validate - 自定义验证 */}
      <input
        {...register('confirmPassword', {
          required: '请确认密码',
          validate: (value, formValues) =>
            value === formValues.password || '密码不匹配',
        })}
        type="password"
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 多个验证规则

```jsx
function MultipleValidations() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    criteriaMode: 'all', // 显示所有错误
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input
        {...register('username', {
          required: '用户名不能为空',
          minLength: {
            value: 3,
            message: '用户名至少3个字符',
          },
          maxLength: {
            value: 20,
            message: '用户名最多20个字符',
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: '只能包含字母、数字和下划线',
          },
          validate: {
            notAdmin: (value) =>
              value !== 'admin' || '不能使用admin作为用户名',
            notReserved: (value) =>
              !['root', 'system'].includes(value) || '该用户名已被保留',
          },
        })}
      />
      
      {/* 显示所有错误 */}
      {errors.username && (
        <div>
          {errors.username.types && 
            Object.values(errors.username.types).map((error, i) => (
              <p key={i}>{error}</p>
            ))
          }
          {!errors.username.types && <p>{errors.username.message}</p>}
        </div>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## formState

### 表单状态管理

```jsx
function FormStateExample() {
  const {
    register,
    handleSubmit,
    formState: {
      errors,          // 错误信息
      isDirty,         // 表单是否被修改
      isValid,         // 表单是否有效
      isSubmitting,    // 是否正在提交
      isSubmitted,     // 是否已提交
      isSubmitSuccessful, // 提交是否成功
      submitCount,     // 提交次数
      touchedFields,   // 被触摸的字段
      dirtyFields,     // 被修改的字段
    },
  } = useForm({ mode: 'onChange' });
  
  const onSubmit = async (data) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username', { required: true })} />
      {errors.username && <span>用户名不能为空</span>}
      
      <input {...register('email', { required: true })} />
      {errors.email && <span>邮箱不能为空</span>}
      
      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? '提交中...' : '提交'}
      </button>
      
      <div className="form-info">
        <p>表单已修改: {isDirty ? '是' : '否'}</p>
        <p>表单有效: {isValid ? '是' : '否'}</p>
        <p>已提交次数: {submitCount}</p>
        {isSubmitSuccessful && <p>提交成功!</p>}
      </div>
    </form>
  );
}
```

### 脏字段和触摸字段

```jsx
function DirtyAndTouchedFields() {
  const {
    register,
    handleSubmit,
    formState: { dirtyFields, touchedFields },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <div>
        <input {...register('firstName')} />
        <span>
          {dirtyFields.firstName && '已修改'}
          {touchedFields.firstName && '已触摸'}
        </span>
      </div>
      
      <div>
        <input {...register('lastName')} />
        <span>
          {dirtyFields.lastName && '已修改'}
          {touchedFields.lastName && '已触摸'}
        </span>
      </div>
      
      <div>
        <input {...register('email')} />
        <span>
          {dirtyFields.email && '已修改'}
          {touchedFields.email && '已触摸'}
        </span>
      </div>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## watch方法

### 监听字段值

```jsx
function WatchExample() {
  const { register, watch } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });
  
  // 监听所有字段
  const allFields = watch();
  
  // 监听单个字段
  const firstName = watch('firstName');
  
  // 监听多个字段
  const [firstName, lastName] = watch(['firstName', 'lastName']);
  
  // 使用回调函数
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log('字段变化:', name, value);
    });
    
    return () => subscription.unsubscribe();
  }, [watch]);
  
  return (
    <form>
      <input {...register('firstName')} />
      <input {...register('lastName')} />
      
      <div>
        <p>名: {firstName}</p>
        <p>姓: {lastName}</p>
        <p>全名: {firstName} {lastName}</p>
      </div>
    </form>
  );
}

// 条件渲染
function ConditionalFields() {
  const { register, watch } = useForm();
  const hasAccount = watch('hasAccount');
  
  return (
    <form>
      <label>
        <input type="checkbox" {...register('hasAccount')} />
        已有账户
      </label>
      
      {hasAccount ? (
        <div>
          <input {...register('username')} placeholder="用户名" />
          <input {...register('password')} type="password" placeholder="密码" />
        </div>
      ) : (
        <div>
          <input {...register('email')} placeholder="邮箱" />
          <input {...register('newPassword')} type="password" placeholder="创建密码" />
        </div>
      )}
    </form>
  );
}
```

## getValues和setValue

### 获取和设置值

```jsx
function GetSetValues() {
  const { register, getValues, setValue, handleSubmit } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });
  
  const fillDemoData = () => {
    setValue('firstName', 'John');
    setValue('lastName', 'Doe');
    setValue('email', 'john@example.com');
  };
  
  const logValues = () => {
    // 获取所有值
    console.log(getValues());
    
    // 获取单个值
    console.log(getValues('firstName'));
    
    // 获取多个值
    console.log(getValues(['firstName', 'lastName']));
  };
  
  const updateField = () => {
    // 基本设置
    setValue('firstName', 'Jane');
    
    // 设置并触发验证
    setValue('email', 'jane@example.com', {
      shouldValidate: true,
    });
    
    // 设置并标记为dirty
    setValue('lastName', 'Smith', {
      shouldDirty: true,
    });
    
    // 设置并标记为touched
    setValue('email', 'test@example.com', {
      shouldTouch: true,
    });
  };
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('firstName')} />
      <input {...register('lastName')} />
      <input {...register('email')} />
      
      <button type="button" onClick={fillDemoData}>
        填充示例数据
      </button>
      <button type="button" onClick={logValues}>
        打印值
      </button>
      <button type="button" onClick={updateField}>
        更新字段
      </button>
      <button type="submit">提交</button>
    </form>
  );
}
```

## reset方法

### 重置表单

```jsx
function ResetExample() {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      username: '',
      email: '',
    },
  });
  
  const onSubmit = async (data) => {
    await submitForm(data);
    
    // 提交成功后重置
    reset();
  };
  
  const resetToDefault = () => {
    // 重置到默认值
    reset();
  };
  
  const resetToNewValues = () => {
    // 重置到新值
    reset({
      username: 'admin',
      email: 'admin@example.com',
    });
  };
  
  const partialReset = () => {
    // 部分重置
    reset({
      username: '',
      // email保持不变
    }, {
      keepDirty: true,
      keepErrors: true,
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      <input {...register('email')} />
      
      <button type="submit">提交</button>
      <button type="button" onClick={resetToDefault}>
        重置
      </button>
      <button type="button" onClick={resetToNewValues}>
        重置到新值
      </button>
      <button type="button" onClick={partialReset}>
        部分重置
      </button>
    </form>
  );
}

// 异步默认值
function AsyncDefaultValues() {
  const { register, reset, handleSubmit } = useForm();
  
  useEffect(() => {
    // 从API获取数据
    const fetchData = async () => {
      const response = await fetch('/api/user');
      const data = await response.json();
      
      // 重置表单为获取的数据
      reset(data);
    };
    
    fetchData();
  }, [reset]);
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input {...register('username')} />
      <input {...register('email')} />
      <button type="submit">更新</button>
    </form>
  );
}
```

## 错误处理

### setError和clearErrors

```jsx
function ErrorHandling() {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();
  
  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        
        // 设置服务器返回的错误
        if (error.field === 'username') {
          setError('username', {
            type: 'server',
            message: error.message,
          });
        }
        
        // 设置全局错误
        setError('root.serverError', {
          type: 'server',
          message: '注册失败,请稍后重试',
        });
      }
    } catch (error) {
      setError('root.networkError', {
        type: 'network',
        message: '网络错误',
      });
    }
  };
  
  const clearAllErrors = () => {
    clearErrors();
  };
  
  const clearSpecificError = () => {
    clearErrors('username');
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('username', {
          required: '用户名不能为空',
        })}
      />
      {errors.username && <span>{errors.username.message}</span>}
      
      <input
        {...register('email', {
          required: '邮箱不能为空',
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      {errors.root?.serverError && (
        <div className="global-error">
          {errors.root.serverError.message}
        </div>
      )}
      
      {errors.root?.networkError && (
        <div className="global-error">
          {errors.root.networkError.message}
        </div>
      )}
      
      <button type="submit">注册</button>
      <button type="button" onClick={clearAllErrors}>
        清除所有错误
      </button>
      <button type="button" onClick={clearSpecificError}>
        清除用户名错误
      </button>
    </form>
  );
}
```

## 触发验证

### trigger方法

```jsx
function TriggerValidation() {
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });
  
  const validateField = async (fieldName) => {
    // 验证单个字段
    const isValid = await trigger(fieldName);
    console.log(`${fieldName} is valid:`, isValid);
  };
  
  const validateMultipleFields = async () => {
    // 验证多个字段
    const isValid = await trigger(['username', 'email']);
    console.log('Fields are valid:', isValid);
  };
  
  const validateAllFields = async () => {
    // 验证所有字段
    const isValid = await trigger();
    console.log('Form is valid:', isValid);
  };
  
  return (
    <form>
      <div>
        <input
          {...register('username', {
            required: '用户名不能为空',
            minLength: {
              value: 3,
              message: '用户名至少3个字符',
            },
          })}
        />
        <button
          type="button"
          onClick={() => validateField('username')}
        >
          验证用户名
        </button>
        {errors.username && <span>{errors.username.message}</span>}
      </div>
      
      <div>
        <input
          {...register('email', {
            required: '邮箱不能为空',
            pattern: {
              value: /^\S+@\S+$/i,
              message: '邮箱格式不正确',
            },
          })}
        />
        <button
          type="button"
          onClick={() => validateField('email')}
        >
          验证邮箱
        </button>
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      
      <button type="button" onClick={validateMultipleFields}>
        验证用户名和邮箱
      </button>
      <button type="button" onClick={validateAllFields}>
        验证全部
      </button>
    </form>
  );
}
```

## 实战示例

### 登录表单

```jsx
function LoginForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();
  
  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        setError('root.serverError', {
          message: error.message || '登录失败',
        });
        return;
      }
      
      const result = await response.json();
      // 登录成功,重定向
      window.location.href = '/dashboard';
      
    } catch (error) {
      setError('root.networkError', {
        message: '网络错误,请稍后重试',
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="login-form">
      <h2>登录</h2>
      
      <div className="form-group">
        <label>邮箱</label>
        <input
          type="email"
          {...register('email', {
            required: '邮箱不能为空',
            pattern: {
              value: /^\S+@\S+$/i,
              message: '邮箱格式不正确',
            },
          })}
        />
        {errors.email && (
          <span className="error">{errors.email.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>密码</label>
        <input
          type="password"
          {...register('password', {
            required: '密码不能为空',
            minLength: {
              value: 6,
              message: '密码至少6个字符',
            },
          })}
        />
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>
          <input type="checkbox" {...register('rememberMe')} />
          记住我
        </label>
      </div>
      
      {errors.root?.serverError && (
        <div className="alert alert-error">
          {errors.root.serverError.message}
        </div>
      )}
      
      {errors.root?.networkError && (
        <div className="alert alert-error">
          {errors.root.networkError.message}
        </div>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '登录中...' : '登录'}
      </button>
    </form>
  );
}
```

### 注册表单

```jsx
function RegistrationForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
  });
  
  const password = watch('password');
  
  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('注册失败');
      }
      
      alert('注册成功!');
    } catch (error) {
      alert(error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>注册</h2>
      
      <input
        {...register('username', {
          required: '用户名不能为空',
          minLength: {
            value: 3,
            message: '用户名至少3个字符',
          },
          pattern: {
            value: /^[a-zA-Z0-9_]+$/,
            message: '只能包含字母、数字和下划线',
          },
        })}
        placeholder="用户名"
      />
      {errors.username && <span>{errors.username.message}</span>}
      
      <input
        type="email"
        {...register('email', {
          required: '邮箱不能为空',
          pattern: {
            value: /^\S+@\S+$/i,
            message: '邮箱格式不正确',
          },
        })}
        placeholder="邮箱"
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input
        type="password"
        {...register('password', {
          required: '密码不能为空',
          minLength: {
            value: 8,
            message: '密码至少8个字符',
          },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: '密码必须包含大小写字母和数字',
          },
        })}
        placeholder="密码"
      />
      {errors.password && <span>{errors.password.message}</span>}
      
      <input
        type="password"
        {...register('confirmPassword', {
          required: '请确认密码',
          validate: value =>
            value === password || '密码不匹配',
        })}
        placeholder="确认密码"
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      
      <label>
        <input
          type="checkbox"
          {...register('agreeToTerms', {
            required: '请同意服务条款',
          })}
        />
        我同意服务条款
      </label>
      {errors.agreeToTerms && <span>{errors.agreeToTerms.message}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '注册中...' : '注册'}
      </button>
    </form>
  );
}
```

## 总结

React Hook Form核心要点：

1. **性能优势**：使用非受控组件,减少不必要的渲染
2. **简单API**：register注册字段,handleSubmit处理提交
3. **灵活验证**：内置验证规则和自定义验证函数
4. **状态管理**：formState提供完整的表单状态
5. **实用方法**：watch、getValues、setValue、reset等
6. **错误处理**：setError和clearErrors管理错误

React Hook Form通过简洁的API和出色的性能,成为React表单处理的首选方案。
