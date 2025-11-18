# register注册表单

## 概述

register是React Hook Form的核心方法之一,它用于将输入字段注册到表单中。理解register的工作原理和高级用法对于充分利用React Hook Form至关重要。本文将深入探讨register方法的各个方面。

## register基础

### 基本语法

```jsx
import { useForm } from 'react-hook-form';

function BasicRegister() {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 基本用法 */}
      <input {...register('firstName')} />
      
      {/* 等同于 */}
      <input
        name="firstName"
        ref={register.ref}
        onChange={register.onChange}
        onBlur={register.onBlur}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### register返回值

```jsx
function RegisterReturnValue() {
  const { register } = useForm();
  
  // register返回以下属性
  const fieldRegistration = register('fieldName');
  console.log(fieldRegistration);
  /* 
  {
    name: 'fieldName',
    ref: Function,
    onChange: Function,
    onBlur: Function,
  }
  */
  
  return (
    <form>
      <input {...fieldRegistration} />
    </form>
  );
}
```

## 输入类型

### 文本输入

```jsx
function TextInputs() {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* 文本 */}
      <input
        type="text"
        {...register('username')}
        placeholder="用户名"
      />
      
      {/* 邮箱 */}
      <input
        type="email"
        {...register('email')}
        placeholder="邮箱"
      />
      
      {/* 密码 */}
      <input
        type="password"
        {...register('password')}
        placeholder="密码"
      />
      
      {/* 电话 */}
      <input
        type="tel"
        {...register('phone')}
        placeholder="电话"
      />
      
      {/* URL */}
      <input
        type="url"
        {...register('website')}
        placeholder="网站"
      />
      
      {/* 文本域 */}
      <textarea
        {...register('bio')}
        placeholder="个人简介"
        rows={5}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 数字和日期

```jsx
function NumberAndDateInputs() {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
    // age是number类型
    // birthDate是Date类型
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 数字 - 自动转换为number */}
      <input
        type="number"
        {...register('age', {
          valueAsNumber: true,
          min: 0,
          max: 120,
        })}
      />
      
      {/* 范围 */}
      <input
        type="range"
        {...register('satisfaction', {
          valueAsNumber: true,
          min: 0,
          max: 10,
        })}
      />
      
      {/* 日期 - 自动转换为Date */}
      <input
        type="date"
        {...register('birthDate', {
          valueAsDate: true,
        })}
      />
      
      {/* 时间 */}
      <input
        type="time"
        {...register('appointmentTime')}
      />
      
      {/* 日期时间 */}
      <input
        type="datetime-local"
        {...register('eventDateTime', {
          valueAsDate: true,
        })}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 选择和复选

```jsx
function SelectAndCheckboxInputs() {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* 下拉选择 */}
      <select {...register('country')}>
        <option value="">请选择国家</option>
        <option value="cn">中国</option>
        <option value="us">美国</option>
        <option value="uk">英国</option>
      </select>
      
      {/* 多选下拉 */}
      <select
        {...register('skills')}
        multiple
      >
        <option value="js">JavaScript</option>
        <option value="react">React</option>
        <option value="node">Node.js</option>
        <option value="python">Python</option>
      </select>
      
      {/* 单个复选框 */}
      <label>
        <input
          type="checkbox"
          {...register('agreeToTerms')}
        />
        同意条款
      </label>
      
      {/* 多个复选框 */}
      <fieldset>
        <legend>兴趣爱好</legend>
        <label>
          <input
            type="checkbox"
            value="reading"
            {...register('hobbies')}
          />
          阅读
        </label>
        <label>
          <input
            type="checkbox"
            value="sports"
            {...register('hobbies')}
          />
          运动
        </label>
        <label>
          <input
            type="checkbox"
            value="music"
            {...register('hobbies')}
          />
          音乐
        </label>
      </fieldset>
      
      {/* 单选按钮组 */}
      <fieldset>
        <legend>性别</legend>
        <label>
          <input
            type="radio"
            value="male"
            {...register('gender')}
          />
          男
        </label>
        <label>
          <input
            type="radio"
            value="female"
            {...register('gender')}
          />
          女
        </label>
        <label>
          <input
            type="radio"
            value="other"
            {...register('gender')}
          />
          其他
        </label>
      </fieldset>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 文件上传

```jsx
function FileInput() {
  const { register, handleSubmit, watch } = useForm();
  
  const files = watch('files');
  
  const onSubmit = async (data) => {
    const formData = new FormData();
    
    // 单个文件
    if (data.avatar[0]) {
      formData.append('avatar', data.avatar[0]);
    }
    
    // 多个文件
    if (data.files) {
      Array.from(data.files).forEach(file => {
        formData.append('files', file);
      });
    }
    
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 单个文件 */}
      <div>
        <label>头像</label>
        <input
          type="file"
          {...register('avatar')}
          accept="image/*"
        />
      </div>
      
      {/* 多个文件 */}
      <div>
        <label>附件</label>
        <input
          type="file"
          {...register('files')}
          multiple
          accept=".pdf,.doc,.docx"
        />
      </div>
      
      {/* 显示选中的文件 */}
      {files && files.length > 0 && (
        <div>
          <h4>已选择的文件:</h4>
          <ul>
            {Array.from(files).map((file, index) => (
              <li key={index}>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button type="submit">上传</button>
    </form>
  );
}
```

## 验证选项

### 内置验证规则

```jsx
function BuiltInValidation() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* required - 必填 */}
      <input
        {...register('username', {
          required: '用户名不能为空',
        })}
      />
      {errors.username && <span>{errors.username.message}</span>}
      
      {/* minLength/maxLength - 长度 */}
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
      
      {/* pattern - 正则表达式 */}
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
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 自定义验证

```jsx
function CustomValidation() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  const password = watch('password');
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* 单个自定义验证 */}
      <input
        {...register('username', {
          required: '用户名不能为空',
          validate: (value) => {
            if (value === 'admin') {
              return '不能使用admin作为用户名';
            }
            return true;
          },
        })}
      />
      {errors.username && <span>{errors.username.message}</span>}
      
      {/* 多个自定义验证 */}
      <input
        {...register('email', {
          required: '邮箱不能为空',
          validate: {
            matchPattern: (value) =>
              /^\S+@\S+$/i.test(value) || '邮箱格式不正确',
            notBlacklisted: (value) =>
              !value.endsWith('@blocked.com') || '该邮箱域名已被禁止',
            uniqueEmail: async (value) => {
              const response = await fetch(`/api/check-email?email=${value}`);
              const data = await response.json();
              return data.available || '该邮箱已被使用';
            },
          },
        })}
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      {/* 访问其他字段值 */}
      <input
        type="password"
        {...register('password', {
          required: '密码不能为空',
        })}
      />
      
      <input
        type="password"
        {...register('confirmPassword', {
          required: '请确认密码',
          validate: (value) =>
            value === password || '密码不匹配',
        })}
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}
      
      {/* 访问所有表单值 */}
      <input
        {...register('promoCode', {
          validate: (value, formValues) => {
            if (formValues.usePromo && !value) {
              return '请输入优惠码';
            }
            return true;
          },
        })}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 异步验证

```jsx
function AsyncValidation() {
  const { register, handleSubmit, formState: { errors, isValidating } } = useForm({
    mode: 'onBlur',
  });
  
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      return '用户名至少3个字符';
    }
    
    try {
      const response = await fetch(`/api/check-username?username=${username}`);
      const data = await response.json();
      
      if (!data.available) {
        return '该用户名已被使用';
      }
      
      return true;
    } catch (error) {
      return '验证失败,请重试';
    }
  };
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <div>
        <input
          {...register('username', {
            required: '用户名不能为空',
            validate: checkUsernameAvailability,
          })}
        />
        {isValidating && <span>验证中...</span>}
        {errors.username && <span>{errors.username.message}</span>}
      </div>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 值转换

### valueAs选项

```jsx
function ValueTransformation() {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
    // {
    //   age: 25,              // number
    //   price: 99.99,         // number
    //   birthDate: Date,      // Date对象
    //   tags: ['tag1', 'tag2'], // 数组
    // }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* valueAsNumber - 转换为数字 */}
      <input
        type="number"
        {...register('age', {
          valueAsNumber: true,
        })}
      />
      
      {/* valueAsDate - 转换为Date */}
      <input
        type="date"
        {...register('birthDate', {
          valueAsDate: true,
        })}
      />
      
      {/* setValueAs - 自定义转换 */}
      <input
        {...register('price', {
          setValueAs: (value) => parseFloat(value),
        })}
      />
      
      {/* 转换为数组 */}
      <input
        {...register('tags', {
          setValueAs: (value) => value.split(',').map(tag => tag.trim()),
        })}
        placeholder="用逗号分隔标签"
      />
      
      {/* 转换为大写 */}
      <input
        {...register('countryCode', {
          setValueAs: (value) => value.toUpperCase(),
        })}
      />
      
      {/* 转换为布尔值 */}
      <select
        {...register('isActive', {
          setValueAs: (value) => value === 'true',
        })}
      >
        <option value="true">是</option>
        <option value="false">否</option>
      </select>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 依赖验证

### 字段间依赖

```jsx
function DependentValidation() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const hasPromoCode = watch('hasPromoCode');
  const shippingCountry = watch('shippingCountry');
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* 条件必填 */}
      <label>
        <input
          type="checkbox"
          {...register('hasPromoCode')}
        />
        使用优惠码
      </label>
      
      {hasPromoCode && (
        <input
          {...register('promoCode', {
            required: '请输入优惠码',
            pattern: {
              value: /^[A-Z0-9]{6}$/,
              message: '优惠码格式不正确',
            },
          })}
          placeholder="优惠码"
        />
      )}
      {errors.promoCode && <span>{errors.promoCode.message}</span>}
      
      {/* 根据其他字段调整验证 */}
      <select {...register('shippingCountry')}>
        <option value="cn">中国</option>
        <option value="us">美国</option>
      </select>
      
      <input
        {...register('zipCode', {
          required: '邮编不能为空',
          validate: (value) => {
            if (shippingCountry === 'cn') {
              return /^\d{6}$/.test(value) || '中国邮编必须是6位数字';
            }
            if (shippingCountry === 'us') {
              return /^\d{5}(-\d{4})?$/.test(value) || '美国邮编格式不正确';
            }
            return true;
          },
        })}
        placeholder="邮编"
      />
      {errors.zipCode && <span>{errors.zipCode.message}</span>}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 动态字段

### 条件渲染字段

```jsx
function ConditionalFields() {
  const { register, handleSubmit, watch, unregister } = useForm();
  
  const accountType = watch('accountType');
  
  // 当字段不显示时注销
  useEffect(() => {
    if (accountType !== 'business') {
      unregister('companyName');
      unregister('taxId');
    }
  }, [accountType, unregister]);
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <select {...register('accountType')}>
        <option value="personal">个人账户</option>
        <option value="business">企业账户</option>
      </select>
      
      {accountType === 'personal' && (
        <div>
          <input
            {...register('firstName', { required: true })}
            placeholder="名"
          />
          <input
            {...register('lastName', { required: true })}
            placeholder="姓"
          />
        </div>
      )}
      
      {accountType === 'business' && (
        <div>
          <input
            {...register('companyName', { required: true })}
            placeholder="公司名称"
          />
          <input
            {...register('taxId', { required: true })}
            placeholder="税号"
          />
        </div>
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 字段数组

```jsx
import { useFieldArray } from 'react-hook-form';

function DynamicFields() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      contacts: [{ name: '', email: '' }],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...register(`contacts.${index}.name`, {
              required: '姓名不能为空',
            })}
            placeholder="姓名"
          />
          
          <input
            {...register(`contacts.${index}.email`, {
              required: '邮箱不能为空',
              pattern: {
                value: /^\S+@\S+$/i,
                message: '邮箱格式不正确',
              },
            })}
            placeholder="邮箱"
          />
          
          <button
            type="button"
            onClick={() => remove(index)}
          >
            删除
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => append({ name: '', email: '' })}
      >
        添加联系人
      </button>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 高级技巧

### 禁用字段

```jsx
function DisabledFields() {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* 禁用字段 - 值不会被提交 */}
      <input
        {...register('disabledField')}
        disabled
      />
      
      {/* 只读字段 - 值会被提交 */}
      <input
        {...register('readonlyField')}
        readOnly
      />
      
      {/* 条件禁用 */}
      <input
        {...register('conditionalField', {
          disabled: true, // 可以动态设置
        })}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 自定义ref

```jsx
function CustomRef() {
  const { register, handleSubmit } = useForm();
  const customRef = useRef(null);
  
  const { ref, ...rest } = register('customField');
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <input
        {...rest}
        ref={(e) => {
          ref(e);
          customRef.current = e;
        }}
      />
      
      <button
        type="button"
        onClick={() => customRef.current?.focus()}
      >
        聚焦输入框
      </button>
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 嵌套对象

```jsx
function NestedObjects() {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
    /* {
      user: {
        personal: {
          firstName: 'John',
          lastName: 'Doe'
        },
        contact: {
          email: 'john@example.com',
          phone: '1234567890'
        }
      }
    } */
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 使用点号表示法 */}
      <input
        {...register('user.personal.firstName')}
        placeholder="名"
      />
      <input
        {...register('user.personal.lastName')}
        placeholder="姓"
      />
      <input
        {...register('user.contact.email')}
        placeholder="邮箱"
      />
      <input
        {...register('user.contact.phone')}
        placeholder="电话"
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 实战案例

### 个人资料表单

```jsx
function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      birthDate: '',
      country: '',
      interests: [],
      newsletter: false,
    },
  });
  
  const onSubmit = async (data) => {
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      alert('保存成功!');
    } catch (error) {
      alert('保存失败: ' + error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
      <h2>编辑个人资料</h2>
      
      <div className="form-group">
        <label>用户名</label>
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
        />
        {errors.username && (
          <span className="error">{errors.username.message}</span>
        )}
      </div>
      
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
        <label>个人简介</label>
        <textarea
          {...register('bio', {
            maxLength: {
              value: 500,
              message: '简介最多500个字符',
            },
          })}
          rows={5}
        />
        {errors.bio && (
          <span className="error">{errors.bio.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>出生日期</label>
        <input
          type="date"
          {...register('birthDate', {
            required: '出生日期不能为空',
            valueAsDate: true,
          })}
        />
        {errors.birthDate && (
          <span className="error">{errors.birthDate.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>国家</label>
        <select {...register('country', { required: '请选择国家' })}>
          <option value="">请选择</option>
          <option value="cn">中国</option>
          <option value="us">美国</option>
          <option value="uk">英国</option>
        </select>
        {errors.country && (
          <span className="error">{errors.country.message}</span>
        )}
      </div>
      
      <div className="form-group">
        <label>兴趣爱好</label>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              value="reading"
              {...register('interests')}
            />
            阅读
          </label>
          <label>
            <input
              type="checkbox"
              value="sports"
              {...register('interests')}
            />
            运动
          </label>
          <label>
            <input
              type="checkbox"
              value="music"
              {...register('interests')}
            />
            音乐
          </label>
          <label>
            <input
              type="checkbox"
              value="travel"
              {...register('interests')}
            />
            旅行
          </label>
        </div>
      </div>
      
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            {...register('newsletter')}
          />
          订阅新闻邮件
        </label>
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
```

## 总结

register方法要点：

1. **基础用法**：将输入字段注册到表单
2. **多种类型**：支持所有HTML输入类型
3. **验证规则**：内置和自定义验证
4. **值转换**：valueAsNumber、valueAsDate、setValueAs
5. **动态字段**：条件渲染、字段数组
6. **高级技巧**：自定义ref、嵌套对象

掌握register方法是使用React Hook Form的基础,理解其各种选项能够处理复杂的表单场景。
