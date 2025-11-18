# Action表单提交

## 概述

React Router v6的Action机制提供了声明式的表单提交处理方案，与传统的事件处理相比，Action让表单处理更加优雅、可靠，并且自动处理加载状态、错误处理和导航。Action与Loader配合使用，构成了完整的数据流管理系统。

## Action基础

### 基础Action用法

```jsx
import { Form, useActionData, redirect } from 'react-router-dom';

// Action函数
async function createUserAction({ request }) {
  // 获取表单数据
  const formData = await request.formData();
  
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role')
  };

  // 验证数据
  const errors = {};
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (Object.keys(errors).length > 0) {
    return { errors, values: userData };
  }

  try {
    // 提交到服务器
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    const newUser = await response.json();

    // 成功后重定向
    return redirect(`/users/${newUser.id}`);

  } catch (error) {
    return { 
      errors: { 
        _form: 'Failed to create user. Please try again.' 
      },
      values: userData
    };
  }
}

// 路由配置
const router = createBrowserRouter([
  {
    path: '/users/new',
    element: <CreateUser />,
    action: createUserAction
  }
]);

// 组件
function CreateUser() {
  const actionData = useActionData();
  const navigation = useNavigation();
  
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="create-user">
      <h1>Create New User</h1>

      {actionData?.errors?._form && (
        <div className="error-banner">
          {actionData.errors._form}
        </div>
      )}

      <Form method="post">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={actionData?.values?.name}
            required
          />
          {actionData?.errors?.name && (
            <span className="error">{actionData.errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={actionData?.values?.email}
            required
          />
          {actionData?.errors?.email && (
            <span className="error">{actionData.errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            defaultValue={actionData?.values?.role || 'user'}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create User'}
          </button>
          <Link to="/users">Cancel</Link>
        </div>
      </Form>
    </div>
  );
}
```

### 更新操作Action

```jsx
// 编辑用户Action
async function updateUserAction({ params, request }) {
  const { userId } = params;
  const formData = await request.formData();

  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    bio: formData.get('bio')
  };

  // 验证
  const errors = validateUserData(userData);
  if (Object.keys(errors).length > 0) {
    return { errors, values: userData };
  }

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Update failed');
    }

    // 更新成功，返回成功消息
    return { 
      success: true, 
      message: 'User updated successfully' 
    };

  } catch (error) {
    return {
      errors: { 
        _form: 'Failed to update user. Please try again.' 
      },
      values: userData
    };
  }
}

// 编辑用户组件
function EditUser() {
  const user = useLoaderData(); // 从Loader获取当前用户数据
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === 'submitting';

  // 显示成功消息
  useEffect(() => {
    if (actionData?.success) {
      const timer = setTimeout(() => {
        // 清除成功消息或执行其他操作
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  return (
    <div className="edit-user">
      <h1>Edit User: {user.name}</h1>

      {actionData?.success && (
        <div className="success-banner">
          {actionData.message}
        </div>
      )}

      {actionData?.errors?._form && (
        <div className="error-banner">
          {actionData.errors._form}
        </div>
      )}

      <Form method="post">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={actionData?.values?.name || user.name}
            required
          />
          {actionData?.errors?.name && (
            <span className="error">{actionData.errors.name}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            defaultValue={actionData?.values?.email || user.email}
            required
          />
          {actionData?.errors?.email && (
            <span className="error">{actionData.errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            rows="5"
            defaultValue={actionData?.values?.bio || user.bio}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link to={`/users/${user.id}`}>Cancel</Link>
        </div>
      </Form>
    </div>
  );
}
```

### 删除操作Action

```jsx
// 删除用户Action
async function deleteUserAction({ params, request }) {
  const { userId } = params;
  const formData = await request.formData();
  
  // 获取确认标志
  const confirmed = formData.get('confirmed') === 'true';
  
  if (!confirmed) {
    return {
      error: 'Delete action must be confirmed'
    };
  }

  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    // 删除成功，重定向到用户列表
    return redirect('/users?deleted=true');

  } catch (error) {
    return {
      error: 'Failed to delete user. Please try again.'
    };
  }
}

// 用户详情页with删除功能
function UserDetail() {
  const user = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isDeleting = navigation.state === 'submitting' && 
                     navigation.formData?.get('_action') === 'delete';

  return (
    <div className="user-detail">
      <div className="user-header">
        <h1>{user.name}</h1>
        <div className="user-actions">
          <Link to={`/users/${user.id}/edit`}>Edit</Link>
          <button onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
        </div>
      </div>

      <div className="user-info">
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Bio: {user.bio}</p>
      </div>

      {/* 删除确认模态框 */}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>

            {actionData?.error && (
              <div className="error-message">{actionData.error}</div>
            )}

            <Form method="post">
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="confirmed" value="true" />
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 复杂表单处理

### 多步骤表单

```jsx
// 多步骤表单Action
async function multiStepFormAction({ request }) {
  const formData = await request.formData();
  
  const step = parseInt(formData.get('_step') || '1', 10);
  const action = formData.get('_action');

  // 根据步骤处理数据
  switch (step) {
    case 1:
      return handleStep1(formData, action);
    case 2:
      return handleStep2(formData, action);
    case 3:
      return handleStep3(formData, action);
    default:
      return { error: 'Invalid step' };
  }
}

async function handleStep1(formData, action) {
  if (action === 'next') {
    const personalInfo = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };

    const errors = validatePersonalInfo(personalInfo);
    
    if (Object.keys(errors).length > 0) {
      return {
        step: 1,
        errors,
        values: personalInfo
      };
    }

    // 保存到session或临时存储
    await saveTemporaryData('step1', personalInfo);

    return {
      step: 2,
      values: personalInfo
    };
  }

  return { step: 1 };
}

async function handleStep2(formData, action) {
  if (action === 'back') {
    return { step: 1 };
  }

  if (action === 'next') {
    const addressInfo = {
      street: formData.get('street'),
      city: formData.get('city'),
      state: formData.get('state'),
      zipCode: formData.get('zipCode'),
      country: formData.get('country')
    };

    const errors = validateAddressInfo(addressInfo);
    
    if (Object.keys(errors).length > 0) {
      return {
        step: 2,
        errors,
        values: addressInfo
      };
    }

    await saveTemporaryData('step2', addressInfo);

    return {
      step: 3,
      values: addressInfo
    };
  }

  return { step: 2 };
}

async function handleStep3(formData, action) {
  if (action === 'back') {
    return { step: 2 };
  }

  if (action === 'submit') {
    const paymentInfo = {
      cardNumber: formData.get('cardNumber'),
      cardName: formData.get('cardName'),
      expiryDate: formData.get('expiryDate'),
      cvv: formData.get('cvv')
    };

    const errors = validatePaymentInfo(paymentInfo);
    
    if (Object.keys(errors).length > 0) {
      return {
        step: 3,
        errors,
        values: paymentInfo
      };
    }

    // 获取所有步骤的数据
    const step1Data = await getTemporaryData('step1');
    const step2Data = await getTemporaryData('step2');

    const completeData = {
      ...step1Data,
      ...step2Data,
      ...paymentInfo
    };

    try {
      // 提交完整数据
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();

      // 清除临时数据
      await clearTemporaryData(['step1', 'step2']);

      // 重定向到成功页面
      return redirect(`/registration/success?id=${result.id}`);

    } catch (error) {
      return {
        step: 3,
        errors: {
          _form: 'Registration failed. Please try again.'
        },
        values: paymentInfo
      };
    }
  }

  return { step: 3 };
}

// 多步骤表单组件
function MultiStepForm() {
  const actionData = useActionData();
  const navigation = useNavigation();

  const currentStep = actionData?.step || 1;
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="multi-step-form">
      <div className="progress-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          Personal Info
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          Address
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          Payment
        </div>
      </div>

      <Form method="post">
        <input type="hidden" name="_step" value={currentStep} />

        {currentStep === 1 && (
          <Step1Form 
            errors={actionData?.errors}
            values={actionData?.values}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 2 && (
          <Step2Form
            errors={actionData?.errors}
            values={actionData?.values}
            isSubmitting={isSubmitting}
          />
        )}

        {currentStep === 3 && (
          <Step3Form
            errors={actionData?.errors}
            values={actionData?.values}
            isSubmitting={isSubmitting}
          />
        )}
      </Form>
    </div>
  );
}

function Step1Form({ errors, values, isSubmitting }) {
  return (
    <div className="form-step">
      <h2>Personal Information</h2>

      <div className="form-group">
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          defaultValue={values?.firstName}
          required
        />
        {errors?.firstName && (
          <span className="error">{errors.firstName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          defaultValue={values?.lastName}
          required
        />
        {errors?.lastName && (
          <span className="error">{errors.lastName}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={values?.email}
          required
        />
        {errors?.email && (
          <span className="error">{errors.email}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          defaultValue={values?.phone}
          required
        />
        {errors?.phone && (
          <span className="error">{errors.phone}</span>
        )}
      </div>

      <div className="form-actions">
        <button
          type="submit"
          name="_action"
          value="next"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function Step2Form({ errors, values, isSubmitting }) {
  return (
    <div className="form-step">
      <h2>Address Information</h2>

      <div className="form-group">
        <label htmlFor="street">Street Address</label>
        <input
          type="text"
          id="street"
          name="street"
          defaultValue={values?.street}
          required
        />
        {errors?.street && (
          <span className="error">{errors.street}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            defaultValue={values?.city}
            required
          />
          {errors?.city && (
            <span className="error">{errors.city}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="state">State</label>
          <input
            type="text"
            id="state"
            name="state"
            defaultValue={values?.state}
            required
          />
          {errors?.state && (
            <span className="error">{errors.state}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="zipCode">ZIP Code</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            defaultValue={values?.zipCode}
            required
          />
          {errors?.zipCode && (
            <span className="error">{errors.zipCode}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            defaultValue={values?.country || 'US'}
            required
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          name="_action"
          value="back"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="submit"
          name="_action"
          value="next"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function Step3Form({ errors, values, isSubmitting }) {
  return (
    <div className="form-step">
      <h2>Payment Information</h2>

      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          defaultValue={values?.cardNumber}
          placeholder="1234 5678 9012 3456"
          required
        />
        {errors?.cardNumber && (
          <span className="error">{errors.cardNumber}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="cardName">Name on Card</label>
        <input
          type="text"
          id="cardName"
          name="cardName"
          defaultValue={values?.cardName}
          required
        />
        {errors?.cardName && (
          <span className="error">{errors.cardName}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expiryDate">Expiry Date</label>
          <input
            type="text"
            id="expiryDate"
            name="expiryDate"
            defaultValue={values?.expiryDate}
            placeholder="MM/YY"
            required
          />
          {errors?.expiryDate && (
            <span className="error">{errors.expiryDate}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cvv">CVV</label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            defaultValue={values?.cvv}
            placeholder="123"
            required
          />
          {errors?.cvv && (
            <span className="error">{errors.cvv}</span>
          )}
        </div>
      </div>

      {errors?._form && (
        <div className="error-banner">{errors._form}</div>
      )}

      <div className="form-actions">
        <button
          type="submit"
          name="_action"
          value="back"
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          type="submit"
          name="_action"
          value="submit"
          disabled={isSubmitting}
          className="primary"
        >
          {isSubmitting ? 'Submitting...' : 'Complete Registration'}
        </button>
      </div>
    </div>
  );
}
```

### 文件上传Action

```jsx
// 文件上传Action
async function uploadFileAction({ request, params }) {
  const formData = await request.formData();
  
  const file = formData.get('file');
  const title = formData.get('title');
  const description = formData.get('description');
  const category = formData.get('category');

  // 验证
  const errors = {};

  if (!file || file.size === 0) {
    errors.file = 'Please select a file to upload';
  }

  if (file && file.size > 10 * 1024 * 1024) { // 10MB limit
    errors.file = 'File size must be less than 10MB';
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (file && !allowedTypes.includes(file.type)) {
    errors.file = 'File type not supported. Please upload JPEG, PNG, GIF, or PDF files.';
  }

  if (!title || title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: { title, description, category }
    };
  }

  try {
    // 上传文件到服务器
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('title', title);
    uploadFormData.append('description', description);
    uploadFormData.append('category', category);

    const response = await fetch('/api/uploads', {
      method: 'POST',
      body: uploadFormData
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();

    return redirect(`/files/${result.id}`);

  } catch (error) {
    return {
      errors: {
        _form: 'Failed to upload file. Please try again.'
      },
      values: { title, description, category }
    };
  }
}

// 文件上传组件
function FileUpload() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const isUploading = navigation.state === 'submitting';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // 生成预览
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  return (
    <div className="file-upload">
      <h1>Upload File</h1>

      {actionData?.errors?._form && (
        <div className="error-banner">
          {actionData.errors._form}
        </div>
      )}

      <Form method="post" encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="file">Select File</label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            required
          />
          {actionData?.errors?.file && (
            <span className="error">{actionData.errors.file}</span>
          )}
          
          {selectedFile && (
            <div className="file-info">
              <p>Selected: {selectedFile.name}</p>
              <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="file-preview">
            <img src={previewUrl} alt="Preview" />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={actionData?.values?.title}
            required
          />
          {actionData?.errors?.title && (
            <span className="error">{actionData.errors.title}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            defaultValue={actionData?.values?.description}
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            defaultValue={actionData?.values?.category || 'general'}
          >
            <option value="general">General</option>
            <option value="documents">Documents</option>
            <option value="images">Images</option>
            <option value="videos">Videos</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isUploading || !selectedFile}>
            {isUploading ? 'Uploading...' : 'Upload File'}
          </button>
          <Link to="/files">Cancel</Link>
        </div>

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <p>Uploading file...</p>
          </div>
        )}
      </Form>
    </div>
  );
}
```

### 批量操作Action

```jsx
// 批量操作Action
async function batchOperationAction({ request }) {
  const formData = await request.formData();
  
  const action = formData.get('_action');
  const selectedIds = formData.getAll('selectedIds');

  if (selectedIds.length === 0) {
    return {
      error: 'No items selected'
    };
  }

  try {
    switch (action) {
      case 'delete':
        await Promise.all(
          selectedIds.map(id =>
            fetch(`/api/items/${id}`, { method: 'DELETE' })
          )
        );
        return {
          success: true,
          message: `${selectedIds.length} items deleted successfully`
        };

      case 'archive':
        await Promise.all(
          selectedIds.map(id =>
            fetch(`/api/items/${id}/archive`, { method: 'POST' })
          )
        );
        return {
          success: true,
          message: `${selectedIds.length} items archived successfully`
        };

      case 'export':
        const response = await fetch('/api/items/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.csv';
        a.click();
        
        return {
          success: true,
          message: `${selectedIds.length} items exported successfully`
        };

      case 'update-category':
        const newCategory = formData.get('newCategory');
        await Promise.all(
          selectedIds.map(id =>
            fetch(`/api/items/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ category: newCategory })
            })
          )
        );
        return {
          success: true,
          message: `${selectedIds.length} items updated successfully`
        };

      default:
        return { error: 'Invalid action' };
    }
  } catch (error) {
    return {
      error: `Batch operation failed: ${error.message}`
    };
  }
}

// 批量操作组件
function ItemsList() {
  const { items } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);

  const isProcessing = navigation.state === 'submitting';

  const toggleSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  return (
    <div className="items-list">
      <div className="list-header">
        <h1>Items</h1>
        
        {selectedItems.size > 0 && (
          <div className="selection-info">
            {selectedItems.size} item(s) selected
            <button onClick={() => setShowBatchActions(!showBatchActions)}>
              Batch Actions
            </button>
          </div>
        )}
      </div>

      {actionData?.success && (
        <div className="success-banner">
          {actionData.message}
        </div>
      )}

      {actionData?.error && (
        <div className="error-banner">
          {actionData.error}
        </div>
      )}

      {showBatchActions && selectedItems.size > 0 && (
        <div className="batch-actions-panel">
          <h3>Batch Actions</h3>
          
          <Form method="post">
            {Array.from(selectedItems).map(id => (
              <input key={id} type="hidden" name="selectedIds" value={id} />
            ))}

            <div className="batch-actions-buttons">
              <button
                type="submit"
                name="_action"
                value="delete"
                disabled={isProcessing}
                onClick={(e) => {
                  if (!confirm(`Delete ${selectedItems.size} items?`)) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </button>

              <button
                type="submit"
                name="_action"
                value="archive"
                disabled={isProcessing}
              >
                Archive
              </button>

              <button
                type="submit"
                name="_action"
                value="export"
                disabled={isProcessing}
              >
                Export
              </button>

              <div className="batch-update-category">
                <select name="newCategory" required>
                  <option value="">Select Category</option>
                  <option value="category1">Category 1</option>
                  <option value="category2">Category 2</option>
                  <option value="category3">Category 3</option>
                </select>
                <button
                  type="submit"
                  name="_action"
                  value="update-category"
                  disabled={isProcessing}
                >
                  Update Category
                </button>
              </div>
            </div>
          </Form>
        </div>
      )}

      <table className="items-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedItems.size === items.length}
                onChange={selectAll}
              />
            </th>
            <th>Name</th>
            <th>Category</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelection(item.id)}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                <Link to={`/items/${item.id}`}>View</Link>
                <Link to={`/items/${item.id}/edit`}>Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Action与Loader协同

### 乐观更新

```jsx
// 带乐观更新的Action和Loader
async function todoLoader() {
  const response = await fetch('/api/todos');
  return response.json();
}

async function todoAction({ request }) {
  const formData = await request.formData();
  const action = formData.get('_action');

  switch (action) {
    case 'create':
      const newTodo = {
        title: formData.get('title'),
        completed: false
      };
      
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      });
      
      return { success: true };

    case 'toggle':
      const todoId = formData.get('todoId');
      const completed = formData.get('completed') === 'true';
      
      await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      
      return { success: true };

    case 'delete':
      const deleteId = formData.get('todoId');
      
      await fetch(`/api/todos/${deleteId}`, {
        method: 'DELETE'
      });
      
      return { success: true };

    default:
      return { error: 'Invalid action' };
  }
}

// Todo列表组件with乐观更新
function TodoList() {
  const initialTodos = useLoaderData();
  const navigation = useNavigation();
  const [optimisticTodos, setOptimisticTodos] = useState(initialTodos);

  // 当数据重新加载时更新
  useEffect(() => {
    setOptimisticTodos(initialTodos);
  }, [initialTodos]);

  const handleToggleOptimistic = (todoId, currentCompleted) => {
    // 乐观更新UI
    setOptimisticTodos(prev =>
      prev.map(todo =>
        todo.id === todoId
          ? { ...todo, completed: !currentCompleted }
          : todo
      )
    );
  };

  const handleDeleteOptimistic = (todoId) => {
    // 乐观删除
    setOptimisticTodos(prev =>
      prev.filter(todo => todo.id !== todoId)
    );
  };

  const handleAddOptimistic = (title) => {
    // 乐观添加
    const tempId = `temp-${Date.now()}`;
    setOptimisticTodos(prev => [
      ...prev,
      {
        id: tempId,
        title,
        completed: false,
        pending: true
      }
    ]);
  };

  return (
    <div className="todo-list">
      <h1>Todo List</h1>

      <Form
        method="post"
        onSubmit={(e) => {
          const formData = new FormData(e.currentTarget);
          handleAddOptimistic(formData.get('title'));
        }}
      >
        <input type="hidden" name="_action" value="create" />
        <div className="add-todo">
          <input
            type="text"
            name="title"
            placeholder="What needs to be done?"
            required
          />
          <button type="submit">Add</button>
        </div>
      </Form>

      <ul className="todos">
        {optimisticTodos.map(todo => (
          <li
            key={todo.id}
            className={`todo-item ${todo.completed ? 'completed' : ''} ${todo.pending ? 'pending' : ''}`}
          >
            <Form
              method="post"
              onChange={(e) => {
                e.currentTarget.requestSubmit();
                handleToggleOptimistic(todo.id, todo.completed);
              }}
            >
              <input type="hidden" name="_action" value="toggle" />
              <input type="hidden" name="todoId" value={todo.id} />
              <input type="hidden" name="completed" value={todo.completed} />
              
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => {}} // Handled by form onChange
              />
              <span>{todo.title}</span>
            </Form>

            <Form
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                if (confirm('Delete this todo?')) {
                  handleDeleteOptimistic(todo.id);
                  e.currentTarget.requestSubmit();
                }
              }}
            >
              <input type="hidden" name="_action" value="delete" />
              <input type="hidden" name="todoId" value={todo.id} />
              <button type="submit" className="delete-btn">
                Delete
              </button>
            </Form>
          </li>
        ))}
      </ul>

      <div className="todo-stats">
        <p>{optimisticTodos.filter(t => !t.completed).length} items left</p>
      </div>
    </div>
  );
}
```

### Revalidation控制

```jsx
// 控制revalidation的Action
async function commentAction({ request, params }) {
  const formData = await request.formData();
  const action = formData.get('_action');

  const { postId } = params;

  switch (action) {
    case 'add-comment':
      const comment = {
        postId,
        content: formData.get('content'),
        authorId: formData.get('authorId')
      };

      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });

      // 返回 { revalidate: true } 会自动重新加载所有loader
      return { success: true, revalidate: true };

    case 'like-comment':
      const commentId = formData.get('commentId');
      
      await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST'
      });

      // 只返回更新的数据，不触发完整revalidation
      return {
        success: true,
        updatedComment: {
          id: commentId,
          likes: formData.get('currentLikes') + 1
        },
        revalidate: false
      };

    default:
      return { error: 'Invalid action' };
  }
}

// 使用部分更新
function CommentSection() {
  const { post, comments: initialComments } = useLoaderData();
  const actionData = useActionData();
  const [comments, setComments] = useState(initialComments);

  // 处理部分更新
  useEffect(() => {
    if (actionData?.updatedComment && !actionData.revalidate) {
      setComments(prev =>
        prev.map(comment =>
          comment.id === actionData.updatedComment.id
            ? { ...comment, ...actionData.updatedComment }
            : comment
        )
      );
    }
  }, [actionData]);

  // 完整revalidation后更新
  useEffect(() => {
    if (actionData?.revalidate) {
      setComments(initialComments);
    }
  }, [initialComments, actionData]);

  return (
    <div className="comment-section">
      <h2>Comments ({comments.length})</h2>

      <Form method="post" className="add-comment-form">
        <input type="hidden" name="_action" value="add-comment" />
        <input type="hidden" name="authorId" value={currentUser.id} />
        
        <textarea
          name="content"
          placeholder="Write a comment..."
          required
        />
        
        <button type="submit">Post Comment</button>
      </Form>

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-author">{comment.author.name}</div>
            <div className="comment-content">{comment.content}</div>
            
            <Form method="post" className="comment-actions">
              <input type="hidden" name="_action" value="like-comment" />
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="currentLikes" value={comment.likes} />
              
              <button type="submit">
                Like ({comment.likes})
              </button>
            </Form>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Action性能优化

### 防抖和节流

```jsx
// 防抖提交Hook
function useDebouncedSubmit(delay = 500) {
  const submit = useSubmit();
  const timeoutRef = useRef(null);

  const debouncedSubmit = useCallback((form, options) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      submit(form, options);
    }, delay);
  }, [submit, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSubmit;
}

// 自动保存表单
function AutoSaveForm() {
  const debouncedSubmit = useDebouncedSubmit(1000);
  const actionData = useActionData();
  const [lastSaved, setLastSaved] = useState(null);

  const handleChange = (e) => {
    const form = e.currentTarget.form;
    debouncedSubmit(form, { method: 'post', replace: true });
  };

  useEffect(() => {
    if (actionData?.success) {
      setLastSaved(new Date());
    }
  }, [actionData]);

  return (
    <div className="auto-save-form">
      <Form method="post">
        <div className="form-header">
          <h1>Document Editor</h1>
          {lastSaved && (
            <span className="last-saved">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <input
          type="text"
          name="title"
          placeholder="Document title"
          onChange={handleChange}
        />

        <textarea
          name="content"
          rows="20"
          placeholder="Start typing..."
          onChange={handleChange}
        />
      </Form>
    </div>
  );
}

// 节流提交Hook
function useThrottledSubmit(delay = 1000) {
  const submit = useSubmit();
  const lastSubmitRef = useRef(0);
  const pendingRef = useRef(null);

  const throttledSubmit = useCallback((form, options) => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitRef.current;

    if (timeSinceLastSubmit >= delay) {
      submit(form, options);
      lastSubmitRef.current = now;
    } else {
      // 保存待处理的提交
      if (pendingRef.current) {
        clearTimeout(pendingRef.current);
      }

      pendingRef.current = setTimeout(() => {
        submit(form, options);
        lastSubmitRef.current = Date.now();
      }, delay - timeSinceLastSubmit);
    }
  }, [submit, delay]);

  return throttledSubmit;
}
```

### 批量处理优化

```jsx
// 批量Action处理
async function optimizedBatchAction({ request }) {
  const formData = await request.formData();
  const operations = JSON.parse(formData.get('operations'));

  // 按类型分组操作
  const groupedOperations = operations.reduce((acc, op) => {
    if (!acc[op.type]) {
      acc[op.type] = [];
    }
    acc[op.type].push(op);
    return acc;
  }, {});

  const results = {};

  // 并行处理不同类型的操作
  await Promise.all(
    Object.entries(groupedOperations).map(async ([type, ops]) => {
      switch (type) {
        case 'update':
          results.updates = await batchUpdate(ops);
          break;
        case 'delete':
          results.deletes = await batchDelete(ops);
          break;
        case 'create':
          results.creates = await batchCreate(ops);
          break;
      }
    })
  );

  return {
    success: true,
    results,
    totalOperations: operations.length
  };
}

async function batchUpdate(operations) {
  // 使用单个API调用处理多个更新
  const response = await fetch('/api/batch/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations })
  });

  return response.json();
}

async function batchDelete(operations) {
  const ids = operations.map(op => op.id);
  
  const response = await fetch('/api/batch/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });

  return response.json();
}

async function batchCreate(operations) {
  const items = operations.map(op => op.data);
  
  const response = await fetch('/api/batch/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });

  return response.json();
}
```

## Action最佳实践

### 1. 表单验证策略

```jsx
// 客户端 + 服务端双重验证
const validationRules = {
  email: (value) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email format';
    }
    return null;
  },
  
  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return null;
  },
  
  username: (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  }
};

function validateForm(data, rules) {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const error = rules[field](data[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
}

// Action中使用
async function registerAction({ request }) {
  const formData = await request.formData();
  
  const userData = {
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username')
  };

  // 客户端验证
  const errors = validateForm(userData, validationRules);
  
  if (Object.keys(errors).length > 0) {
    return { errors, values: userData };
  }

  // 服务端验证和处理
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      return { 
        errors: { _form: error.message },
        values: userData 
      };
    }

    const user = await response.json();
    return redirect('/dashboard');

  } catch (error) {
    return {
      errors: { _form: 'Registration failed. Please try again.' },
      values: userData
    };
  }
}
```

### 2. 错误处理

```jsx
// 统一的错误处理
class ActionError extends Error {
  constructor(message, fieldErrors = {}, statusCode = 400) {
    super(message);
    this.fieldErrors = fieldErrors;
    this.statusCode = statusCode;
  }
}

async function handleActionError(error, formData) {
  console.error('Action error:', error);

  if (error instanceof ActionError) {
    return {
      errors: {
        _form: error.message,
        ...error.fieldErrors
      },
      values: Object.fromEntries(formData),
      statusCode: error.statusCode
    };
  }

  return {
    errors: {
      _form: 'An unexpected error occurred. Please try again.'
    },
    values: Object.fromEntries(formData),
    statusCode: 500
  };
}

// 使用
async function safeAction({ request }) {
  const formData = await request.formData();

  try {
    // Action逻辑
    const result = await processAction(formData);
    return result;
    
  } catch (error) {
    return handleActionError(error, formData);
  }
}
```

### 3. 安全性

```jsx
// CSRF保护
async function protectedAction({ request }) {
  const formData = await request.formData();
  const csrfToken = formData.get('_csrf');

  // 验证CSRF令牌
  if (!verifyCsrfToken(csrfToken)) {
    throw new Response('Invalid CSRF token', { status: 403 });
  }

  // 处理Action...
}

// 组件中包含CSRF令牌
function ProtectedForm() {
  const csrfToken = useCsrfToken();

  return (
    <Form method="post">
      <input type="hidden" name="_csrf" value={csrfToken} />
      {/* 其他表单字段 */}
    </Form>
  );
}

// 速率限制
const rateLimiter = new Map();

async function rateLimitedAction({ request }) {
  const userIp = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  const userRequests = rateLimiter.get(userIp) || [];
  const recentRequests = userRequests.filter(time => now - time < 60000); // 1分钟内

  if (recentRequests.length >= 10) {
    throw new Response('Too many requests', { status: 429 });
  }

  rateLimiter.set(userIp, [...recentRequests, now]);

  // 处理Action...
}
```

## 总结

React Router v6的Action机制提供了强大的表单处理能力：

1. **声明式提交**：使用Form组件进行声明式表单处理
2. **自动状态管理**：自动处理提交状态和加载状态
3. **错误处理**：统一的错误处理和显示机制
4. **数据验证**：支持客户端和服务端双重验证
5. **乐观更新**：提供更好的用户体验
6. **性能优化**：支持防抖、节流和批量处理

合理使用Action能够构建出健壮、用户体验良好的表单系统。
