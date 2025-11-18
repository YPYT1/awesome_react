# Fetch API基础

## 概述

Fetch API是现代浏览器提供的原生HTTP请求接口,它基于Promise设计,提供了更简洁、强大的方式来进行网络请求。相比传统的XMLHttpRequest,Fetch API更易于使用且功能更丰富。本文将全面介绍Fetch API在React应用中的使用方法。

## Fetch基础

### 基本GET请求

```jsx
import { useState, useEffect } from 'react';

function BasicFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('https://api.example.com/users')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### Async/Await语法

```jsx
function AsyncAwaitFetch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/users');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        setData(json);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>Users</h2>
      <ul>
        {data?.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## POST请求

### 发送JSON数据

```jsx
function PostExample() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
    };
    
    try {
      const response = await fetch('https://api.example.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      
      {result && (
        <div>Success! User ID: {result.id}</div>
      )}
    </form>
  );
}
```

### 发送FormData

```jsx
function FileUploadExample() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  
  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('https://api.example.com/upload', {
        method: 'POST',
        body: formData, // FormData自动设置Content-Type
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleUpload}>
      <input name="file" type="file" required />
      <input name="description" placeholder="Description" />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      
      {result && (
        <div>Uploaded: {result.url}</div>
      )}
    </form>
  );
}
```

## PUT和DELETE请求

### 更新资源

```jsx
function UpdateExample({ userId }) {
  const [updating, setUpdating] = useState(false);
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
    };
    
    try {
      const response = await fetch(`https://api.example.com/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Update failed');
      }
      
      const result = await response.json();
      console.log('Updated:', result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  return (
    <form onSubmit={handleUpdate}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={updating}>
        {updating ? 'Updating...' : 'Update'}
      </button>
    </form>
  );
}
```

### 删除资源

```jsx
function DeleteExample({ userId, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!confirm('Are you sure?')) return;
    
    setDeleting(true);
    
    try {
      const response = await fetch(`https://api.example.com/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Delete failed');
      }
      
      onDelete?.(userId);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setDeleting(false);
    }
  };
  
  return (
    <button onClick={handleDelete} disabled={deleting}>
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## 请求配置

### Headers设置

```jsx
function HeadersExample() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchWithHeaders = async () => {
      try {
        const response = await fetch('https://api.example.com/protected', {
          headers: {
            'Authorization': 'Bearer your-token',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Custom-Header': 'CustomValue',
          },
        });
        
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchWithHeaders();
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}

// Headers对象
function HeadersObjectExample() {
  const headers = new Headers();
  headers.append('Authorization', 'Bearer your-token');
  headers.append('Content-Type', 'application/json');
  
  fetch('https://api.example.com/data', {
    headers: headers,
  });
}
```

### Credentials(凭证)

```jsx
function CredentialsExample() {
  useEffect(() => {
    // 不发送cookies
    fetch('https://api.example.com/data', {
      credentials: 'omit',
    });
    
    // 同源发送cookies
    fetch('https://api.example.com/data', {
      credentials: 'same-origin',
    });
    
    // 总是发送cookies
    fetch('https://api.example.com/data', {
      credentials: 'include',
    });
  }, []);
}
```

### Mode和Cache

```jsx
function ModeAndCacheExample() {
  useEffect(() => {
    // CORS模式
    fetch('https://api.example.com/data', {
      mode: 'cors', // cors, no-cors, same-origin
    });
    
    // 缓存策略
    fetch('https://api.example.com/data', {
      cache: 'no-cache', // default, no-cache, reload, force-cache, only-if-cached
    });
    
    // 组合使用
    fetch('https://api.example.com/data', {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }, []);
}
```

## 响应处理

### 解析响应

```jsx
function ResponseParsing() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/data');
        
        // JSON响应
        if (response.headers.get('content-type')?.includes('application/json')) {
          const json = await response.json();
          setData(json);
        }
        
        // 文本响应
        else if (response.headers.get('content-type')?.includes('text')) {
          const text = await response.text();
          setData({ text });
        }
        
        // Blob响应(图片、文件等)
        else {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setData({ url });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchData();
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### 状态码处理

```jsx
function StatusCodeHandling() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/data');
        
        if (response.status === 200) {
          const json = await response.json();
          setData(json);
        } else if (response.status === 404) {
          setError('Resource not found');
        } else if (response.status === 401) {
          setError('Unauthorized');
        } else if (response.status === 500) {
          setError('Server error');
        } else {
          setError(`Unexpected status: ${response.status}`);
        }
      } catch (error) {
        setError('Network error: ' + error.message);
      }
    };
    
    fetchData();
  }, []);
  
  if (error) return <div>Error: {error}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

## 中止请求

### AbortController

```jsx
function AbortExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
  
  const fetchData = async () => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的AbortController
    abortControllerRef.current = new AbortController();
    setLoading(true);
    
    try {
      const response = await fetch('https://api.example.com/data', {
        signal: abortControllerRef.current.signal,
      });
      
      const json = await response.json();
      setData(json);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      } else {
        console.error('Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };
  
  useEffect(() => {
    return () => {
      // 组件卸载时取消请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return (
    <div>
      <button onClick={fetchData} disabled={loading}>
        Fetch Data
      </button>
      <button onClick={handleCancel} disabled={!loading}>
        Cancel
      </button>
      {loading && <div>Loading...</div>}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

### 超时控制

```jsx
function TimeoutExample() {
  const fetchWithTimeout = async (url, timeout = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  };
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchWithTimeout(
          'https://api.example.com/data',
          3000 // 3秒超时
        );
        setData(result);
      } catch (error) {
        setError(error.message);
      }
    };
    
    fetchData();
  }, []);
  
  if (error) return <div>Error: {error}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

## 自定义Hook封装

### useFetch Hook

```jsx
import { useState, useEffect } from 'react';

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        setData(json);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      controller.abort();
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
}

// 使用示例
function UseFetchExample() {
  const { data, loading, error } = useFetch('https://api.example.com/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### useApi Hook

```jsx
import { useState, useCallback } from 'react';

function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setLoading(false);
      return { data, error: null };
    } catch (error) {
      setLoading(false);
      setError(error.message);
      return { data: null, error: error.message };
    }
  }, []);
  
  const get = useCallback((url, options) => {
    return request(url, { ...options, method: 'GET' });
  }, [request]);
  
  const post = useCallback((url, data, options) => {
    return request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [request]);
  
  const put = useCallback((url, data, options) => {
    return request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [request]);
  
  const del = useCallback((url, options) => {
    return request(url, { ...options, method: 'DELETE' });
  }, [request]);
  
  return { loading, error, get, post, put, del: del };
}

// 使用示例
function UseApiExample() {
  const api = useApi();
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await api.get('https://api.example.com/users');
      if (data) {
        setUsers(data);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleCreate = async (userData) => {
    const { data, error } = await api.post('https://api.example.com/users', userData);
    if (data) {
      setUsers([...users, data]);
    }
  };
  
  return (
    <div>
      {api.loading && <div>Loading...</div>}
      {api.error && <div>Error: {api.error}</div>}
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 错误处理

### 网络错误处理

```jsx
function ErrorHandling() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.example.com/data');
        
        // 检查HTTP状态
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Request failed');
        }
        
        const json = await response.json();
        setData(json);
      } catch (error) {
        // 网络错误
        if (error instanceof TypeError) {
          setError('Network error - please check your connection');
        }
        // HTTP错误
        else {
          setError(error.message);
        }
      }
    };
    
    fetchData();
  }, []);
  
  if (error) return <div className="error">{error}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

### 重试逻辑

```jsx
function RetryExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchWithRetry = async (url, retries = 3, delay = 1000) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          if (i === retries - 1) throw error;
          
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    };
    
    const fetchData = async () => {
      try {
        const result = await fetchWithRetry('https://api.example.com/data');
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{JSON.stringify(data)}</div>;
}
```

## 并发请求

### Promise.all

```jsx
function ConcurrentRequests() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [users, posts, comments] = await Promise.all([
          fetch('https://api.example.com/users').then(r => r.json()),
          fetch('https://api.example.com/posts').then(r => r.json()),
          fetch('https://api.example.com/comments').then(r => r.json()),
        ]);
        
        setData({ users, posts, comments });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAll();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <div>Users: {data?.users?.length}</div>
      <div>Posts: {data?.posts?.length}</div>
      <div>Comments: {data?.comments?.length}</div>
    </div>
  );
}
```

### Promise.allSettled

```jsx
function AllSettledExample() {
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    const fetchAll = async () => {
      const promises = [
        fetch('https://api.example.com/users').then(r => r.json()),
        fetch('https://api.example.com/posts').then(r => r.json()),
        fetch('https://api.example.com/invalid').then(r => r.json()),
      ];
      
      const results = await Promise.allSettled(promises);
      setResults(results);
    };
    
    fetchAll();
  }, []);
  
  return (
    <div>
      {results.map((result, index) => (
        <div key={index}>
          {result.status === 'fulfilled' ? (
            <div>Success: {JSON.stringify(result.value).slice(0, 50)}...</div>
          ) : (
            <div>Failed: {result.reason.message}</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 总结

Fetch API要点：

1. **基础请求**：GET、POST、PUT、DELETE
2. **配置选项**：headers、credentials、mode、cache
3. **响应处理**：json()、text()、blob()、状态码
4. **中止请求**：AbortController、超时控制
5. **自定义Hook**：useFetch、useApi封装
6. **错误处理**：网络错误、HTTP错误、重试逻辑
7. **并发请求**：Promise.all、Promise.allSettled

Fetch API是React应用中进行HTTP请求的基础,掌握它对于数据获取至关重要。
