# RTK Query数据获取

## 概述

RTK Query是Redux Toolkit的数据获取和缓存解决方案，专门用来简化在Redux应用中加载数据的常见情况。它建立在Redux Toolkit的createApi和fetchBaseQuery之上，为React应用提供了强大的数据同步功能。

## RTK Query的优势

### 与传统方式对比

```jsx
// 传统方式 - 大量样板代码
const FETCH_USERS_START = 'users/fetchStart';
const FETCH_USERS_SUCCESS = 'users/fetchSuccess';
const FETCH_USERS_ERROR = 'users/fetchError';

// Action creators
const fetchUsersStart = () => ({ type: FETCH_USERS_START });
const fetchUsersSuccess = (users) => ({ type: FETCH_USERS_SUCCESS, payload: users });
const fetchUsersError = (error) => ({ type: FETCH_USERS_ERROR, payload: error });

// Thunk
const fetchUsers = () => async (dispatch) => {
  dispatch(fetchUsersStart());
  try {
    const response = await fetch('/api/users');
    const users = await response.json();
    dispatch(fetchUsersSuccess(users));
  } catch (error) {
    dispatch(fetchUsersError(error.message));
  }
};

// Reducer
const usersReducer = (state = { data: [], loading: false, error: null }, action) => {
  switch (action.type) {
    case FETCH_USERS_START:
      return { ...state, loading: true, error: null };
    case FETCH_USERS_SUCCESS:
      return { ...state, loading: false, data: action.payload };
    case FETCH_USERS_ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// RTK Query - 简洁明了
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => 'users'
    })
  })
});

export const { useGetUsersQuery } = usersApi;

// 在组件中使用
function UsersList() {
  const { data: users, error, isLoading } = useGetUsersQuery();

  if (isLoading) return <div>Loading...</div>;
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

## 基础设置

### 安装

```bash
# RTK Query 包含在 @reduxjs/toolkit 中
npm install @reduxjs/toolkit react-redux
```

### 创建API Slice

```jsx
// api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    // 可选：添加认证token
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  // 标签用于缓存失效
  tagTypes: ['User', 'Post', 'Comment'],
  endpoints: (builder) => ({
    // endpoints 将在这里定义
  })
});
```

### Store配置

```jsx
// store.js
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    // 其他 reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware)
});
```

## 查询 Endpoints

### 基础查询

```jsx
const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // 获取所有用户
    getUsers: builder.query({
      query: () => 'users',
      providesTags: ['User']
    }),

    // 获取单个用户
    getUser: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),

    // 带参数的查询
    getUserPosts: builder.query({
      query: ({ userId, page = 1, limit = 10 }) => 
        `users/${userId}/posts?page=${page}&limit=${limit}`,
      providesTags: (result, error, { userId }) => [
        { type: 'Post', id: 'LIST' },
        ...result?.map(({ id }) => ({ type: 'Post', id })) || []
      ]
    }),

    // 搜索查询
    searchUsers: builder.query({
      query: (searchTerm) => `users/search?q=${encodeURIComponent(searchTerm)}`,
      // 动态标签
      providesTags: (result) => 
        result?.map(({ id }) => ({ type: 'User', id })) || ['User']
    })
  })
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useGetUserPostsQuery,
  useSearchUsersQuery
} = apiSlice;
```

### 使用查询Hooks

```jsx
function UserProfile({ userId }) {
  const {
    data: user,
    error,
    isLoading,
    isSuccess,
    isError,
    refetch
  } = useGetUserQuery(userId);

  const {
    data: posts,
    isLoading: postsLoading
  } = useGetUserPostsQuery({ userId, page: 1 });

  if (isLoading) return <div>Loading user...</div>;
  if (isError) return <div>Error: {error.message}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <button onClick={refetch}>Refresh</button>
      
      <h2>Posts</h2>
      {postsLoading ? (
        <div>Loading posts...</div>
      ) : (
        <ul>
          {posts?.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 查询选项

```jsx
function UsersList() {
  const {
    data: users,
    error,
    isLoading
  } = useGetUsersQuery(undefined, {
    // 轮询间隔（毫秒）
    pollingInterval: 30000,
    
    // 窗口获得焦点时重新获取
    refetchOnFocus: true,
    
    // 重新连接时重新获取
    refetchOnReconnect: true,
    
    // 挂载时重新获取
    refetchOnMountOrArgChange: true,
    
    // 跳过查询
    skip: false,
    
    // 选择数据
    selectFromResult: ({ data, ...other }) => ({
      data: data?.filter(user => user.active),
      ...other
    })
  });

  // ...
}
```

## 变更 Endpoints

### 基础变更

```jsx
const apiSlice = createApi({
  // ... 配置
  endpoints: (builder) => ({
    // 创建用户
    createUser: builder.mutation({
      query: (newUser) => ({
        url: 'users',
        method: 'POST',
        body: newUser
      }),
      invalidatesTags: ['User']
    }),

    // 更新用户
    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    }),

    // 删除用户
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }]
    }),

    // 上传头像
    uploadAvatar: builder.mutation({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return {
          url: `users/${userId}/avatar`,
          method: 'POST',
          body: formData,
          formData: true
        };
      },
      invalidatesTags: (result, error, { userId }) => [{ type: 'User', id: userId }]
    })
  })
});

export const {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadAvatarMutation
} = apiSlice;
```

### 使用变更Hooks

```jsx
function UserForm({ user, onSuccess }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [createUser, {
    isLoading: isCreating,
    error: createError
  }] = useCreateUserMutation();

  const [updateUser, {
    isLoading: isUpdating,
    error: updateError
  }] = useUpdateUserMutation();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userData = { name, email };
      
      if (user) {
        await updateUser({ id: user.id, ...userData }).unwrap();
      } else {
        await createUser(userData).unwrap();
      }
      
      onSuccess?.();
    } catch (err) {
      console.error('Failed to save user:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : user ? 'Update' : 'Create'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

### 乐观更新

```jsx
const apiSlice = createApi({
  // ... 配置
  endpoints: (builder) => ({
    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: updates
      }),
      // 乐观更新
      onQueryStarted: async ({ id, ...updates }, { dispatch, queryFulfilled }) => {
        // 乐观更新缓存
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getUser', id, (draft) => {
            Object.assign(draft, updates);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // 失败时回滚
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    }),

    toggleUserStatus: builder.mutation({
      query: ({ id, active }) => ({
        url: `users/${id}/status`,
        method: 'PATCH',
        body: { active }
      }),
      onQueryStarted: async ({ id, active }, { dispatch, queryFulfilled }) => {
        // 更新单个用户缓存
        const userPatch = dispatch(
          apiSlice.util.updateQueryData('getUser', id, (draft) => {
            draft.active = active;
          })
        );

        // 更新用户列表缓存
        const usersPatch = dispatch(
          apiSlice.util.updateQueryData('getUsers', undefined, (draft) => {
            const user = draft.find(user => user.id === id);
            if (user) {
              user.active = active;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          userPatch.undo();
          usersPatch.undo();
        }
      }
    })
  })
});
```

## 缓存管理

### 标签系统

```jsx
const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['User', 'Post', 'Comment', 'Like'],
  endpoints: (builder) => ({
    // 查询提供标签
    getUsers: builder.query({
      query: () => 'users',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' }
            ]
          : [{ type: 'User', id: 'LIST' }]
    }),

    getPost: builder.query({
      query: (id) => `posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }]
    }),

    getPostComments: builder.query({
      query: (postId) => `posts/${postId}/comments`,
      providesTags: (result, error, postId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Comment', id })),
              { type: 'Comment', id: 'LIST' }
            ]
          : [{ type: 'Comment', id: 'LIST' }]
    }),

    // 变更使缓存失效
    createUser: builder.mutation({
      query: (newUser) => ({
        url: 'users',
        method: 'POST',
        body: newUser
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }]
    }),

    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    }),

    deletePost: builder.mutation({
      query: (id) => ({
        url: `posts/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
        { type: 'Comment', id: 'LIST' } // 删除帖子时也清除评论缓存
      ]
    })
  })
});
```

### 手动缓存管理

```jsx
function PostActions({ postId }) {
  const dispatch = useDispatch();

  const handleRefreshPost = () => {
    // 手动刷新特定查询
    dispatch(
      apiSlice.util.invalidateTags([{ type: 'Post', id: postId }])
    );
  };

  const handlePrefetchComments = () => {
    // 预取数据
    dispatch(
      apiSlice.util.prefetch('getPostComments', postId, { force: true })
    );
  };

  const handleUpdateCache = (newData) => {
    // 直接更新缓存
    dispatch(
      apiSlice.util.updateQueryData('getPost', postId, (draft) => {
        Object.assign(draft, newData);
      })
    );
  };

  return (
    <div>
      <button onClick={handleRefreshPost}>Refresh</button>
      <button onClick={handlePrefetchComments}>Prefetch Comments</button>
    </div>
  );
}
```

### 选择性缓存失效

```jsx
const apiSlice = createApi({
  // ... 配置
  endpoints: (builder) => ({
    likePost: builder.mutation({
      query: ({ postId, userId }) => ({
        url: `posts/${postId}/like`,
        method: 'POST',
        body: { userId }
      }),
      onQueryStarted: async ({ postId, userId }, { dispatch, queryFulfilled }) => {
        // 乐观更新帖子的点赞数
        const postPatch = dispatch(
          apiSlice.util.updateQueryData('getPost', postId, (draft) => {
            draft.likes = (draft.likes || 0) + 1;
            draft.likedByCurrentUser = true;
          })
        );

        // 更新帖子列表中的点赞数
        const postsPatch = dispatch(
          apiSlice.util.updateQueryData('getPosts', undefined, (draft) => {
            const post = draft.find(p => p.id === postId);
            if (post) {
              post.likes = (post.likes || 0) + 1;
              post.likedByCurrentUser = true;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          postPatch.undo();
          postsPatch.undo();
        }
      }
    })
  })
});
```

## 高级特性

### 自定义 BaseQuery

```jsx
import { fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

// 带重试的 BaseQuery
const baseQueryWithRetry = retry(
  fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  { maxRetries: 3 }
);

// 带认证刷新的 BaseQuery
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await fetchBaseQuery({
    baseUrl: '/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  })(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // 尝试刷新token
    const refreshResult = await fetchBaseQuery({
      baseUrl: '/api/'
    })('/auth/refresh', api, extraOptions);

    if (refreshResult.data) {
      api.dispatch(setToken(refreshResult.data.token));
      
      // 重新执行原始查询
      result = await fetchBaseQuery({
        baseUrl: '/api/',
        prepareHeaders: (headers, { getState }) => {
          const token = getState().auth.token;
          if (token) {
            headers.set('authorization', `Bearer ${token}`);
          }
          return headers;
        }
      })(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // ... 其他配置
});
```

### 条件查询

```jsx
function UserProfile({ userId, shouldFetch }) {
  const {
    data: user,
    error,
    isLoading
  } = useGetUserQuery(userId, {
    // 条件性跳过查询
    skip: !userId || !shouldFetch
  });

  // 或使用 skipToken
  const {
    data: posts
  } = useGetUserPostsQuery(userId || skipToken);

  // ...
}
```

### 变换响应数据

```jsx
const apiSlice = createApi({
  // ... 配置
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => 'users',
      // 变换响应数据
      transformResponse: (responseData) => {
        // 规范化数据
        return responseData.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          displayName: `${user.name} <${user.email}>`,
          initials: user.name.split(' ').map(n => n[0]).join('')
        }));
      }
    }),

    getUserStats: builder.query({
      query: (userId) => `users/${userId}/stats`,
      transformResponse: (response) => ({
        ...response,
        // 计算派生数据
        engagementRate: response.likes / response.posts * 100,
        averagePostsPerMonth: response.posts / response.monthsActive
      })
    })
  })
});
```

### 错误处理

```jsx
const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/',
    // 自定义错误处理
    responseHandler: async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Something went wrong');
      }
      return response.json();
    }
  }),
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData
      }),
      // 变换错误
      transformErrorResponse: (response) => {
        if (response.status === 422) {
          return {
            message: 'Validation failed',
            errors: response.data.errors
          };
        }
        return response.data;
      }
    })
  })
});

// 在组件中处理错误
function CreateUserForm() {
  const [createUser, { error, isLoading }] = useCreateUserMutation();

  const handleSubmit = async (userData) => {
    try {
      await createUser(userData).unwrap();
      // 成功处理
    } catch (err) {
      // 错误已经在 error 状态中
      console.error('Failed to create user:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      {error && (
        <div className="error">
          {error.message}
          {error.errors && (
            <ul>
              {Object.entries(error.errors).map(([field, messages]) => (
                <li key={field}>{field}: {messages.join(', ')}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <button type="submit" disabled={isLoading}>
        Create User
      </button>
    </form>
  );
}
```

## 实战案例

### 案例1：博客应用

```jsx
// api/blogApi.js
const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/blog/' }),
  tagTypes: ['Post', 'User', 'Comment', 'Tag'],
  endpoints: (builder) => ({
    // 帖子相关
    getPosts: builder.query({
      query: ({ page = 1, limit = 10, tag, author } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        if (tag) params.append('tag', tag);
        if (author) params.append('author', author);
        return `posts?${params}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Post', id })),
              { type: 'Post', id: 'PARTIAL-LIST' }
            ]
          : [{ type: 'Post', id: 'PARTIAL-LIST' }],
      // 合并分页数据
      serializeQueryArgs: ({ queryArgs }) => {
        const { page, ...otherArgs } = queryArgs;
        return otherArgs;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          currentCache.data = newItems.data;
        } else {
          currentCache.data.push(...newItems.data);
        }
        currentCache.pagination = newItems.pagination;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      }
    }),

    getPost: builder.query({
      query: (id) => `posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }]
    }),

    createPost: builder.mutation({
      query: (newPost) => ({
        url: 'posts',
        method: 'POST',
        body: newPost
      }),
      invalidatesTags: [{ type: 'Post', id: 'PARTIAL-LIST' }]
    }),

    updatePost: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `posts/${id}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }]
    }),

    deletePost: builder.mutation({
      query: (id) => ({
        url: `posts/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'PARTIAL-LIST' }
      ]
    }),

    // 评论相关
    getPostComments: builder.query({
      query: (postId) => `posts/${postId}/comments`,
      providesTags: (result, error, postId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Comment', id })),
              { type: 'Comment', id: `LIST-${postId}` }
            ]
          : [{ type: 'Comment', id: `LIST-${postId}` }]
    }),

    addComment: builder.mutation({
      query: ({ postId, content }) => ({
        url: `posts/${postId}/comments`,
        method: 'POST',
        body: { content }
      }),
      invalidatesTags: (result, error, { postId }) => [
        { type: 'Comment', id: `LIST-${postId}` }
      ]
    }),

    // 标签相关
    getTags: builder.query({
      query: () => 'tags',
      providesTags: ['Tag']
    }),

    // 搜索
    searchPosts: builder.query({
      query: (searchTerm) => `search?q=${encodeURIComponent(searchTerm)}`,
      providesTags: ['Post']
    })
  })
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetPostCommentsQuery,
  useAddCommentMutation,
  useGetTagsQuery,
  useSearchPostsQuery
} = blogApi;

export default blogApi;
```

### 案例2：电商应用

```jsx
// api/ecommerceApi.js
const ecommerceApi = createApi({
  reducerPath: 'ecommerceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/ecommerce/',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ['Product', 'Category', 'Cart', 'Order', 'User'],
  endpoints: (builder) => ({
    // 产品相关
    getProducts: builder.query({
      query: ({ 
        category, 
        minPrice, 
        maxPrice, 
        sortBy = 'name', 
        order = 'asc',
        page = 1,
        limit = 20 
      } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          order
        });
        
        if (category) params.append('category', category);
        if (minPrice) params.append('minPrice', minPrice.toString());
        if (maxPrice) params.append('maxPrice', maxPrice.toString());
        
        return `products?${params}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' }
            ]
          : [{ type: 'Product', id: 'LIST' }]
    }),

    getProduct: builder.query({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),

    // 购物车相关
    getCart: builder.query({
      query: () => 'cart',
      providesTags: ['Cart']
    }),

    addToCart: builder.mutation({
      query: ({ productId, quantity = 1, options = {} }) => ({
        url: 'cart/items',
        method: 'POST',
        body: { productId, quantity, options }
      }),
      // 乐观更新
      onQueryStarted: async ({ productId, quantity, options }, { dispatch, queryFulfilled, getState }) => {
        const patchResult = dispatch(
          ecommerceApi.util.updateQueryData('getCart', undefined, (draft) => {
            const existingItem = draft.items.find(
              item => item.productId === productId && 
                      JSON.stringify(item.options) === JSON.stringify(options)
            );
            
            if (existingItem) {
              existingItem.quantity += quantity;
            } else {
              // 从产品缓存中获取产品信息
              const product = ecommerceApi.endpoints.getProduct.select(productId)(getState())?.data;
              if (product) {
                draft.items.push({
                  id: `${productId}_${JSON.stringify(options)}_${Date.now()}`,
                  productId,
                  product,
                  quantity,
                  options
                });
              }
            }
            
            // 重新计算总价
            draft.total = draft.items.reduce(
              (sum, item) => sum + (item.product.price * item.quantity), 
              0
            );
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart']
    }),

    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `cart/items/${itemId}`,
        method: 'PATCH',
        body: { quantity }
      }),
      onQueryStarted: async ({ itemId, quantity }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          ecommerceApi.util.updateQueryData('getCart', undefined, (draft) => {
            const item = draft.items.find(item => item.id === itemId);
            if (item) {
              if (quantity <= 0) {
                draft.items = draft.items.filter(item => item.id !== itemId);
              } else {
                item.quantity = quantity;
              }
              
              draft.total = draft.items.reduce(
                (sum, item) => sum + (item.product.price * item.quantity), 
                0
              );
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ['Cart']
    }),

    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `cart/items/${itemId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Cart']
    }),

    clearCart: builder.mutation({
      query: () => ({
        url: 'cart',
        method: 'DELETE'
      }),
      invalidatesTags: ['Cart']
    }),

    // 订单相关
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: 'orders',
        method: 'POST',
        body: orderData
      }),
      invalidatesTags: ['Order', 'Cart']
    }),

    getOrders: builder.query({
      query: () => 'orders',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Order', id })),
              { type: 'Order', id: 'LIST' }
            ]
          : [{ type: 'Order', id: 'LIST' }]
    }),

    getOrder: builder.query({
      query: (id) => `orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }]
    }),

    // 分类相关
    getCategories: builder.query({
      query: () => 'categories',
      providesTags: ['Category']
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useGetCategoriesQuery
} = ecommerceApi;

export default ecommerceApi;
```

## 最佳实践

### 1. API 设计

```jsx
// 好的API设计
const goodApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['User', 'Post'], // 明确定义标签类型
  endpoints: (builder) => ({
    // 明确的命名
    getUsers: builder.query({
      query: () => 'users',
      providesTags: ['User']
    }),
    
    // 带参数的查询
    getUser: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),
    
    // 描述性的mutation名称
    createUser: builder.mutation({
      query: (newUser) => ({
        url: 'users',
        method: 'POST',
        body: newUser
      }),
      invalidatesTags: ['User']
    })
  })
});

// 避免的设计
const badApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  endpoints: (builder) => ({
    // 不明确的命名
    data: builder.query({
      query: () => 'users'
    }),
    
    // 缺少缓存标签
    update: builder.mutation({
      query: (data) => ({
        url: 'users',
        method: 'POST',
        body: data
      })
      // 没有 invalidatesTags
    })
  })
});
```

### 2. 缓存策略

```jsx
// 细粒度缓存控制
const apiSlice = createApi({
  // ...
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => 'users',
      // 为列表和单个项目提供不同的标签
      providesTags: (result) =>
        result
          ? [
              { type: 'User', id: 'LIST' },
              ...result.map(({ id }) => ({ type: 'User', id }))
            ]
          : [{ type: 'User', id: 'LIST' }]
    }),
    
    createUser: builder.mutation({
      query: (newUser) => ({
        url: 'users',
        method: 'POST',
        body: newUser
      }),
      // 只失效列表，不失效单个用户
      invalidatesTags: [{ type: 'User', id: 'LIST' }]
    }),
    
    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: updates
      }),
      // 失效特定用户
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    })
  })
});
```

### 3. 错误处理

```jsx
// 统一错误处理
const baseQueryWithErrorHandling = fetchBaseQuery({
  baseUrl: '/api/',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }
});

const apiSliceWithErrorHandling = async (args, api, extraOptions) => {
  const result = await baseQueryWithErrorHandling(args, api, extraOptions);
  
  if (result.error) {
    // 全局错误处理
    if (result.error.status === 401) {
      // 未授权，重定向到登录
      api.dispatch(logout());
    } else if (result.error.status === 500) {
      // 服务器错误，显示通用错误消息
      api.dispatch(showErrorNotification('Server error occurred'));
    }
  }
  
  return result;
};
```

### 4. TypeScript 类型

```typescript
// 定义API响应类型
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

interface UpdateUserRequest {
  id: number;
  name?: string;
  email?: string;
}

const typedApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'users',
      providesTags: ['User']
    }),
    
    getUser: builder.query<User, number>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }]
    }),
    
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (newUser) => ({
        url: 'users',
        method: 'POST',
        body: newUser
      }),
      invalidatesTags: ['User']
    }),
    
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, ...updates }) => ({
        url: `users/${id}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }]
    })
  })
});
```

## 总结

RTK Query 是现代 React 应用数据获取的强大解决方案：

1. **简化数据获取**：自动处理loading、error状态
2. **智能缓存**：基于标签的缓存失效系统
3. **乐观更新**：提升用户体验
4. **TypeScript支持**：完整的类型安全
5. **灵活配置**：支持各种自定义需求
6. **性能优化**：自动去重、缓存等优化

RTK Query 极大简化了 Redux 应用中的数据管理，是现代 React 开发的最佳选择。
