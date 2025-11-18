# GraphQL基础

## 概述

GraphQL是一种用于API的查询语言和运行时,由Facebook开发。与传统REST API不同,GraphQL允许客户端精确指定需要的数据,避免过度获取或获取不足的问题。本文将介绍在React应用中使用GraphQL的基础知识。

## GraphQL核心概念

### Schema定义

```graphql
# 类型定义
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  posts: [Post!]!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  published: Boolean!
  tags: [String!]!
  createdAt: String!
}

# 查询
type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
  posts(authorId: ID): [Post!]!
  searchPosts(query: String!): [Post!]!
}

# 变更
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
  
  createPost(input: CreatePostInput!): Post!
  updatePost(id: ID!, input: UpdatePostInput!): Post!
  deletePost(id: ID!): Boolean!
}

# 订阅
type Subscription {
  postCreated: Post!
  postUpdated(id: ID!): Post!
  userOnline(userId: ID!): User!
}

# 输入类型
input CreateUserInput {
  name: String!
  email: String!
  age: Int
}

input UpdateUserInput {
  name: String
  email: String
  age: Int
}

input CreatePostInput {
  title: String!
  content: String!
  authorId: ID!
  tags: [String!]
}

input UpdatePostInput {
  title: String
  content: String
  published: Boolean
  tags: [String!]
}
```

### 查询(Query)

```graphql
# 基础查询
query GetUser {
  user(id: "123") {
    id
    name
    email
  }
}

# 查询别名
query GetUsers {
  mainUser: user(id: "123") {
    id
    name
  }
  secondUser: user(id: "456") {
    id
    name
  }
}

# 嵌套查询
query GetUserWithPosts {
  user(id: "123") {
    id
    name
    posts {
      id
      title
      content
    }
  }
}

# 带参数的查询
query GetPosts($authorId: ID!, $limit: Int) {
  posts(authorId: $authorId, limit: $limit) {
    id
    title
    author {
      id
      name
    }
  }
}

# 片段(Fragment)
fragment UserFields on User {
  id
  name
  email
  createdAt
}

query GetUserData {
  user(id: "123") {
    ...UserFields
    posts {
      id
      title
    }
  }
}

# 内联片段
query GetContent {
  search(query: "test") {
    ... on User {
      id
      name
    }
    ... on Post {
      id
      title
    }
  }
}
```

### 变更(Mutation)

```graphql
# 创建数据
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}

# 更新数据
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    name
    email
  }
}

# 删除数据
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id)
}

# 多个mutation
mutation CreateUserAndPost(
  $userInput: CreateUserInput!
  $postInput: CreatePostInput!
) {
  user: createUser(input: $userInput) {
    id
    name
  }
  post: createPost(input: $postInput) {
    id
    title
  }
}
```

### 订阅(Subscription)

```graphql
# 订阅新帖子
subscription OnPostCreated {
  postCreated {
    id
    title
    author {
      id
      name
    }
  }
}

# 订阅特定帖子更新
subscription OnPostUpdated($id: ID!) {
  postUpdated(id: $id) {
    id
    title
    content
    published
  }
}

# 订阅用户在线状态
subscription OnUserOnline($userId: ID!) {
  userOnline(userId: $userId) {
    id
    name
    isOnline
  }
}
```

## GraphQL客户端

### Fetch方式

```jsx
async function fetchGraphQL(query, variables = {}) {
  const response = await fetch('https://api.example.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  
  const json = await response.json();
  
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  
  return json.data;
}

// 使用
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
          posts {
            id
            title
          }
        }
      }
    `;
    
    fetchGraphQL(query, { id: userId })
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <h2>Posts</h2>
      <ul>
        {user.posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### GraphQL Request

```bash
npm install graphql-request graphql
```

```jsx
import { GraphQLClient, gql } from 'graphql-request';

const client = new GraphQLClient('https://api.example.com/graphql', {
  headers: {
    authorization: `Bearer ${getToken()}`,
  },
});

function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    const query = gql`
      query GetUsers {
        users {
          id
          name
          email
        }
      }
    `;
    
    client.request(query)
      .then(data => setUsers(data.users))
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

// 带变量的查询
function UserPosts({ userId }) {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const query = gql`
      query GetUserPosts($userId: ID!) {
        posts(authorId: $userId) {
          id
          title
          content
        }
      }
    `;
    
    client.request(query, { userId })
      .then(data => setPosts(data.posts))
      .catch(error => console.error(error));
  }, [userId]);
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

## React Hook封装

### useGraphQL Hook

```jsx
import { useState, useEffect } from 'react';

function useGraphQL(query, variables = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetchGraphQL(query, variables)
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [query, JSON.stringify(variables)]);
  
  return { data, loading, error };
}

// 使用
function UserProfile({ userId }) {
  const { data, loading, error } = useGraphQL(
    gql`
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
        }
      }
    `,
    { id: userId }
  );
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{data.user.name}</h1>
      <p>{data.user.email}</p>
    </div>
  );
}
```

### useGraphQLMutation Hook

```jsx
function useGraphQLMutation(mutation) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = async (variables) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await client.request(mutation, variables);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };
  
  return { execute, loading, error };
}

// 使用
function CreateUserForm() {
  const { execute, loading, error } = useGraphQLMutation(gql`
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        name
        email
      }
    }
  `);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const input = {
      name: formData.get('name'),
      email: formData.get('email'),
    };
    
    try {
      const result = await execute({ input });
      console.log('User created:', result.createUser);
      toast.success('User created successfully');
    } catch (err) {
      toast.error('Failed to create user');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

## 错误处理

### GraphQL错误

```jsx
function handleGraphQLError(error) {
  if (error.response) {
    const { errors } = error.response;
    
    errors.forEach(err => {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // 未认证错误
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (err.extensions?.code === 'FORBIDDEN') {
        // 无权限错误
        toast.error('You do not have permission');
      } else if (err.extensions?.code === 'NOT_FOUND') {
        // 资源不存在
        toast.error('Resource not found');
      } else {
        // 其他错误
        toast.error(err.message);
      }
    });
  } else {
    // 网络错误
    toast.error('Network error occurred');
  }
}

// 使用
function UserData({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const query = gql`
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
        }
      }
    `;
    
    client.request(query, { id: userId })
      .then(data => setUser(data.user))
      .catch(error => {
        handleGraphQLError(error);
      })
      .finally(() => setLoading(false));
  }, [userId]);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;
  
  return <div>{user.name}</div>;
}
```

### 部分错误处理

```jsx
async function fetchWithPartialErrors(query, variables) {
  const response = await client.rawRequest(query, variables);
  
  const { data, errors } = response;
  
  if (errors && errors.length > 0) {
    // 处理部分错误
    console.warn('Partial errors:', errors);
    
    // 仍然返回部分数据
    return {
      data,
      errors,
      hasErrors: true,
    };
  }
  
  return {
    data,
    errors: null,
    hasErrors: false,
  };
}

// 使用
function Dashboard() {
  const [stats, setStats] = useState(null);
  const [warnings, setWarnings] = useState([]);
  
  useEffect(() => {
    const query = gql`
      query GetDashboardStats {
        userCount
        postCount
        revenue
        analytics {
          views
          clicks
        }
      }
    `;
    
    fetchWithPartialErrors(query)
      .then(result => {
        setStats(result.data);
        
        if (result.hasErrors) {
          setWarnings(result.errors.map(e => e.message));
        }
      });
  }, []);
  
  return (
    <div>
      {warnings.length > 0 && (
        <div className="warnings">
          {warnings.map((warning, i) => (
            <div key={i}>{warning}</div>
          ))}
        </div>
      )}
      
      {stats && (
        <div>
          <div>Users: {stats.userCount}</div>
          <div>Posts: {stats.postCount}</div>
          <div>Revenue: ${stats.revenue}</div>
        </div>
      )}
    </div>
  );
}
```

## 文件上传

### Multipart Request

```jsx
async function uploadFile(file, mutation) {
  const operations = {
    query: mutation,
    variables: {
      file: null,
    },
  };
  
  const map = {
    '0': ['variables.file'],
  };
  
  const formData = new FormData();
  formData.append('operations', JSON.stringify(operations));
  formData.append('map', JSON.stringify(map));
  formData.append('0', file);
  
  const response = await fetch('https://api.example.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
    body: formData,
  });
  
  const json = await response.json();
  
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  
  return json.data;
}

// 使用
function FileUpload() {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    const mutation = `
      mutation UploadFile($file: Upload!) {
        uploadFile(file: $file) {
          id
          url
          filename
        }
      }
    `;
    
    try {
      const result = await uploadFile(file, mutation);
      console.log('Uploaded:', result.uploadFile);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <div>Uploading...</div>}
    </div>
  );
}
```

## 总结

GraphQL基础要点：

1. **核心概念**：Schema、Query、Mutation、Subscription
2. **查询语法**：字段选择、参数、别名、片段
3. **变更操作**：创建、更新、删除数据
4. **GraphQL客户端**：Fetch、graphql-request
5. **React集成**：自定义Hook封装
6. **错误处理**：GraphQL错误、部分错误
7. **文件上传**：Multipart请求

GraphQL提供了灵活高效的数据获取方式,是现代Web应用的重要技术选择。

## 第四部分：GraphQL高级特性

### 4.1 GraphQL指令

```graphql
# 1. @include和@skip指令
query GetUser($id: ID!, $includePosts: Boolean!, $skipComments: Boolean!) {
  user(id: $id) {
    id
    name
    posts @include(if: $includePosts) {
      id
      title
    }
    comments @skip(if: $skipComments) {
      id
      text
    }
  }
}

# 2. @deprecated指令
type User {
  id: ID!
  name: String!
  email: String! @deprecated(reason: "Use contactEmail instead")
  contactEmail: String!
}

# 3. 自定义指令
directive @auth(requires: Role = USER) on FIELD_DEFINITION

type Query {
  adminData: [Data] @auth(requires: ADMIN)
  userData: [Data] @auth(requires: USER)
}

# 4. 客户端使用指令
function useConditionalQuery() {
  const [includeDetails, setIncludeDetails] = useState(false);

  const query = gql`
    query GetProduct($id: ID!, $includeDetails: Boolean!) {
      product(id: $id) {
        id
        name
        price
        details @include(if: $includeDetails) {
          description
          specifications
          reviews
        }
      }
    }
  `;

  const { data } = useQuery(query, {
    variables: { id: '1', includeDetails }
  });

  return (
    <div>
      <button onClick={() => setIncludeDetails(!includeDetails)}>
        Toggle Details
      </button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

### 4.2 GraphQL联合类型和接口

```graphql
# 1. 联合类型
union SearchResult = User | Post | Comment

type Query {
  search(query: String!): [SearchResult!]!
}

# 查询联合类型
query Search($query: String!) {
  search(query: $query) {
    ... on User {
      __typename
      id
      name
      email
    }
    ... on Post {
      __typename
      id
      title
      author {
        name
      }
    }
    ... on Comment {
      __typename
      id
      text
      author {
        name
      }
    }
  }
}

# 2. 接口
interface Node {
  id: ID!
  createdAt: DateTime!
}

type User implements Node {
  id: ID!
  createdAt: DateTime!
  name: String!
  email: String!
}

type Post implements Node {
  id: ID!
  createdAt: DateTime!
  title: String!
  content: String!
}

# 查询接口
query GetNodes {
  nodes {
    id
    createdAt
    ... on User {
      name
      email
    }
    ... on Post {
      title
      content
    }
  }
}

# 3. React中处理联合类型
function SearchResults() {
  const { data } = useQuery(gql`
    query Search($query: String!) {
      search(query: $query) {
        __typename
        ... on User {
          id
          name
        }
        ... on Post {
          id
          title
        }
        ... on Comment {
          id
          text
        }
      }
    }
  `, {
    variables: { query: 'React' }
  });

  const renderResult = (result) => {
    switch (result.__typename) {
      case 'User':
        return <UserCard user={result} />;
      case 'Post':
        return <PostCard post={result} />;
      case 'Comment':
        return <CommentCard comment={result} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {data?.search.map(result => (
        <div key={result.id}>
          {renderResult(result)}
        </div>
      ))}
    </div>
  );
}
```

### 4.3 GraphQL订阅进阶

```jsx
// 1. WebSocket订阅
import { createClient } from 'graphql-ws';

const wsClient = createClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: () => ({
    authToken: localStorage.getItem('token')
  }),
  on: {
    connected: () => console.log('Connected'),
    closed: () => console.log('Closed')
  }
});

// 2. 订阅Hook
function useGraphQLSubscription(query, options = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = wsClient.subscribe(
      { query, variables: options.variables },
      {
        next: (value) => {
          setData(value.data);
          options.onData?.(value.data);
        },
        error: (err) => {
          setError(err);
          options.onError?.(err);
        },
        complete: () => {
          options.onComplete?.();
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [query, options.variables]);

  return { data, error };
}

// 3. 实时消息系统
function ChatRoom({ roomId }) {
  const { data: messages } = useGraphQLSubscription(
    gql`
      subscription OnMessageAdded($roomId: ID!) {
        messageAdded(roomId: $roomId) {
          id
          text
          author {
            id
            name
          }
          createdAt
        }
      }
    `,
    {
      variables: { roomId },
      onData: (newMessage) => {
        console.log('New message:', newMessage);
      }
    }
  );

  return (
    <div>
      {messages?.messageAdded.map(msg => (
        <div key={msg.id}>
          <strong>{msg.author.name}:</strong> {msg.text}
        </div>
      ))}
    </div>
  );
}

// 4. 订阅管理器
class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map();
  }

  subscribe(key, subscription, options) {
    if (this.subscriptions.has(key)) {
      return;
    }

    const unsubscribe = wsClient.subscribe(subscription, options);
    this.subscriptions.set(key, unsubscribe);
  }

  unsubscribe(key) {
    const unsubscribe = this.subscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

const subManager = new SubscriptionManager();
```

### 4.4 GraphQL缓存策略

```jsx
// 1. 简单内存缓存
class GraphQLCache {
  constructor() {
    this.cache = new Map();
  }

  generateKey(query, variables) {
    return `${query}:${JSON.stringify(variables || {})}`;
  }

  get(query, variables) {
    const key = this.generateKey(query, variables);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(query, variables, data, ttl = 60000) {
    const key = this.generateKey(query, variables);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  invalidate(query, variables) {
    const key = this.generateKey(query, variables);
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

const cache = new GraphQLCache();

// 2. 带缓存的查询Hook
function useCachedGraphQLQuery(query, variables, options = {}) {
  const [data, setData] = useState(() => cache.get(query, variables));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const cached = cache.get(query, variables);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables })
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        cache.set(query, variables, result.data, options.ttl);
        setData(result.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, JSON.stringify(variables), options.ttl]);

  const refetch = useCallback(() => {
    cache.invalidate(query, variables);
    return fetchData();
  }, [query, variables]);

  return { data, loading, error, refetch };
}

// 3. 规范化缓存
class NormalizedGraphQLCache {
  constructor() {
    this.entities = {};
    this.queryResults = new Map();
  }

  normalize(data, typename) {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(item => this.normalize(item, typename));
    }

    const id = data.id || data._id;
    const type = data.__typename || typename;

    if (id && type) {
      const key = `${type}:${id}`;
      this.entities[key] = { ...data };
      return { __ref: key };
    }

    const normalized = {};
    for (const [key, value] of Object.entries(data)) {
      normalized[key] = this.normalize(value, key);
    }

    return normalized;
  }

  denormalize(data) {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map(item => this.denormalize(item));
    }

    if (data.__ref) {
      const entity = this.entities[data.__ref];
      return entity ? this.denormalize(entity) : null;
    }

    const denormalized = {};
    for (const [key, value] of Object.entries(data)) {
      denormalized[key] = this.denormalize(value);
    }

    return denormalized;
  }

  writeQuery(query, variables, data) {
    const normalized = this.normalize(data);
    const key = `${query}:${JSON.stringify(variables)}`;
    this.queryResults.set(key, normalized);
  }

  readQuery(query, variables) {
    const key = `${query}:${JSON.stringify(variables)}`;
    const normalized = this.queryResults.get(key);
    return normalized ? this.denormalize(normalized) : null;
  }

  updateEntity(typename, id, updates) {
    const key = `${typename}:${id}`;
    if (this.entities[key]) {
      this.entities[key] = { ...this.entities[key], ...updates };
    }
  }
}

const normalizedCache = new NormalizedGraphQLCache();
```

### 4.5 GraphQL批量请求

```jsx
// 1. 批量请求处理器
class GraphQLBatcher {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.batchInterval = options.batchInterval || 10;
    this.maxBatchSize = options.maxBatchSize || 10;
    this.queue = [];
    this.timer = null;
  }

  enqueue(query, variables) {
    return new Promise((resolve, reject) => {
      this.queue.push({ query, variables, resolve, reject });

      if (this.queue.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.batchInterval);
      }
    });
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.maxBatchSize);

    const batchedQuery = batch.map((item, index) => ({
      query: item.query,
      variables: item.variables,
      operationName: `Operation${index}`
    }));

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchedQuery)
      });

      const results = await response.json();

      results.forEach((result, index) => {
        if (result.errors) {
          batch[index].reject(new Error(result.errors[0].message));
        } else {
          batch[index].resolve(result.data);
        }
      });
    } catch (error) {
      batch.forEach(item => item.reject(error));
    }
  }
}

const batcher = new GraphQLBatcher('/graphql');

// 2. 使用批量请求
function useBatchedQuery(query, variables) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    batcher.enqueue(query, variables)
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [query, JSON.stringify(variables)]);

  return { data, loading, error };
}

// 3. DataLoader模式
class GraphQLDataLoader {
  constructor(batchLoadFn) {
    this.batchLoadFn = batchLoadFn;
    this.queue = [];
    this.cache = new Map();
  }

  load(key) {
    const cached = this.cache.get(key);
    if (cached) return Promise.resolve(cached);

    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });
      
      if (this.queue.length === 1) {
        process.nextTick(() => this.dispatch());
      }
    });
  }

  async dispatch() {
    const queue = this.queue;
    this.queue = [];

    const keys = queue.map(item => item.key);

    try {
      const results = await this.batchLoadFn(keys);

      queue.forEach((item, index) => {
        const result = results[index];
        this.cache.set(item.key, result);
        item.resolve(result);
      });
    } catch (error) {
      queue.forEach(item => item.reject(error));
    }
  }

  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// 使用DataLoader
const userLoader = new GraphQLDataLoader(async (userIds) => {
  const query = gql`
    query GetUsers($ids: [ID!]!) {
      users(ids: $ids) {
        id
        name
        email
      }
    }
  `;

  const response = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { ids: userIds } })
  });

  const { data } = await response.json();
  return data.users;
});

function UserDisplay({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    userLoader.load(userId).then(setUser);
  }, [userId]);

  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

## GraphQL最佳实践总结

```
1. 高级特性
   ✅ 指令使用
   ✅ 联合类型和接口
   ✅ 订阅实时通信
   ✅ 文件上传

2. 缓存策略
   ✅ 内存缓存
   ✅ 规范化缓存
   ✅ 缓存失效
   ✅ 持久化缓存

3. 性能优化
   ✅ 批量请求
   ✅ DataLoader模式
   ✅ 查询优化
   ✅ 字段选择

4. 错误处理
   ✅ 部分错误处理
   ✅ 网络错误重试
   ✅ 错误边界
   ✅ 错误追踪

5. 类型安全
   ✅ TypeScript集成
   ✅ 代码生成
   ✅ 类型检查
   ✅ 运行时验证
```

GraphQL提供了强大的数据查询能力，合理运用这些高级特性和优化策略能够构建高性能的数据层。
