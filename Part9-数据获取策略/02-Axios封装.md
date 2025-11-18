# Axios封装

## 概述

Axios是一个基于Promise的HTTP客户端,支持浏览器和Node.js环境。相比Fetch API,Axios提供了更丰富的功能和更好的错误处理。本文将深入探讨如何在React应用中封装和使用Axios,打造企业级的HTTP请求方案。

## Axios安装和基础

### 安装

```bash
# npm
npm install axios

# yarn
yarn add axios

# pnpm
pnpm add axios
```

### 基础使用

```jsx
import axios from 'axios';
import { useState, useEffect } from 'react';

function BasicAxios() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    axios.get('https://api.example.com/users')
      .then(response => {
        setData(response.data);
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
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

// Async/Await
function AsyncAxios() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.example.com/users');
        setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchData();
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}
```

## 创建实例

### 基础实例配置

```jsx
// api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;

// 使用
import apiClient from './api/client';

function UseInstance() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    apiClient.get('/users')
      .then(response => setUsers(response.data))
      .catch(error => console.error(error));
  }, []);
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 环境配置

```jsx
// config/api.js
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
  },
  production: {
    baseURL: 'https://api.production.com',
    timeout: 30000,
  },
  test: {
    baseURL: 'https://api.test.com',
    timeout: 5000,
  },
};

const env = process.env.NODE_ENV || 'development';
const config = API_CONFIG[env];

const apiClient = axios.create(config);

export default apiClient;
```

## 拦截器

### 请求拦截器

```jsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com',
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加时间戳
    config.headers['X-Request-Time'] = Date.now();
    
    // 添加请求ID
    config.headers['X-Request-ID'] = generateRequestId();
    
    console.log('Request:', config);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### 响应拦截器

```jsx
// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    const { data, status, statusText } = response;
    
    console.log('Response:', {
      data,
      status,
      statusText,
    });
    
    // 如果API有特定的数据结构
    if (data.code === 0) {
      return data.data;
    }
    
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权,跳转登录
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        
        case 403:
          // 无权限
          console.error('No permission');
          break;
        
        case 404:
          // 资源不存在
          console.error('Resource not found');
          break;
        
        case 500:
          // 服务器错误
          console.error('Server error');
          break;
        
        default:
          console.error('Error:', data.message);
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('No response received');
    } else {
      // 请求配置出错
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
```

### 多个拦截器

```jsx
// 请求拦截器1: 添加token
const requestInterceptor1 = apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// 请求拦截器2: 添加加载状态
const requestInterceptor2 = apiClient.interceptors.request.use(
  (config) => {
    store.dispatch({ type: 'SET_LOADING', payload: true });
    return config;
  }
);

// 响应拦截器1: 移除加载状态
const responseInterceptor1 = apiClient.interceptors.response.use(
  (response) => {
    store.dispatch({ type: 'SET_LOADING', payload: false });
    return response;
  },
  (error) => {
    store.dispatch({ type: 'SET_LOADING', payload: false });
    return Promise.reject(error);
  }
);

// 响应拦截器2: 刷新token
const responseInterceptor2 = apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败,跳转登录
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 移除拦截器
apiClient.interceptors.request.eject(requestInterceptor1);
apiClient.interceptors.response.eject(responseInterceptor1);
```

## 封装API服务

### 基础API服务

```jsx
// services/api.js
import apiClient from './client';

class ApiService {
  // GET请求
  async get(url, params = {}, config = {}) {
    try {
      const response = await apiClient.get(url, { params, ...config });
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  // POST请求
  async post(url, data = {}, config = {}) {
    try {
      const response = await apiClient.post(url, data, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  // PUT请求
  async put(url, data = {}, config = {}) {
    try {
      const response = await apiClient.put(url, data, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  // PATCH请求
  async patch(url, data = {}, config = {}) {
    try {
      const response = await apiClient.patch(url, data, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  // DELETE请求
  async delete(url, config = {}) {
    try {
      const response = await apiClient.delete(url, config);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export default new ApiService();
```

### 资源API封装

```jsx
// services/userApi.js
import api from './api';

export const userApi = {
  // 获取用户列表
  getUsers: (params) => api.get('/users', params),
  
  // 获取用户详情
  getUser: (id) => api.get(`/users/${id}`),
  
  // 创建用户
  createUser: (data) => api.post('/users', data),
  
  // 更新用户
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  
  // 部分更新用户
  patchUser: (id, data) => api.patch(`/users/${id}`, data),
  
  // 删除用户
  deleteUser: (id) => api.delete(`/users/${id}`),
  
  // 获取用户统计
  getUserStats: (id) => api.get(`/users/${id}/stats`),
};

// 使用示例
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await userApi.getUsers({ page: 1, limit: 10 });
      
      if (error) {
        console.error('Error:', error);
      } else {
        setUsers(data);
      }
      
      setLoading(false);
    };
    
    fetchUsers();
  }, []);
  
  const handleDelete = async (id) => {
    const { error } = await userApi.deleteUser(id);
    
    if (error) {
      alert('Delete failed');
    } else {
      setUsers(users.filter(u => u.id !== id));
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name}
          <button onClick={() => handleDelete(user.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

### RESTful API生成器

```jsx
// services/apiFactory.js
import apiClient from './client';

function createResourceApi(resourceName) {
  const baseUrl = `/${resourceName}`;
  
  return {
    getAll: (params) => 
      apiClient.get(baseUrl, { params }),
    
    getOne: (id) => 
      apiClient.get(`${baseUrl}/${id}`),
    
    create: (data) => 
      apiClient.post(baseUrl, data),
    
    update: (id, data) => 
      apiClient.put(`${baseUrl}/${id}`, data),
    
    patch: (id, data) => 
      apiClient.patch(`${baseUrl}/${id}`, data),
    
    delete: (id) => 
      apiClient.delete(`${baseUrl}/${id}`),
    
    // 自定义方法
    custom: (action, id, data, method = 'POST') => 
      apiClient({
        method,
        url: id ? `${baseUrl}/${id}/${action}` : `${baseUrl}/${action}`,
        data,
      }),
  };
}

// 使用
export const userApi = createResourceApi('users');
export const postApi = createResourceApi('posts');
export const commentApi = createResourceApi('comments');

// 使用示例
function ResourceExample() {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postApi.getAll({ page: 1 });
        setPosts(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchPosts();
  }, []);
  
  const handleLike = async (postId) => {
    try {
      await postApi.custom('like', postId, {}, 'POST');
      // 更新UI
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <button onClick={() => handleLike(post.id)}>Like</button>
        </div>
      ))}
    </div>
  );
}
```

## 请求和响应转换

### 数据转换

```jsx
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  
  // 请求数据转换
  transformRequest: [
    function(data, headers) {
      // 将驼峰命名转为下划线
      if (data && typeof data === 'object') {
        return JSON.stringify(
          Object.keys(data).reduce((acc, key) => {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            acc[snakeKey] = data[key];
            return acc;
          }, {})
        );
      }
      return data;
    },
  ],
  
  // 响应数据转换
  transformResponse: [
    function(data) {
      // 将下划线转为驼峰命名
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          return transformKeys(parsed, toCamelCase);
        } catch (e) {
          return data;
        }
      }
      return data;
    },
  ],
});

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function transformKeys(obj, transform) {
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeys(item, transform));
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = transform(key);
      acc[newKey] = transformKeys(obj[key], transform);
      return acc;
    }, {});
  }
  
  return obj;
}
```

## 取消请求

### CancelToken

```jsx
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

function CancelRequestExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const cancelTokenRef = useRef(null);
  
  const fetchData = async (query) => {
    // 取消之前的请求
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('New request initiated');
    }
    
    // 创建新的cancel token
    cancelTokenRef.current = axios.CancelToken.source();
    setLoading(true);
    
    try {
      const response = await axios.get('/api/search', {
        params: { q: query },
        cancelToken: cancelTokenRef.current.token,
      });
      
      setData(response.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    return () => {
      // 组件卸载时取消请求
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
    };
  }, []);
  
  return (
    <div>
      <input
        type="text"
        onChange={(e) => fetchData(e.target.value)}
        placeholder="Search..."
      />
      {loading && <div>Loading...</div>}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

### AbortController

```jsx
function AbortControllerExample() {
  const [data, setData] = useState(null);
  const abortControllerRef = useRef(null);
  
  const fetchData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await axios.get('/api/data', {
        signal: abortControllerRef.current.signal,
      });
      
      setData(response.data);
    } catch (error) {
      if (error.name === 'CanceledError') {
        console.log('Request aborted');
      } else {
        console.error('Error:', error);
      }
    }
  };
  
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

## 并发和批量请求

### 并发请求

```jsx
import axios from 'axios';

function ConcurrentRequests() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [users, posts, comments] = await axios.all([
          axios.get('/api/users'),
          axios.get('/api/posts'),
          axios.get('/api/comments'),
        ]);
        
        setData({
          users: users.data,
          posts: posts.data,
          comments: comments.data,
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchAll();
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}

// 使用Promise.all
function PromiseAllExample() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const requests = [
      axios.get('/api/users'),
      axios.get('/api/posts'),
      axios.get('/api/comments'),
    ];
    
    Promise.all(requests)
      .then(responses => {
        setData({
          users: responses[0].data,
          posts: responses[1].data,
          comments: responses[2].data,
        });
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }, []);
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### 批量请求控制

```jsx
class RequestQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = 0;
  }
  
  async add(requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ requestFn, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { requestFn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await requestFn();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process();
    }
  }
}

function BatchRequestExample() {
  const [results, setResults] = useState([]);
  const queue = useRef(new RequestQueue(3)).current;
  
  const fetchUsers = async () => {
    const userIds = Array.from({ length: 20 }, (_, i) => i + 1);
    
    const promises = userIds.map(id => 
      queue.add(() => axios.get(`/api/users/${id}`))
    );
    
    try {
      const responses = await Promise.all(promises);
      setResults(responses.map(r => r.data));
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div>
      <button onClick={fetchUsers}>Fetch Users</button>
      <ul>
        {results.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 上传和下载

### 文件上传

```jsx
function FileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    
    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentage);
        },
      });
      
      console.log('Upload success:', response.data);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      
      {uploading && (
        <div>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
}
```

### 文件下载

```jsx
function FileDownload() {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleDownload = async (fileId, filename) => {
    setDownloading(true);
    
    try {
      const response = await axios.get(`/api/files/${fileId}/download`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentage);
        },
      });
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };
  
  return (
    <div>
      <button
        onClick={() => handleDownload(123, 'file.pdf')}
        disabled={downloading}
      >
        {downloading ? 'Downloading...' : 'Download'}
      </button>
      
      {downloading && (
        <div>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
}
```

## 自定义Hook

### useAxios Hook

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function useAxios(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const source = axios.CancelToken.source();
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios({
          url,
          ...options,
          cancelToken: source.token,
        });
        
        setData(response.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setError(error);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    return () => {
      source.cancel('Component unmounted');
    };
  }, [url, JSON.stringify(options)]);
  
  return { data, loading, error };
}

// 使用示例
function UserList() {
  const { data: users, loading, error } = useAxios('/api/users');
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {users?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### useApi Hook

```jsx
import { useState, useCallback } from 'react';
import apiClient from './apiClient';

function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const request = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient(config);
      setLoading(false);
      return { data: response.data, error: null };
    } catch (error) {
      setLoading(false);
      setError(error);
      return { data: null, error };
    }
  }, []);
  
  const get = useCallback((url, config) => {
    return request({ ...config, method: 'GET', url });
  }, [request]);
  
  const post = useCallback((url, data, config) => {
    return request({ ...config, method: 'POST', url, data });
  }, [request]);
  
  const put = useCallback((url, data, config) => {
    return request({ ...config, method: 'PUT', url, data });
  }, [request]);
  
  const del = useCallback((url, config) => {
    return request({ ...config, method: 'DELETE', url });
  }, [request]);
  
  return {
    loading,
    error,
    get,
    post,
    put,
    del,
  };
}

// 使用示例
function UserManagement() {
  const api = useApi();
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await api.get('/users');
      if (data) {
        setUsers(data);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleCreate = async (userData) => {
    const { data, error } = await api.post('/users', userData);
    if (data) {
      setUsers([...users, data]);
    }
  };
  
  return (
    <div>
      {api.loading && <div>Loading...</div>}
      {api.error && <div>Error: {api.error.message}</div>}
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 总结

Axios封装要点：

1. **创建实例**：配置baseURL、timeout、headers
2. **拦截器**：请求拦截、响应拦截、错误处理
3. **API封装**：服务层封装、RESTful API生成器
4. **数据转换**：请求转换、响应转换、命名转换
5. **取消请求**：CancelToken、AbortController
6. **并发控制**：并发请求、批量请求队列
7. **文件处理**：上传进度、下载进度
8. **自定义Hook**：useAxios、useApi封装

Axios通过良好的封装可以打造企业级的HTTP请求方案。
