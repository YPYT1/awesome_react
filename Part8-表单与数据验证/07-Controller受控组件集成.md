# Controller受控组件集成

## 概述

Controller是React Hook Form提供的一个包装器组件,用于集成第三方受控组件库(如Material-UI、Ant Design、React Select等)。它通过提供统一的接口,使这些组件能够无缝地与React Hook Form配合使用。本文将深入探讨Controller的使用方法和最佳实践。

## Controller基础

### 基本语法

```jsx
import { useForm, Controller } from 'react-hook-form';

function BasicController() {
  const { control, handleSubmit } = useForm();
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="textField"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <input {...field} />
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### Controller属性

```jsx
function ControllerProps() {
  const { control, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="fieldName"           // 字段名称(必需)
        control={control}           // control对象(必需)
        defaultValue=""             // 默认值
        rules={{                    // 验证规则
          required: '此字段必填',
          minLength: {
            value: 3,
            message: '至少3个字符',
          },
        }}
        render={({
          field,                    // { onChange, onBlur, value, name, ref }
          fieldState,               // { invalid, isTouched, isDirty, error }
          formState,                // 整个表单状态
        }) => (
          <div>
            <input
              {...field}
              className={fieldState.error ? 'error' : ''}
            />
            {fieldState.error && (
              <span>{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
    </form>
  );
}
```

## 集成UI库

### Material-UI集成

```jsx
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  Slider,
  RadioGroup,
  Radio,
} from '@mui/material';

function MaterialUIIntegration() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      country: '',
      agreeToTerms: false,
      notifications: true,
      volume: 50,
      gender: '',
    },
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* TextField */}
      <Controller
        name="username"
        control={control}
        rules={{
          required: '用户名不能为空',
          minLength: {
            value: 3,
            message: '用户名至少3个字符',
          },
        }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="用户名"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            margin="normal"
          />
        )}
      />
      
      {/* Select */}
      <Controller
        name="country"
        control={control}
        rules={{ required: '请选择国家' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="国家"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            margin="normal"
          >
            <MenuItem value="cn">中国</MenuItem>
            <MenuItem value="us">美国</MenuItem>
            <MenuItem value="uk">英国</MenuItem>
          </TextField>
        )}
      />
      
      {/* Checkbox */}
      <Controller
        name="agreeToTerms"
        control={control}
        rules={{ required: '请同意条款' }}
        render={({ field, fieldState }) => (
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                />
              }
              label="同意服务条款"
            />
            {fieldState.error && (
              <div className="error">{fieldState.error.message}</div>
            )}
          </div>
        )}
      />
      
      {/* Switch */}
      <Controller
        name="notifications"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                {...field}
                checked={field.value}
              />
            }
            label="接收通知"
          />
        )}
      />
      
      {/* Slider */}
      <Controller
        name="volume"
        control={control}
        render={({ field }) => (
          <div>
            <label>音量: {field.value}</label>
            <Slider
              {...field}
              min={0}
              max={100}
            />
          </div>
        )}
      />
      
      {/* RadioGroup */}
      <Controller
        name="gender"
        control={control}
        rules={{ required: '请选择性别' }}
        render={({ field, fieldState }) => (
          <div>
            <RadioGroup {...field}>
              <FormControlLabel
                value="male"
                control={<Radio />}
                label="男"
              />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label="女"
              />
            </RadioGroup>
            {fieldState.error && (
              <div className="error">{fieldState.error.message}</div>
            )}
          </div>
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### Ant Design集成

```jsx
import { useForm, Controller } from 'react-hook-form';
import {
  Input,
  Select,
  Checkbox,
  Radio,
  DatePicker,
  InputNumber,
  Switch,
  Slider,
  Rate,
} from 'antd';

const { TextArea } = Input;
const { Option } = Select;

function AntDesignIntegration() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* Input */}
      <Controller
        name="username"
        control={control}
        rules={{ required: '用户名不能为空' }}
        render={({ field, fieldState }) => (
          <div className="form-item">
            <label>用户名</label>
            <Input
              {...field}
              status={fieldState.error ? 'error' : ''}
              placeholder="请输入用户名"
            />
            {fieldState.error && (
              <div className="error">{fieldState.error.message}</div>
            )}
          </div>
        )}
      />
      
      {/* TextArea */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div className="form-item">
            <label>描述</label>
            <TextArea
              {...field}
              rows={4}
              placeholder="请输入描述"
            />
          </div>
        )}
      />
      
      {/* Select */}
      <Controller
        name="category"
        control={control}
        rules={{ required: '请选择分类' }}
        render={({ field, fieldState }) => (
          <div className="form-item">
            <label>分类</label>
            <Select
              {...field}
              style={{ width: '100%' }}
              placeholder="请选择分类"
              status={fieldState.error ? 'error' : ''}
            >
              <Option value="tech">技术</Option>
              <Option value="design">设计</Option>
              <Option value="business">商业</Option>
            </Select>
            {fieldState.error && (
              <div className="error">{fieldState.error.message}</div>
            )}
          </div>
        )}
      />
      
      {/* Multiple Select */}
      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <div className="form-item">
            <label>标签</label>
            <Select
              {...field}
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="请选择标签"
            >
              <Option value="react">React</Option>
              <Option value="vue">Vue</Option>
              <Option value="angular">Angular</Option>
            </Select>
          </div>
        )}
      />
      
      {/* DatePicker */}
      <Controller
        name="startDate"
        control={control}
        rules={{ required: '请选择日期' }}
        render={({ field, fieldState }) => (
          <div className="form-item">
            <label>开始日期</label>
            <DatePicker
              {...field}
              style={{ width: '100%' }}
              status={fieldState.error ? 'error' : ''}
            />
            {fieldState.error && (
              <div className="error">{fieldState.error.message}</div>
            )}
          </div>
        )}
      />
      
      {/* InputNumber */}
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <div className="form-item">
            <label>价格</label>
            <InputNumber
              {...field}
              style={{ width: '100%' }}
              min={0}
              step={0.01}
            />
          </div>
        )}
      />
      
      {/* Checkbox */}
      <Controller
        name="agreeToTerms"
        control={control}
        rules={{ required: '请同意条款' }}
        render={({ field, fieldState }) => (
          <div className="form-item">
            <Checkbox
              {...field}
              checked={field.value}
            >
              同意服务条款
            </Checkbox>
            {fieldState.error && (
              <div className="error">{fieldState.error.message}</div>
            )}
          </div>
        )}
      />
      
      {/* Radio Group */}
      <Controller
        name="paymentMethod"
        control={control}
        render={({ field }) => (
          <div className="form-item">
            <label>支付方式</label>
            <Radio.Group {...field}>
              <Radio value="credit">信用卡</Radio>
              <Radio value="debit">借记卡</Radio>
              <Radio value="paypal">PayPal</Radio>
            </Radio.Group>
          </div>
        )}
      />
      
      {/* Switch */}
      <Controller
        name="isActive"
        control={control}
        render={({ field }) => (
          <div className="form-item">
            <label>启用状态</label>
            <Switch
              {...field}
              checked={field.value}
            />
          </div>
        )}
      />
      
      {/* Slider */}
      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <div className="form-item">
            <label>优先级: {field.value}</label>
            <Slider
              {...field}
              min={0}
              max={100}
            />
          </div>
        )}
      />
      
      {/* Rate */}
      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <div className="form-item">
            <label>评分</label>
            <Rate {...field} />
          </div>
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### React Select集成

```jsx
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';

function ReactSelectIntegration() {
  const { control, handleSubmit } = useForm();
  
  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];
  
  const multiOptions = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' },
  ];
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      {/* Single Select */}
      <Controller
        name="flavor"
        control={control}
        rules={{ required: '请选择口味' }}
        render={({ field, fieldState }) => (
          <div>
            <label>口味</label>
            <Select
              {...field}
              options={options}
              placeholder="选择口味"
            />
            {fieldState.error && (
              <span className="error">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
      
      {/* Multiple Select */}
      <Controller
        name="frameworks"
        control={control}
        render={({ field }) => (
          <div>
            <label>技术栈</label>
            <Select
              {...field}
              isMulti
              options={multiOptions}
              placeholder="选择技术栈"
            />
          </div>
        )}
      />
      
      {/* Creatable Select */}
      <Controller
        name="customTags"
        control={control}
        render={({ field }) => (
          <div>
            <label>自定义标签</label>
            <Select
              {...field}
              isMulti
              options={[]}
              placeholder="输入并创建标签"
              formatCreateLabel={(inputValue) => `创建 "${inputValue}"`}
            />
          </div>
        )}
      />
      
      {/* Async Select */}
      <Controller
        name="user"
        control={control}
        render={({ field }) => (
          <div>
            <label>选择用户</label>
            <AsyncSelect
              {...field}
              loadOptions={loadUserOptions}
              placeholder="搜索用户"
            />
          </div>
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}

// 异步加载选项
const loadUserOptions = async (inputValue) => {
  const response = await fetch(`/api/users?search=${inputValue}`);
  const users = await response.json();
  return users.map(user => ({
    value: user.id,
    label: user.name,
  }));
};
```

## 自定义组件集成

### 简单自定义组件

```jsx
// 自定义输入组件
function CustomInput({ value, onChange, onBlur, error }) {
  return (
    <div className="custom-input">
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

// 使用Controller集成
function CustomInputForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="customField"
        control={control}
        rules={{ required: '此字段必填' }}
        render={({ field, fieldState }) => (
          <CustomInput
            {...field}
            error={fieldState.error?.message}
          />
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 复杂自定义组件

```jsx
// 自定义日期范围选择器
function DateRangePicker({ value = {}, onChange }) {
  const [startDate, setStartDate] = value.startDate || null;
  const [endDate, setEndDate] = value.endDate || null;
  
  const handleStartDateChange = (date) => {
    setStartDate(date);
    onChange({ startDate: date, endDate });
  };
  
  const handleEndDateChange = (date) => {
    setEndDate(date);
    onChange({ startDate, endDate: date });
  };
  
  return (
    <div className="date-range-picker">
      <input
        type="date"
        value={startDate || ''}
        onChange={(e) => handleStartDateChange(e.target.value)}
      />
      <span>至</span>
      <input
        type="date"
        value={endDate || ''}
        onChange={(e) => handleEndDateChange(e.target.value)}
        min={startDate}
      />
    </div>
  );
}

// 使用Controller
function DateRangeForm() {
  const { control, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="dateRange"
        control={control}
        rules={{
          validate: (value) => {
            if (!value?.startDate || !value?.endDate) {
              return '请选择日期范围';
            }
            if (new Date(value.endDate) < new Date(value.startDate)) {
              return '结束日期不能早于开始日期';
            }
            return true;
          },
        }}
        render={({ field, fieldState }) => (
          <div>
            <DateRangePicker
              value={field.value}
              onChange={field.onChange}
            />
            {fieldState.error && (
              <span className="error">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 标签输入组件

```jsx
function TagInput({ value = [], onChange }) {
  const [inputValue, setInputValue] = useState('');
  
  const addTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };
  
  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  
  return (
    <div className="tag-input">
      <div className="tags">
        {value.map(tag => (
          <span key={tag} className="tag">
            {tag}
            <button onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
      </div>
      <div className="input-wrapper">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入标签后按回车"
        />
        <button type="button" onClick={addTag}>添加</button>
      </div>
    </div>
  );
}

// 使用Controller
function TagInputForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      tags: [],
    },
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="tags"
        control={control}
        rules={{
          validate: (value) =>
            value.length > 0 || '请至少添加一个标签',
        }}
        render={({ field, fieldState }) => (
          <div>
            <label>标签</label>
            <TagInput
              value={field.value}
              onChange={field.onChange}
            />
            {fieldState.error && (
              <span className="error">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 高级用法

### shouldUnregister配置

```jsx
function ShouldUnregisterExample() {
  const { control, handleSubmit } = useForm();
  const [showField, setShowField] = useState(false);
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <button type="button" onClick={() => setShowField(!showField)}>
        切换字段
      </button>
      
      {showField && (
        <Controller
          name="conditionalField"
          control={control}
          shouldUnregister={true} // 卸载时注销字段
          render={({ field }) => (
            <input {...field} placeholder="条件字段" />
          )}
        />
      )}
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 自定义onChange处理

```jsx
function CustomOnChangeHandling() {
  const { control, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="price"
        control={control}
        render={({ field }) => (
          <input
            type="number"
            value={field.value}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              // 自定义处理逻辑
              if (value >= 0 && value <= 10000) {
                field.onChange(value);
              }
            }}
            onBlur={field.onBlur}
          />
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 格式化输入

```jsx
function FormattedInput() {
  const { control, handleSubmit } = useForm();
  
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);
    
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }
  };
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <input
            type="tel"
            value={field.value}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value);
              field.onChange(formatted);
            }}
            onBlur={field.onBlur}
            placeholder="XXX-XXXX-XXXX"
          />
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 性能优化

### 使用React.memo

```jsx
const MemoizedCustomInput = React.memo(function CustomInput({
  value,
  onChange,
  onBlur,
  error,
}) {
  console.log('CustomInput render');
  
  return (
    <div>
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && <span>{error}</span>}
    </div>
  );
});

function OptimizedForm() {
  const { control, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="optimizedField"
        control={control}
        render={({ field, fieldState }) => (
          <MemoizedCustomInput
            {...field}
            error={fieldState.error?.message}
          />
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 减少不必要的渲染

```jsx
function MinimizeRerender() {
  const { control, handleSubmit } = useForm({
    mode: 'onBlur', // 减少onChange时的渲染
  });
  
  return (
    <form onSubmit={handleSubmit(data => console.log(data))}>
      <Controller
        name="field"
        control={control}
        render={({ field }) => (
          // 只传递必要的props
          <ExpensiveComponent
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 实战案例

### 完整表单集成

```jsx
import { useForm, Controller } from 'react-hook-form';
import { TextField, Select, MenuItem, Checkbox, FormControlLabel } from '@mui/material';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

function CompleteFormIntegration() {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      country: '',
      skills: [],
      startDate: null,
      agreeToTerms: false,
    },
  });
  
  const skillsOptions = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
  ];
  
  const onSubmit = async (data) => {
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      alert('提交成功!');
    } catch (error) {
      alert('提交失败: ' + error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Material-UI TextField */}
      <Controller
        name="name"
        control={control}
        rules={{ required: '姓名不能为空' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="姓名"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            margin="normal"
          />
        )}
      />
      
      {/* Material-UI Email */}
      <Controller
        name="email"
        control={control}
        rules={{
          required: '邮箱不能为空',
          pattern: {
            value: /^\S+@\S+$/i,
            message: '邮箱格式不正确',
          },
        }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            type="email"
            label="邮箱"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            margin="normal"
          />
        )}
      />
      
      {/* Material-UI Select */}
      <Controller
        name="country"
        control={control}
        rules={{ required: '请选择国家' }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="国家"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            margin="normal"
          >
            <MenuItem value="cn">中国</MenuItem>
            <MenuItem value="us">美国</MenuItem>
            <MenuItem value="uk">英国</MenuItem>
          </TextField>
        )}
      />
      
      {/* React Select */}
      <Controller
        name="skills"
        control={control}
        rules={{ required: '请至少选择一项技能' }}
        render={({ field, fieldState }) => (
          <div>
            <label>技能</label>
            <Select
              {...field}
              isMulti
              options={skillsOptions}
              placeholder="选择技能"
            />
            {fieldState.error && (
              <span className="error">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
      
      {/* DatePicker */}
      <Controller
        name="startDate"
        control={control}
        rules={{ required: '请选择开始日期' }}
        render={({ field, fieldState }) => (
          <div>
            <label>开始日期</label>
            <DatePicker
              selected={field.value}
              onChange={field.onChange}
              dateFormat="yyyy-MM-dd"
            />
            {fieldState.error && (
              <span className="error">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
      
      {/* Checkbox */}
      <Controller
        name="agreeToTerms"
        control={control}
        rules={{ required: '请同意服务条款' }}
        render={({ field, fieldState }) => (
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                />
              }
              label="同意服务条款"
            />
            {fieldState.error && (
              <span className="error">{fieldState.error.message}</span>
            )}
          </div>
        )}
      />
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '提交'}
      </button>
    </form>
  );
}
```

## 总结

Controller组件要点：

1. **核心作用**：集成第三方受控组件
2. **render prop**：提供field、fieldState、formState
3. **UI库集成**：Material-UI、Ant Design、React Select
4. **自定义组件**：封装复杂逻辑的组件
5. **性能优化**：React.memo、减少渲染
6. **灵活配置**：shouldUnregister、自定义onChange

掌握Controller能够让React Hook Form与任何UI库无缝集成。
