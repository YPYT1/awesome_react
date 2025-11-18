# useId唯一ID生成

## 学习目标

通过本章学习，你将全面掌握：

- useId的概念和作用
- useId的使用场景
- 可访问性（a11y）中的应用
- SSR中的ID生成问题
- useId vs 其他ID生成方案
- 表单元素的关联
- React 19中的useId增强
- 高级可访问性模式
- 与表单库的集成
- TypeScript类型定义
- 性能优化技巧

## 第一部分：useId基础

### 1.1 什么是useId

useId是React 18引入的Hook，用于生成在客户端和服务器端保持一致的唯一ID。

```jsx
import { useId } from 'react';

function BasicUseId() {
  // 生成唯一ID
  const id = useId();
  
  console.log('生成的ID:', id);  // 例如: ":r1:"
  
  return (
    <div>
      <label htmlFor={id}>用户名:</label>
      <input id={id} type="text" />
    </div>
  );
}
```

### 1.2 为什么需要useId

在React中生成唯一ID有多种方案，但都有各自的问题：

```jsx
// ❌ 问题1：硬编码ID可能重复
function HardcodedId() {
  return (
    <div>
      <label htmlFor="username">用户名:</label>
      <input id="username" />
      
      {/* 如果这个组件渲染多次，ID会重复 */}
    </div>
  );
}

function App() {
  return (
    <>
      <HardcodedId />
      <HardcodedId />  {/* ❌ ID重复！ */}
    </>
  );
}

// ❌ 问题2：使用随机数在SSR中不一致
let counter = 0;

function RandomId() {
  const [id] = useState(() => `id-${Math.random()}`);
  // 或
  const [id2] = useState(() => `id-${counter++}`);
  
  return (
    <div>
      <label htmlFor={id}>用户名:</label>
      <input id={id} />
    </div>
  );
  
  // 问题：服务器渲染的ID和客户端hydrate的ID不一致
  // 导致hydration警告
  // Server: id-0.123456
  // Client: id-0.789012
}

// ❌ 问题3：使用全局计数器
let globalCounter = 0;

function CounterId() {
  const [id] = useState(() => `id-${globalCounter++}`);
  
  return (
    <div>
      <label htmlFor={id}>用户名:</label>
      <input id={id} />
    </div>
  );
  
  // 问题：在严格模式下组件可能mount两次
  // 导致计数器跳跃
}

// ✅ 解决：使用useId
function ProperUseId() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>用户名:</label>
      <input id={id} />
    </div>
  );
  
  // useId生成的ID在服务器和客户端保持一致
  // 即使组件mount多次也保持稳定
}
```

### 1.3 useId的特点

```jsx
function UseIdCharacteristics() {
  const id1 = useId();
  const id2 = useId();
  const id3 = useId();
  
  console.log('ID1:', id1);  // ":r1:"
  console.log('ID2:', id2);  // ":r2:"
  console.log('ID3:', id3);  // ":r3:"
  
  // 特点1：每次调用useId返回不同的ID
  // 特点2：同一个组件的多次渲染，useId返回相同的ID
  // 特点3：SSR和客户端生成的ID一致
  // 特点4：ID格式不保证，不要依赖具体格式
  // 特点5：ID在整个应用中全局唯一
  
  return (
    <div>
      <div>
        <label htmlFor={id1}>字段1:</label>
        <input id={id1} />
      </div>
      
      <div>
        <label htmlFor={id2}>字段2:</label>
        <input id={id2} />
      </div>
      
      <div>
        <label htmlFor={id3}>字段3:</label>
        <input id={id3} />
      </div>
    </div>
  );
}
```

### 1.4 useId的内部机制

```jsx
// useId是如何工作的？

// 1. React在组件树中维护一个ID计数器
// 2. 每个useId调用递增计数器
// 3. 生成格式：":r{counter}:"

// 在服务器端：
// Component A calls useId() -> ":S1:"
// Component B calls useId() -> ":S2:"

// 在客户端hydration时：
// Component A calls useId() -> ":S1:" (相同！)
// Component B calls useId() -> ":S2:" (相同！)

// React使用组件树的结构来确保一致性
// 只要组件树结构相同，ID就会一致

function DemoUseIdMechanism() {
  const id = useId();
  
  // 不要这样做：
  // ❌ const customId = `my-${id}`;  // 可以，但不推荐修改格式
  // ❌ if (someCondition) id = useId();  // 错误！条件调用
  
  // ✅ 正确用法：
  const labelId = `${id}-label`;
  const inputId = `${id}-input`;
  const descId = `${id}-desc`;
  
  return (
    <div>
      <label id={labelId} htmlFor={inputId}>用户名:</label>
      <input id={inputId} aria-describedby={descId} />
      <span id={descId}>请输入您的用户名</span>
    </div>
  );
}
```

## 第二部分：表单可访问性

### 2.1 基础label和input关联

```jsx
function FormField({ label, type = 'text', ...props }) {
  const id = useId();
  
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} {...props} />
    </div>
  );
}

// 使用
function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  return (
    <form>
      <FormField
        label="用户名"
        value={formData.username}
        onChange={handleChange('username')}
      />
      <FormField
        label="邮箱"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
      />
      <FormField
        label="密码"
        type="password"
        value={formData.password}
        onChange={handleChange('password')}
      />
      
      <button type="submit">注册</button>
    </form>
  );
}

// 每个FormField实例都有唯一的ID
// 点击label会聚焦对应的input
// 屏幕阅读器可以正确关联label和input
```

### 2.2 高级可访问性：aria-labelledby和aria-describedby

```jsx
function AccessibleField({ 
  label, 
  description, 
  error, 
  required = false,
  ...props 
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  
  return (
    <div className="field">
      <label id={labelId} htmlFor={id}>
        {label}
        {required && <span aria-label="必填" className="required">*</span>}
      </label>
      
      <input
        id={id}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-errormessage={error ? errorId : undefined}
        aria-required={required}
        {...props}
      />
      
      {description && (
        <span id={descriptionId} className="description">
          {description}
        </span>
      )}
      
      {error && (
        <span id={errorId} className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

// 使用
function AccessibleForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const validateEmail = (value) => {
    if (!value) {
      setEmailError('邮箱不能为空');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('邮箱格式不正确');
    } else {
      setEmailError('');
    }
  };
  
  const validatePassword = (value) => {
    if (!value) {
      setPasswordError('密码不能为空');
    } else if (value.length < 8) {
      setPasswordError('密码至少8个字符');
    } else {
      setPasswordError('');
    }
  };
  
  return (
    <form>
      <AccessibleField
        label="邮箱"
        description="我们不会分享您的邮箱地址"
        error={emailError}
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        onBlur={e => validateEmail(e.target.value)}
        type="email"
      />
      
      <AccessibleField
        label="密码"
        description="密码至少需要8个字符"
        error={passwordError}
        required
        value={password}
        onChange={e => setPassword(e.target.value)}
        onBlur={e => validatePassword(e.target.value)}
        type="password"
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 2.3 单选按钮组

```jsx
function RadioGroup({ name, options, value, onChange, required = false }) {
  const groupId = useId();
  const labelId = `${groupId}-label`;
  
  return (
    <div role="radiogroup" aria-labelledby={labelId} aria-required={required}>
      <div id={labelId} className="group-label">
        {name}
        {required && <span aria-label="必填">*</span>}
      </div>
      
      {options.map((option, index) => {
        const optionId = `${groupId}-option-${index}`;
        
        return (
          <label key={option.value} htmlFor={optionId} className="radio-label">
            <input
              id={optionId}
              type="radio"
              name={groupId}  // 使用useId作为name，确保唯一
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-checked={value === option.value}
            />
            <span>{option.label}</span>
            {option.description && (
              <span className="option-description">{option.description}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

// 使用
function PreferenceForm() {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('zh-CN');
  const [notifications, setNotifications] = useState('email');
  
  return (
    <form>
      <RadioGroup
        name="主题偏好"
        required
        options={[
          { value: 'light', label: '浅色模式', description: '白色背景' },
          { value: 'dark', label: '深色模式', description: '黑色背景' },
          { value: 'auto', label: '自动', description: '跟随系统' }
        ]}
        value={theme}
        onChange={setTheme}
      />
      
      <RadioGroup
        name="语言"
        required
        options={[
          { value: 'zh-CN', label: '简体中文' },
          { value: 'en-US', label: 'English' },
          { value: 'ja-JP', label: '日本語' }
        ]}
        value={language}
        onChange={setLanguage}
      />
      
      <RadioGroup
        name="通知方式"
        options={[
          { value: 'email', label: '邮件通知' },
          { value: 'sms', label: '短信通知' },
          { value: 'push', label: '推送通知' },
          { value: 'none', label: '不接收通知' }
        ]}
        value={notifications}
        onChange={setNotifications}
      />
      
      <button type="submit">保存设置</button>
    </form>
  );
}
```

### 2.4 复选框组

```jsx
function CheckboxGroup({ name, options, values = [], onChange, required = false }) {
  const groupId = useId();
  const labelId = `${groupId}-label`;
  
  const handleToggle = (value) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };
  
  return (
    <fieldset className="checkbox-group" aria-required={required}>
      <legend id={labelId}>
        {name}
        {required && <span aria-label="必填">*</span>}
      </legend>
      
      {options.map((option, index) => {
        const optionId = `${groupId}-option-${index}`;
        const isChecked = values.includes(option.value);
        
        return (
          <label key={option.value} htmlFor={optionId} className="checkbox-label">
            <input
              id={optionId}
              type="checkbox"
              value={option.value}
              checked={isChecked}
              onChange={() => handleToggle(option.value)}
              aria-checked={isChecked}
            />
            <span>{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}

// 使用
function InterestsForm() {
  const [interests, setInterests] = useState([]);
  
  return (
    <form>
      <CheckboxGroup
        name="兴趣爱好"
        options={[
          { value: 'sports', label: '运动' },
          { value: 'music', label: '音乐' },
          { value: 'reading', label: '阅读' },
          { value: 'travel', label: '旅行' },
          { value: 'cooking', label: '烹饪' }
        ]}
        values={interests}
        onChange={setInterests}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 第三部分：复杂表单

### 3.1 密码字段与强度指示器

```jsx
function PasswordField({ value, onChange, onBlur, error }) {
  const passwordId = useId();
  const labelId = `${passwordId}-label`;
  const strengthId = `${passwordId}-strength`;
  const requirementsId = `${passwordId}-requirements`;
  const errorId = `${passwordId}-error`;
  
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const checkStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  
  const handleChange = (e) => {
    const value = e.target.value;
    onChange(e);
    setStrength(checkStrength(value));
  };
  
  const strengthLabels = ['很弱', '弱', '中等', '强', '很强'];
  const strengthColors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];
  
  return (
    <div className="password-field">
      <label id={labelId} htmlFor={passwordId}>
        密码:
        <span aria-label="必填">*</span>
      </label>
      
      <div className="password-input-wrapper">
        <input
          id={passwordId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          aria-labelledby={labelId}
          aria-describedby={`${strengthId} ${requirementsId}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-errormessage={error ? errorId : undefined}
          aria-required="true"
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? '隐藏密码' : '显示密码'}
          className="toggle-password"
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
      
      {value && (
        <div id={strengthId} className="password-strength" aria-live="polite">
          <span>密码强度: {strengthLabels[strength]}</span>
          <div className="strength-bar">
            <div
              className="strength-fill"
              style={{
                width: `${strength * 20}%`,
                background: strengthColors[strength]
              }}
              role="progressbar"
              aria-valuenow={strength}
              aria-valuemin={0}
              aria-valuemax={5}
              aria-label="密码强度"
            />
          </div>
        </div>
      )}
      
      <div id={requirementsId} className="requirements">
        <p>密码要求:</p>
        <ul>
          <li className={value.length >= 8 ? 'met' : ''} aria-label={value.length >= 8 ? '已满足' : '未满足'}>
            至少8个字符
          </li>
          <li className={/[A-Z]/.test(value) ? 'met' : ''} aria-label={/[A-Z]/.test(value) ? '已满足' : '未满足'}>
            包含大写字母
          </li>
          <li className={/[a-z]/.test(value) ? 'met' : ''} aria-label={/[a-z]/.test(value) ? '已满足' : '未满足'}>
            包含小写字母
          </li>
          <li className={/[0-9]/.test(value) ? 'met' : ''} aria-label={/[0-9]/.test(value) ? '已满足' : '未满足'}>
            包含数字
          </li>
          <li className={/[^A-Za-z0-9]/.test(value) ? 'met' : ''} aria-label={/[^A-Za-z0-9]/.test(value) ? '已满足' : '未满足'}>
            包含特殊字符
          </li>
        </ul>
      </div>
      
      {error && (
        <div id={errorId} className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

// 使用
function SignupForm() {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const validatePassword = () => {
    if (!password) {
      setPasswordError('密码不能为空');
    } else if (password.length < 8) {
      setPasswordError('密码至少需要8个字符');
    } else {
      setPasswordError('');
    }
  };
  
  return (
    <form>
      <PasswordField
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={validatePassword}
        error={passwordError}
      />
      
      <button type="submit">注册</button>
    </form>
  );
}
```

### 3.2 日期范围选择器

```jsx
function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }) {
  const rangeId = useId();
  const startId = `${rangeId}-start`;
  const endId = `${rangeId}-end`;
  const labelId = `${rangeId}-label`;
  const errorId = `${rangeId}-error`;
  
  const [error, setError] = useState('');
  
  const validateRange = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('开始日期不能晚于结束日期');
    } else {
      setError('');
    }
  };
  
  useEffect(() => {
    validateRange();
  }, [startDate, endDate]);
  
  return (
    <div className="date-range-picker" role="group" aria-labelledby={labelId}>
      <div id={labelId} className="range-label">选择日期范围</div>
      
      <div className="date-inputs">
        <div>
          <label htmlFor={startId}>开始日期:</label>
          <input
            id={startId}
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            aria-invalid={error ? 'true' : 'false'}
            aria-errormessage={error ? errorId : undefined}
          />
        </div>
        
        <span className="separator" aria-hidden="true">至</span>
        
        <div>
          <label htmlFor={endId}>结束日期:</label>
          <input
            id={endId}
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            aria-invalid={error ? 'true' : 'false'}
            aria-errormessage={error ? errorId : undefined}
          />
        </div>
      </div>
      
      {error && (
        <div id={errorId} className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

// 使用
function ReportForm() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  return (
    <form>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
      />
      
      <button type="submit">生成报告</button>
    </form>
  );
}
```

### 3.3 文件上传组件

```jsx
function FileUpload({ accept, multiple = false, maxSize = 5 * 1024 * 1024, onChange }) {
  const uploadId = useId();
  const labelId = `${uploadId}-label`;
  const descId = `${uploadId}-desc`;
  const errorId = `${uploadId}-error`;
  const listId = `${uploadId}-list`;
  
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const errors = [];
    
    selectedFiles.forEach(file => {
      if (file.size > maxSize) {
        errors.push(`${file.name} 超过最大大小限制`);
      } else {
        validFiles.push(file);
      }
    });
    
    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError('');
    }
    
    setFiles(validFiles);
    onChange(validFiles);
  };
  
  const handleRemove = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange(newFiles);
  };
  
  return (
    <div className="file-upload">
      <label id={labelId} htmlFor={uploadId}>
        上传文件
      </label>
      
      <input
        id={uploadId}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        aria-labelledby={labelId}
        aria-describedby={descId}
        aria-invalid={error ? 'true' : 'false'}
        aria-errormessage={error ? errorId : undefined}
        className="file-input"
      />
      
      <div id={descId} className="description">
        最大文件大小: {(maxSize / 1024 / 1024).toFixed(1)}MB
        {accept && ` | 支持格式: ${accept}`}
      </div>
      
      {error && (
        <div id={errorId} className="error" role="alert">
          {error}
        </div>
      )}
      
      {files.length > 0 && (
        <ul id={listId} className="file-list" aria-label="已选择的文件">
          {files.map((file, index) => {
            const fileId = `${uploadId}-file-${index}`;
            return (
              <li key={index} id={fileId}>
                <span>{file.name}</span>
                <span className="file-size">
                  ({(file.size / 1024).toFixed(1)}KB)
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  aria-label={`删除 ${file.name}`}
                >
                  删除
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

## 第四部分：列表项ID

### 4.1 动态列表

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '学习React', completed: false },
    { id: 2, text: '练习useId', completed: false },
    { id: 3, text: '构建项目', completed: true }
  ]);
  
  const [newTodo, setNewTodo] = useState('');
  
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    }
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  return (
    <div className="todo-list">
      <h2>待办事项</h2>
      
      <div className="add-todo">
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="添加新任务"
          aria-label="新任务"
        />
        <button onClick={addTodo}>添加</button>
      </div>
      
      <ul aria-label="任务列表">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
}

function TodoItem({ todo, onToggle, onDelete }) {
  const checkboxId = useId();
  const deleteId = `${checkboxId}-delete`;
  
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        id={checkboxId}
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label={`标记"${todo.text}"为${todo.completed ? '未完成' : '已完成'}`}
      />
      <label htmlFor={checkboxId}>{todo.text}</label>
      <button
        id={deleteId}
        onClick={() => onDelete(todo.id)}
        aria-label={`删除"${todo.text}"`}
      >
        删除
      </button>
    </li>
  );
}
```

### 4.2 可编辑列表

```jsx
function EditableList() {
  const [items, setItems] = useState([
    { id: 1, name: '项目1', editing: false },
    { id: 2, name: '项目2', editing: false }
  ]);
  
  const updateItem = (id, newName) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, name: newName, editing: false } : item
    ));
  };
  
  const toggleEdit = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, editing: !item.editing } : item
    ));
  };
  
  return (
    <ul aria-label="可编辑列表">
      {items.map(item => (
        <EditableItem
          key={item.id}
          item={item}
          onUpdate={updateItem}
          onToggleEdit={toggleEdit}
        />
      ))}
    </ul>
  );
}

function EditableItem({ item, onUpdate, onToggleEdit }) {
  const itemId = useId();
  const inputId = `${itemId}-input`;
  const editBtnId = `${itemId}-edit`;
  const saveBtnId = `${itemId}-save`;
  
  const [editValue, setEditValue] = useState(item.name);
  
  const handleSave = () => {
    onUpdate(item.id, editValue);
  };
  
  const handleCancel = () => {
    setEditValue(item.name);
    onToggleEdit(item.id);
  };
  
  return (
    <li>
      {item.editing ? (
        <div className="editing">
          <label htmlFor={inputId} className="sr-only">
            编辑 {item.name}
          </label>
          <input
            id={inputId}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button id={saveBtnId} onClick={handleSave}>保存</button>
          <button onClick={handleCancel}>取消</button>
        </div>
      ) : (
        <div className="viewing">
          <span>{item.name}</span>
          <button id={editBtnId} onClick={() => onToggleEdit(item.id)}>
            编辑
          </button>
        </div>
      )}
    </li>
  );
}
```

## 第五部分：SSR兼容

### 5.1 服务器端渲染

```jsx
// Server Component
function ServerRenderedForm() {
  const id = useId();
  
  // 服务器渲染时生成ID: ":S1:"
  // 客户端hydrate时生成相同ID: ":S1:"
  // 不会出现hydration mismatch
  
  return (
    <div>
      <label htmlFor={id}>邮箱:</label>
      <input id={id} type="email" />
    </div>
  );
}

// 对比：使用随机数的问题
function ProblematicSSR() {
  const [id] = useState(() => Math.random().toString());
  
  // 服务器: "0.123456"
  // 客户端: "0.789012"
  // ⚠️ Hydration mismatch!
  
  return (
    <div>
      <label htmlFor={id}>邮箱:</label>
      <input id={id} type="email" />
    </div>
  );
}
```

### 5.2 Next.js中的useId

```jsx
// app/login/page.tsx (Server Component)
export default function LoginPage() {
  return <LoginForm />;
}

// components/LoginForm.tsx (Client Component)
'use client';

import { useId, useState } from 'react';

export function LoginForm() {
  const formId = useId();
  const emailId = `${formId}-email`;
  const passwordId = `${formId}-password`;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 处理登录逻辑
  };
  
  return (
    <form id={formId} onSubmit={handleSubmit}>
      <div>
        <label htmlFor={emailId}>邮箱:</label>
        <input
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor={passwordId}>密码:</label>
        <input
          id={passwordId}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      <button type="submit">登录</button>
    </form>
  );
}
```

### 5.3 处理条件渲染

```jsx
function ConditionalForm({ showEmail = true }) {
  // ❌ 错误：条件调用useId
  // const id = showEmail ? useId() : null;
  
  // ✅ 正确：总是调用useId
  const id = useId();
  
  return (
    <form>
      {showEmail && (
        <div>
          <label htmlFor={id}>邮箱:</label>
          <input id={id} type="email" />
        </div>
      )}
    </form>
  );
}
```

## 第六部分：与表单库集成

### 6.1 使用react-hook-form

```jsx
import { useForm, Controller } from 'react-hook-form';

function CustomInput({ label, name, control, rules, ...props }) {
  const id = useId();
  const errorId = `${id}-error`;
  
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <div className="form-field">
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            {...field}
            {...props}
            aria-invalid={error ? 'true' : 'false'}
            aria-errormessage={error ? errorId : undefined}
          />
          {error && (
            <span id={errorId} className="error" role="alert">
              {error.message}
            </span>
          )}
        </div>
      )}
    />
  );
}

function HookFormExample() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  });
  
  const onSubmit = (data) => {
    console.log(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CustomInput
        label="用户名"
        name="username"
        control={control}
        rules={{ required: '用户名不能为空' }}
      />
      
      <CustomInput
        label="邮箱"
        name="email"
        control={control}
        type="email"
        rules={{
          required: '邮箱不能为空',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: '邮箱格式不正确'
          }
        }}
      />
      
      <CustomInput
        label="密码"
        name="password"
        control={control}
        type="password"
        rules={{
          required: '密码不能为空',
          minLength: {
            value: 8,
            message: '密码至少8个字符'
          }
        }}
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

### 6.2 使用Formik

```jsx
import { Formik, Field, Form, ErrorMessage } from 'formik';

function FormikField({ label, name, ...props }) {
  const id = useId();
  const errorId = `${id}-error`;
  
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <Field
        id={id}
        name={name}
        {...props}
        aria-describedby={errorId}
      />
      <ErrorMessage name={name}>
        {msg => (
          <span id={errorId} className="error" role="alert">
            {msg}
          </span>
        )}
      </ErrorMessage>
    </div>
  );
}

function FormikExample() {
  return (
    <Formik
      initialValues={{
        username: '',
        email: '',
        password: ''
      }}
      validate={values => {
        const errors = {};
        
        if (!values.username) {
          errors.username = '用户名不能为空';
        }
        
        if (!values.email) {
          errors.email = '邮箱不能为空';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          errors.email = '邮箱格式不正确';
        }
        
        if (!values.password) {
          errors.password = '密码不能为空';
        } else if (values.password.length < 8) {
          errors.password = '密码至少8个字符';
        }
        
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          console.log(values);
          setSubmitting(false);
        }, 400);
      }}
    >
      <Form>
        <FormikField label="用户名" name="username" />
        <FormikField label="邮箱" name="email" type="email" />
        <FormikField label="密码" name="password" type="password" />
        
        <button type="submit">提交</button>
      </Form>
    </Formik>
  );
}
```

## 第七部分：TypeScript集成

### 7.1 类型安全的表单组件

```typescript
import { useId, InputHTMLAttributes } from 'react';

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
}

function TypedFormField({
  label,
  error,
  description,
  required = false,
  ...props
}: FormFieldProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-label="必填">*</span>}
      </label>
      
      <input
        id={id}
        aria-describedby={description ? descriptionId : undefined}
        aria-invalid={error ? 'true' : 'false'}
        aria-errormessage={error ? errorId : undefined}
        aria-required={required}
        {...props}
      />
      
      {description && (
        <span id={descriptionId} className="description">
          {description}
        </span>
      )}
      
      {error && (
        <span id={errorId} className="error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

### 7.2 泛型单选按钮组

```typescript
interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioGroupProps<T extends string = string> {
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
}

function TypedRadioGroup<T extends string = string>({
  name,
  options,
  value,
  onChange,
  required = false
}: RadioGroupProps<T>) {
  const groupId = useId();
  const labelId = `${groupId}-label`;
  
  return (
    <div role="radiogroup" aria-labelledby={labelId} aria-required={required}>
      <div id={labelId} className="group-label">
        {name}
        {required && <span aria-label="必填">*</span>}
      </div>
      
      {options.map((option, index) => {
        const optionId = `${groupId}-option-${index}`;
        
        return (
          <label key={option.value} htmlFor={optionId}>
            <input
              id={optionId}
              type="radio"
              name={groupId}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
            {option.description && (
              <span className="description">{option.description}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}

// 使用
type Theme = 'light' | 'dark' | 'auto';

function ThemeSelector() {
  const [theme, setTheme] = useState<Theme>('light');
  
  return (
    <TypedRadioGroup<Theme>
      name="主题"
      options={[
        { value: 'light', label: '浅色' },
        { value: 'dark', label: '深色' },
        { value: 'auto', label: '自动' }
      ]}
      value={theme}
      onChange={setTheme}
    />
  );
}
```

## 第八部分：性能优化

### 8.1 避免不必要的ID生成

```jsx
// ❌ 不好：每次渲染都调用useId
function BadComponent({ showForm }) {
  if (!showForm) {
    return null;
  }
  
  const id = useId();  // 即使不显示，也会生成ID
  
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}

// ✅ 好：组件级别调用useId
function GoodComponent({ showForm }) {
  const id = useId();
  
  if (!showForm) {
    return null;
  }
  
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}

// 或者拆分组件
function FormWrapper({ showForm }) {
  if (!showForm) {
    return null;
  }
  
  return <ActualForm />;
}

function ActualForm() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}
```

### 8.2 复用ID

```jsx
function EfficientFormField() {
  const baseId = useId();  // 只调用一次useId
  
  // 从基础ID派生其他ID
  const inputId = `${baseId}-input`;
  const labelId = `${baseId}-label`;
  const descId = `${baseId}-desc`;
  const errorId = `${baseId}-error`;
  
  return (
    <div>
      <label id={labelId} htmlFor={inputId}>
        用户名:
      </label>
      <input
        id={inputId}
        aria-labelledby={labelId}
        aria-describedby={descId}
        aria-errormessage={errorId}
      />
      <span id={descId}>请输入用户名</span>
      <span id={errorId} className="error" role="alert" />
    </div>
  );
}
```

## 注意事项

### 1. Hook调用规则

useId必须遵循React Hooks规则：

```jsx
// ❌ 错误：条件调用
function BadComponent({ needsId }) {
  if (needsId) {
    const id = useId();  // 错误！
  }
  
  return <div />;
}

// ❌ 错误：循环调用
function BadList({ items }) {
  return items.map(item => {
    const id = useId();  // 错误！
    return <div key={id}>{item}</div>;
  });
}

// ✅ 正确：顶层调用
function GoodComponent() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}

// ✅ 正确：在子组件中调用
function GoodList({ items }) {
  return items.map(item => (
    <ListItem key={item.id} item={item} />
  ));
}

function ListItem({ item }) {
  const id = useId();  // 正确！
  return <div>{item.name}</div>;
}
```

### 2. 不要依赖ID格式

```jsx
// ❌ 错误：依赖ID格式
function BadComponent() {
  const id = useId();
  
  // 不要解析或依赖ID格式
  const number = parseInt(id.match(/\d+/)[0]);  // 错误！
  
  return <div />;
}

// ✅ 正确：只用于关联元素
function GoodComponent() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}
```

### 3. 不用于key属性

```jsx
// ❌ 错误：用useId作为key
function BadList({ items }) {
  return items.map(item => {
    const id = useId();
    return <div key={id}>{item.name}</div>;  // 错误！
  });
}

// ✅ 正确：使用数据的唯一标识作为key
function GoodList({ items }) {
  return items.map(item => (
    <div key={item.id}>{item.name}</div>
  ));
}

// ✅ 正确：useId用于可访问性
function GoodListItem({ item }) {
  const checkboxId = useId();
  
  return (
    <div>
      <input id={checkboxId} type="checkbox" />
      <label htmlFor={checkboxId}>{item.name}</label>
    </div>
  );
}
```

### 4. SSR时的一致性

```jsx
// ✅ 确保服务器和客户端组件树一致
function ServerAndClient() {
  const id = useId();
  
  // 组件结构在服务器和客户端必须相同
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}

// ❌ 避免条件渲染导致不一致
function Inconsistent({ isServer }) {
  const id = useId();
  
  if (isServer) {
    return <div>服务器版本</div>;
  }
  
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}
```

### 5. 与第三方库兼容

```jsx
// 使用第三方库时确保ID传递正确
import Select from 'react-select';

function CustomSelect({ label, options, value, onChange }) {
  const id = useId();
  const inputId = `${id}-input`;
  
  return (
    <div>
      <label id={id}>{label}</label>
      <Select
        inputId={inputId}  // 传递ID给第三方组件
        aria-labelledby={id}
        options={options}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
```

## 常见问题

### 1. useId生成的ID格式是什么？

useId生成的ID格式不保证，通常类似`:r1:`、`:r2:`等。不要依赖具体格式。

```jsx
function DemoIdFormat() {
  const id1 = useId();
  const id2 = useId();
  
  console.log(id1);  // 可能是 ":r1:"
  console.log(id2);  // 可能是 ":r2:"
  
  // 但不要依赖这个格式！
  // React可能在未来版本改变格式
  
  return <div />;
}
```

### 2. 可以用useId生成数据库ID吗？

不可以。useId仅用于UI关联，不适合作为数据库ID。

```jsx
// ❌ 错误：用作数据库ID
function BadUsage() {
  const id = useId();
  
  const saveToDatabase = () => {
    fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ id })  // 错误！
    });
  };
  
  return <button onClick={saveToDatabase}>保存</button>;
}

// ✅ 正确：使用UUID或数据库生成的ID
import { v4 as uuidv4 } from 'uuid';

function GoodUsage() {
  const [dataId] = useState(() => uuidv4());
  
  const saveToDatabase = () => {
    fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ id: dataId })
    });
  };
  
  return <button onClick={saveToDatabase}>保存</button>;
}
```

### 3. 如何在循环中使用useId？

不能直接在循环中调用useId，应该在子组件中调用。

```jsx
// ❌ 错误
function BadLoop({ items }) {
  return (
    <div>
      {items.map(item => {
        const id = useId();  // 错误！
        return (
          <div key={item.id}>
            <label htmlFor={id}>{item.label}</label>
            <input id={id} />
          </div>
        );
      })}
    </div>
  );
}

// ✅ 正确
function GoodLoop({ items }) {
  return (
    <div>
      {items.map(item => (
        <FormField key={item.id} item={item} />
      ))}
    </div>
  );
}

function FormField({ item }) {
  const id = useId();  // 正确！
  
  return (
    <div>
      <label htmlFor={id}>{item.label}</label>
      <input id={id} />
    </div>
  );
}
```

### 4. useId与useState生成ID的区别？

useId是为可访问性和SSR设计的，useState生成的ID在SSR中会不一致。

```jsx
// useState方案
function UseStateId() {
  const [id] = useState(() => `id-${Math.random()}`);
  
  // 问题：
  // 1. 服务器和客户端ID不同，导致hydration警告
  // 2. 严格模式下可能重复生成
  
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}

// useId方案
function UseIdSolution() {
  const id = useId();
  
  // 优点：
  // 1. 服务器和客户端ID一致
  // 2. 严格模式下稳定
  // 3. 专为可访问性设计
  
  return (
    <div>
      <label htmlFor={id}>输入:</label>
      <input id={id} />
    </div>
  );
}
```

### 5. 多个useId调用性能如何？

useId非常轻量，多次调用不会有明显性能影响。

```jsx
function MultipleIds() {
  const id1 = useId();
  const id2 = useId();
  const id3 = useId();
  const id4 = useId();
  const id5 = useId();
  
  // 性能影响微乎其微
  // 但仍然推荐复用基础ID
  
  return <div />;
}

// 推荐：复用基础ID
function EfficientIds() {
  const baseId = useId();
  
  const id1 = `${baseId}-1`;
  const id2 = `${baseId}-2`;
  const id3 = `${baseId}-3`;
  const id4 = `${baseId}-4`;
  const id5 = `${baseId}-5`;
  
  return <div />;
}
```

### 6. 如何在测试中处理useId？

测试中useId会生成稳定的ID。

```jsx
import { render, screen } from '@testing-library/react';

function FormField() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>用户名</label>
      <input id={id} />
    </div>
  );
}

test('label关联input', () => {
  render(<FormField />);
  
  const label = screen.getByText('用户名');
  const input = screen.getByLabelText('用户名');
  
  // useId生成的ID确保label和input正确关联
  expect(label).toHaveAttribute('for', input.id);
});
```

## 总结

### useId核心要点

1. **主要用途**
   - 生成唯一、稳定的ID
   - 关联表单元素（label、input）
   - 实现可访问性（aria属性）
   - SSR兼容

2. **使用场景**
   - 表单字段关联
   - aria-labelledby、aria-describedby
   - aria-errormessage
   - 单选/复选按钮组
   - 任何需要唯一ID的地方

3. **优势**
   - 服务器和客户端一致
   - 避免hydration警告
   - 专为可访问性设计
   - 简单易用

4. **注意事项**
   - 遵循Hooks规则（顶层调用）
   - 不用于key属性
   - 不依赖ID格式
   - 不用于数据持久化

5. **最佳实践**
   - 在组件顶层调用
   - 复用基础ID（派生子ID）
   - 结合aria属性使用
   - 确保SSR组件树一致

6. **可访问性价值**
   - 正确关联表单元素
   - 支持屏幕阅读器
   - 提升用户体验
   - 符合WCAG标准

7. **性能考虑**
   - 非常轻量
   - 可以多次调用
   - 推荐复用基础ID
   - 不会影响渲染性能

通过本章学习，你已经全面掌握了useId的使用。useId虽然简单，但对可访问性和SSR至关重要。记住：可访问性不是可选项，而是必需品！使用useId让你的应用对所有用户友好。
