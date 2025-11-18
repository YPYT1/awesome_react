# Apollo Client使用

## 概述

Apollo Client是GraphQL的全功能客户端,提供了强大的缓存、状态管理、错误处理等功能。它是React应用中使用GraphQL的最流行解决方案。本文将详细介绍Apollo Client在React中的使用方法。

## 安装和配置

### 安装依赖

```bash
npm install @apollo/client graphql
```

### 基础配置

```jsx
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// 创建Apollo Client实例
const client = new ApolloClient({
  uri: 'https://api.example.com/graphql',
  cache: new InMemoryCache(),
  
  // 可选配置
  headers: {
    authorization: `Bearer ${localStorage.getItem('token')}`,
  },
  
  // 默认选项
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// 在应用中使用
function App() {
  return (
    <ApolloProvider client={client}>
      <YourApp />
    </ApolloProvider>
  );
}
```

### Link配置

```jsx
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

// HTTP Link
const httpLink = new HttpLink({
  uri: 'https://api.example.com/graphql',
});

// Auth Link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error Link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      if (extensions?.code === 'UNAUTHENTICATED') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    });
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// 组合Links
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
```

## useQuery Hook

### 基础查询

```jsx
import { useQuery, gql } from '@apollo/client';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

function UserList() {
  const { data, loading, error } = useQuery(GET_USERS);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 带变量的查询

```jsx
const GET_USER = gql`
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

function UserProfile({ userId }) {
  const { data, loading, error } = useQuery(GET_USER, {
    variables: { id: userId },
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  const { user } = data;
  
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

### 查询选项

```jsx
function AdvancedQuery() {
  const { data, loading, error, refetch, networkStatus } = useQuery(GET_USERS, {
    // 缓存策略
    fetchPolicy: 'cache-first', // cache-first | cache-and-network | network-only | no-cache | cache-only
    
    // 错误策略
    errorPolicy: 'all', // none | ignore | all
    
    // 轮询
    pollInterval: 5000, // 每5秒轮询一次
    
    // 监听网络状态
    notifyOnNetworkStatusChange: true,
    
    // 跳过查询
    skip: false,
    
    // 完成回调
    onCompleted: (data) => {
      console.log('Query completed:', data);
    },
    
    // 错误回调
    onError: (error) => {
      console.error('Query error:', error);
    },
  });
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <div>
      <button onClick={handleRefresh}>Refresh</button>
      {networkStatus === NetworkStatus.refetch && <div>Refreshing...</div>}
      {/* ... */}
    </div>
  );
}
```

## useLazyQuery Hook

### 手动触发查询

```jsx
import { useLazyQuery, gql } from '@apollo/client';

const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      email
    }
  }
`;

function UserSearch() {
  const [searchUsers, { data, loading, error }] = useLazyQuery(SEARCH_USERS);
  const [query, setQuery] = useState('');
  
  const handleSearch = () => {
    if (query.trim()) {
      searchUsers({ variables: { query } });
    }
  };
  
  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      <button onClick={handleSearch} disabled={loading}>
        Search
      </button>
      
      {loading && <div>Searching...</div>}
      {error && <div>Error: {error.message}</div>}
      {data && (
        <ul>
          {data.searchUsers.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## useMutation Hook

### 基础变更

```jsx
import { useMutation, gql } from '@apollo/client';

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
    }
  }
`;

function CreateUserForm() {
  const [createUser, { data, loading, error }] = useMutation(CREATE_USER);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    createUser({
      variables: {
        input: {
          name: formData.get('name'),
          email: formData.get('email'),
        },
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
      
      {error && <div className="error">{error.message}</div>}
      {data && <div className="success">User created: {data.createUser.name}</div>}
    </form>
  );
}
```

### 更新缓存

```jsx
const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

function CreatePostForm() {
  const [createPost] = useMutation(CREATE_POST, {
    // 方式1: 使用update更新缓存
    update(cache, { data: { createPost } }) {
      const { posts } = cache.readQuery({ query: GET_POSTS });
      
      cache.writeQuery({
        query: GET_POSTS,
        data: {
          posts: [createPost, ...posts],
        },
      });
    },
    
    // 方式2: 使用refetchQueries重新获取
    // refetchQueries: [{ query: GET_POSTS }],
    
    // 完成回调
    onCompleted: (data) => {
      toast.success(`Post "${data.createPost.title}" created`);
    },
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    await createPost({
      variables: {
        input: {
          title: formData.get('title'),
          content: formData.get('content'),
        },
      },
    });
    
    e.target.reset();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

### 乐观更新

```jsx
const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      content
      published
    }
  }
`;

function PostEditor({ post }) {
  const [updatePost] = useMutation(UPDATE_POST, {
    // 乐观更新
    optimisticResponse: {
      __typename: 'Mutation',
      updatePost: {
        __typename: 'Post',
        id: post.id,
        ...updates,
      },
    },
    
    update(cache, { data: { updatePost } }) {
      cache.modify({
        id: cache.identify(post),
        fields: {
          title() {
            return updatePost.title;
          },
          content() {
            return updatePost.content;
          },
        },
      });
    },
    
    onError: (error) => {
      toast.error('Update failed');
    },
  });
  
  const handleUpdate = (updates) => {
    updatePost({
      variables: {
        id: post.id,
        input: updates,
      },
    });
  };
  
  return <PostForm initialValues={post} onSubmit={handleUpdate} />;
}
```

## 缓存管理

### InMemoryCache配置

```jsx
import { InMemoryCache } from '@apollo/client';

const cache = new InMemoryCache({
  // 类型策略
  typePolicies: {
    Query: {
      fields: {
        posts: {
          // 合并策略
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
    Post: {
      // 键字段
      keyFields: ['id'],
      
      // 字段策略
      fields: {
        likeCount: {
          read(existing = 0) {
            return existing;
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  uri: 'https://api.example.com/graphql',
  cache,
});
```

### 读写缓存

```jsx
import { useApolloClient } from '@apollo/client';

function CacheManipulation() {
  const client = useApolloClient();
  
  const handleReadCache = () => {
    // 读取查询缓存
    const data = client.readQuery({
      query: GET_USERS,
    });
    
    console.log('Cached users:', data.users);
  };
  
  const handleWriteCache = () => {
    // 写入查询缓存
    client.writeQuery({
      query: GET_USERS,
      data: {
        users: [
          { id: '1', name: 'John', email: 'john@example.com' },
        ],
      },
    });
  };
  
  const handleReadFragment = () => {
    // 读取片段
    const user = client.readFragment({
      id: 'User:123',
      fragment: gql`
        fragment UserFields on User {
          id
          name
          email
        }
      `,
    });
    
    console.log('User fragment:', user);
  };
  
  const handleModifyCache = () => {
    // 修改缓存
    client.cache.modify({
      id: 'User:123',
      fields: {
        name(existing) {
          return 'New Name';
        },
      },
    });
  };
  
  return (
    <div>
      <button onClick={handleReadCache}>Read Cache</button>
      <button onClick={handleWriteCache}>Write Cache</button>
      <button onClick={handleReadFragment}>Read Fragment</button>
      <button onClick={handleModifyCache}>Modify Cache</button>
    </div>
  );
}
```

### 缓存失效

```jsx
function CacheInvalidation() {
  const client = useApolloClient();
  
  const handleEvictCache = () => {
    // 移除特定对象
    client.cache.evict({ id: 'User:123' });
    
    // 移除特定字段
    client.cache.evict({
      id: 'User:123',
      fieldName: 'posts',
    });
    
    // 垃圾回收
    client.cache.gc();
  };
  
  const handleResetCache = () => {
    // 重置整个缓存
    client.resetStore();
    
    // 或清除缓存但不refetch
    client.clearStore();
  };
  
  return (
    <div>
      <button onClick={handleEvictCache}>Evict Cache</button>
      <button onClick={handleResetCache}>Reset Cache</button>
    </div>
  );
}
```

## 分页

### Offset分页

```jsx
const GET_POSTS = gql`
  query GetPosts($offset: Int!, $limit: Int!) {
    posts(offset: $offset, limit: $limit) {
      id
      title
      content
    }
  }
`;

function OffsetPagination() {
  const [page, setPage] = useState(0);
  const limit = 10;
  
  const { data, loading, fetchMore } = useQuery(GET_POSTS, {
    variables: {
      offset: page * limit,
      limit,
    },
  });
  
  const handleNextPage = () => {
    fetchMore({
      variables: {
        offset: (page + 1) * limit,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return fetchMoreResult;
      },
    });
    
    setPage(page + 1);
  };
  
  return (
    <div>
      {data?.posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
      
      <button onClick={handleNextPage} disabled={loading}>
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}
```

### Cursor分页

```jsx
const GET_POSTS = gql`
  query GetPosts($after: String, $first: Int!) {
    posts(after: $after, first: $first) {
      edges {
        node {
          id
          title
          content
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

function CursorPagination() {
  const { data, loading, fetchMore } = useQuery(GET_POSTS, {
    variables: { first: 10 },
  });
  
  const handleLoadMore = () => {
    fetchMore({
      variables: {
        after: data.posts.pageInfo.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        
        return {
          posts: {
            ...fetchMoreResult.posts,
            edges: [
              ...prev.posts.edges,
              ...fetchMoreResult.posts.edges,
            ],
          },
        };
      },
    });
  };
  
  return (
    <div>
      {data?.posts.edges.map(({ node }) => (
        <PostCard key={node.id} post={node} />
      ))}
      
      {data?.posts.pageInfo.hasNextPage && (
        <button onClick={handleLoadMore} disabled={loading}>
          Load More
        </button>
      )}
    </div>
  );
}
```

## 订阅(Subscriptions)

### WebSocket配置

```bash
npm install graphql-ws
```

```jsx
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://api.example.com/graphql',
    connectionParams: {
      authToken: localStorage.getItem('token'),
    },
  })
);

// 根据操作类型选择link
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
```

### useSubscription Hook

```jsx
import { useSubscription, gql } from '@apollo/client';

const POST_CREATED = gql`
  subscription OnPostCreated {
    postCreated {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

function LivePosts() {
  const { data, loading } = useSubscription(POST_CREATED, {
    onData: ({ data }) => {
      toast.info(`New post: ${data.postCreated.title}`);
    },
  });
  
  if (loading) return <div>Connecting...</div>;
  
  return (
    <div>
      {data && (
        <div className="new-post">
          <h3>{data.postCreated.title}</h3>
          <p>by {data.postCreated.author.name}</p>
        </div>
      )}
    </div>
  );
}
```

### 订阅更新查询

```jsx
function PostsWithSubscription() {
  const { data: posts } = useQuery(GET_POSTS);
  
  useSubscription(POST_CREATED, {
    onData: ({ client, data }) => {
      const newPost = data.postCreated;
      
      // 更新缓存
      client.cache.updateQuery({ query: GET_POSTS }, (existingData) => ({
        posts: [newPost, ...existingData.posts],
      }));
    },
  });
  
  return (
    <ul>
      {posts?.posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## 总结

Apollo Client核心特性：

1. **安装配置**：ApolloProvider、Link配置
2. **useQuery**：声明式查询、查询选项
3. **useLazyQuery**：手动触发查询
4. **useMutation**：数据变更、缓存更新
5. **缓存管理**：读写缓存、缓存失效
6. **分页**：Offset分页、Cursor分页
7. **订阅**：WebSocket、实时更新

Apollo Client提供了完整的GraphQL解决方案,是React + GraphQL的最佳实践。

## 第四部分：Apollo Client高级特性

### 4.1 Apollo缓存持久化

```jsx
import { InMemoryCache, ApolloClient } from '@apollo/client';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';

// 1. 持久化缓存设置
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          merge(existing, incoming) {
            return incoming;
          }
        }
      }
    }
  }
});

async function setupApollo() {
  await persistCache({
    cache,
    storage: new LocalStorageWrapper(window.localStorage),
    maxSize: 1048576, // 1MB
    debounce: 1000
  });

  const client = new ApolloClient({
    uri: '/graphql',
    cache
  });

  return client;
}

// 2. IndexedDB持久化
import { IndexedDBWrapper } from 'apollo3-cache-persist';

async function setupApolloWithIndexedDB() {
  const cache = new InMemoryCache();

  await persistCache({
    cache,
    storage: new IndexedDBWrapper('apollo-cache'),
    maxSize: 10485760, // 10MB
    debug: true
  });

  return new ApolloClient({ uri: '/graphql', cache });
}

// 3. 清除持久化缓存
function ClearCacheButton() {
  const client = useApolloClient();

  const clearCache = async () => {
    await client.clearStore();
    await persistCache.purge();
    window.location.reload();
  };

  return <button onClick={clearCache}>Clear Cache</button>;
}

// 4. 选择性持久化
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // 不持久化的字段
        temporaryData: {
          read() {
            return null;
          }
        }
      }
    },
    // 敏感数据不持久化
    SecureData: {
      keyFields: false
    }
  }
});
```

### 4.2 Apollo Link链

```jsx
import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { setContext } from '@apollo/client/link/context';

// 1. 错误处理Link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // 处理认证错误
      if (extensions?.code === 'UNAUTHENTICATED') {
        // 重定向到登录页
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// 2. 重试Link
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => !!error
  }
});

// 3. 认证Link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  };
});

// 4. 日志Link
import { ApolloLink } from '@apollo/client';

const loggerLink = new ApolloLink((operation, forward) => {
  console.log(`Starting request for ${operation.operationName}`);
  
  const startTime = Date.now();

  return forward(operation).map(data => {
    const elapsed = Date.now() - startTime;
    console.log(`Operation ${operation.operationName} took ${elapsed}ms`);
    return data;
  });
});

// 5. 组合所有Link
const httpLink = new HttpLink({ uri: '/graphql' });

const client = new ApolloClient({
  link: from([
    loggerLink,
    errorLink,
    retryLink,
    authLink,
    httpLink
  ]),
  cache: new InMemoryCache()
});

// 6. 条件Link
const conditionalLink = new ApolloLink((operation, forward) => {
  if (operation.getContext().important) {
    operation.setContext({ timeout: 30000 });
  }
  return forward(operation);
});
```

### 4.3 Apollo乐观UI

```jsx
// 1. 基础乐观更新
const [addTodo] = useMutation(ADD_TODO, {
  optimisticResponse: {
    __typename: 'Mutation',
    addTodo: {
      __typename: 'Todo',
      id: 'temp-id',
      text: 'New Todo',
      completed: false
    }
  },
  update(cache, { data: { addTodo } }) {
    cache.modify({
      fields: {
        todos(existingTodos = []) {
          const newTodoRef = cache.writeFragment({
            data: addTodo,
            fragment: gql`
              fragment NewTodo on Todo {
                id
                text
                completed
              }
            `
          });
          return [...existingTodos, newTodoRef];
        }
      }
    });
  }
});

// 2. 复杂乐观更新
const [updateUser] = useMutation(UPDATE_USER, {
  optimisticResponse: ({ id, name, email }) => ({
    __typename: 'Mutation',
    updateUser: {
      __typename: 'User',
      id,
      name,
      email,
      updatedAt: new Date().toISOString()
    }
  }),
  update(cache, { data: { updateUser } }, { variables }) {
    // 更新缓存中的用户
    cache.writeFragment({
      id: cache.identify(updateUser),
      fragment: gql`
        fragment UpdatedUser on User {
          id
          name
          email
          updatedAt
        }
      `,
      data: updateUser
    });

    // 更新相关查询
    cache.modify({
      id: cache.identify({ __typename: 'Query' }),
      fields: {
        users(existingUsers, { readField }) {
          return existingUsers.map(userRef => {
            if (readField('id', userRef) === variables.id) {
              return { ...userRef, ...updateUser };
            }
            return userRef;
          });
        }
      }
    });
  }
});

// 3. 乐观删除
const [deleteTodo] = useMutation(DELETE_TODO, {
  optimisticResponse: ({ id }) => ({
    __typename: 'Mutation',
    deleteTodo: {
      __typename: 'DeleteResult',
      success: true,
      id
    }
  }),
  update(cache, { data: { deleteTodo } }) {
    if (deleteTodo.success) {
      cache.modify({
        fields: {
          todos(existingTodos, { readField }) {
            return existingTodos.filter(
              todoRef => readField('id', todoRef) !== deleteTodo.id
            );
          }
        }
      });

      // 删除缓存项
      cache.evict({ id: cache.identify({ __typename: 'Todo', id: deleteTodo.id }) });
      cache.gc();
    }
  }
});

// 4. 带回滚的乐观更新
function OptimisticWithRollback() {
  const [updateTodo] = useMutation(UPDATE_TODO, {
    optimisticResponse: ({ id, completed }) => ({
      __typename: 'Mutation',
      updateTodo: {
        __typename: 'Todo',
        id,
        completed,
        updatedAt: new Date().toISOString()
      }
    }),
    onError: (error, clientOptions) => {
      // 错误时Apollo会自动回滚乐观更新
      console.error('Update failed, rolling back:', error);
      toast.error('更新失败，已恢复');
    },
    onCompleted: (data) => {
      toast.success('更新成功');
    }
  });

  return (
    <button onClick={() => updateTodo({ variables: { id: '1', completed: true } })}>
      Complete
    </button>
  );
}
```

### 4.4 Apollo字段策略

```jsx
// 1. 自定义字段读取
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // 计算字段
        completedTodos: {
          read(_, { readField }) {
            const todos = readField('todos') || [];
            return todos.filter(todo => readField('completed', todo));
          }
        },
        
        // 分页字段
        paginatedPosts: {
          keyArgs: ['filter'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            if (args?.reset) {
              return incoming;
            }

            return {
              ...incoming,
              posts: [...(existing.posts || []), ...(incoming.posts || [])]
            };
          },
          read(existing) {
            return existing;
          }
        }
      }
    },
    
    User: {
      fields: {
        // 虚拟字段
        fullName: {
          read(_, { readField }) {
            const firstName = readField('firstName');
            const lastName = readField('lastName');
            return `${firstName} ${lastName}`;
          }
        },
        
        // 本地状态字段
        isSelected: {
          read(cached = false) {
            return cached;
          }
        }
      }
    }
  }
});

// 2. 字段策略参数
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        post: {
          // 使用参数作为缓存键
          keyArgs: ['id'],
          
          read(existing, { args, toReference }) {
            return existing || toReference({
              __typename: 'Post',
              id: args.id
            });
          }
        }
      }
    }
  }
});

// 3. 分页合并策略
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        feed: {
          keyArgs: false,
          merge(existing, incoming, { args: { offset = 0 } }) {
            const merged = existing ? existing.slice(0) : [];
            for (let i = 0; i < incoming.length; ++i) {
              merged[offset + i] = incoming[i];
            }
            return merged;
          },
          read(existing, { args: { offset, limit } }) {
            return existing && existing.slice(offset, offset + limit);
          }
        }
      }
    }
  }
});
```

### 4.5 Apollo实时更新策略

```jsx
// 1. 订阅自动更新
const POSTS_SUBSCRIPTION = gql`
  subscription OnPostAdded {
    postAdded {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

function PostsList() {
  const { data, loading, subscribeToMore } = useQuery(GET_POSTS);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: POSTS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const newPost = subscriptionData.data.postAdded;
        
        return {
          ...prev,
          posts: [newPost, ...prev.posts]
        };
      }
    });

    return () => unsubscribe();
  }, [subscribeToMore]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {data.posts.map(post => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
}

// 2. 轮询策略
function PollingData() {
  const { data, startPolling, stopPolling } = useQuery(GET_DATA, {
    pollInterval: 5000 // 每5秒轮询一次
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling(5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  return <div>{JSON.stringify(data)}</div>;
}

// 3. 手动refetch策略
function ManualRefetch() {
  const { data, refetch, networkStatus } = useQuery(GET_DATA, {
    notifyOnNetworkStatusChange: true
  });

  const isRefetching = networkStatus === NetworkStatus.refetch;

  return (
    <div>
      <button onClick={() => refetch()} disabled={isRefetching}>
        {isRefetching ? 'Refreshing...' : 'Refresh'}
      </button>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}

// 4. 条件性重新获取
function ConditionalRefetch() {
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const { data } = useQuery(GET_DATA, {
    skip: !shouldRefetch,
    onCompleted: () => {
      setShouldRefetch(false);
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setShouldRefetch(true);
    }, 60000); // 每分钟检查一次

    return () => clearInterval(interval);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

### 4.6 Apollo调试工具

```jsx
// 1. Apollo DevTools集成
import { ApolloClient } from '@apollo/client';

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === 'development'
});

// 2. 查询日志
const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(error => {
        console.group('GraphQL Error');
        console.error('Message:', error.message);
        console.error('Path:', error.path);
        console.error('Extensions:', error.extensions);
        console.groupEnd();
      });
    }

    if (networkError) {
      console.error('Network Error:', networkError);
    }
  }
});

// 3. 缓存检查器
function CacheInspector() {
  const client = useApolloClient();

  const inspectCache = () => {
    const cache = client.cache.extract();
    console.log('Apollo Cache:', cache);
    
    // 分析缓存大小
    const size = JSON.stringify(cache).length;
    console.log(`Cache size: ${(size / 1024).toFixed(2)} KB`);
  };

  return <button onClick={inspectCache}>Inspect Cache</button>;
}

// 4. 性能监控
const performanceLink = new ApolloLink((operation, forward) => {
  const startTime = performance.now();

  return forward(operation).map(data => {
    const duration = performance.now() - startTime;

    console.log({
      operation: operation.operationName,
      duration: `${duration.toFixed(2)}ms`,
      variables: operation.variables,
      result: data
    });

    // 慢查询警告
    if (duration > 1000) {
      console.warn(`Slow query detected: ${operation.operationName} took ${duration}ms`);
    }

    return data;
  });
});

const client = new ApolloClient({
  link: from([performanceLink, httpLink]),
  cache: new InMemoryCache()
});
```

## Apollo Client最佳实践总结

```
1. 缓存管理
   ✅ 持久化缓存
   ✅ 字段策略
   ✅ 规范化存储
   ✅ 缓存清理

2. Link链
   ✅ 错误处理
   ✅ 认证授权
   ✅ 重试机制
   ✅ 日志记录

3. 乐观UI
   ✅ 乐观响应
   ✅ 缓存更新
   ✅ 错误回滚
   ✅ 用户反馈

4. 实时更新
   ✅ 订阅集成
   ✅ 轮询策略
   ✅ 手动刷新
   ✅ 条件重取

5. 调试优化
   ✅ DevTools集成
   ✅ 性能监控
   ✅ 缓存检查
   ✅ 错误追踪
```

Apollo Client是GraphQL生态中最成熟的客户端解决方案，合理运用其高级特性能够构建高性能、可维护的React应用。
