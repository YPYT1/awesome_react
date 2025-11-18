# 系统设计题 - 大型应用架构设计

## 1. Todo应用系统设计

### 1.1 需求分析

```typescript
const todoRequirements = {
  基础功能: [
    '添加todo',
    '删除todo',
    '标记完成',
    '编辑todo',
    '过滤(全部/活跃/已完成)'
  ],
  
  高级功能: [
    '优先级',
    '标签',
    '截止日期',
    '子任务',
    '搜索'
  ],
  
  技术要求: [
    '数据持久化',
    '性能优化',
    '类型安全',
    '测试覆盖'
  ]
};
```

### 1.2 架构设计

```typescript
// 状态管理
interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate?: Date;
  createdAt: Date;
}

// Zustand store
import create from 'zustand';
import { persist } from 'zustand/middleware';

const useTodoStore = create(
  persist(
    (set, get) => ({
      todos: [],
      filter: 'all',
      searchQuery: '',
      
      addTodo: (text, priority = 'medium') => set(state => ({
        todos: [
          ...state.todos,
          {
            id: nanoid(),
            text,
            completed: false,
            priority,
            tags: [],
            createdAt: new Date()
          }
        ]
      })),
      
      toggleTodo: (id) => set(state => ({
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      })),
      
      deleteTodo: (id) => set(state => ({
        todos: state.todos.filter(todo => todo.id !== id)
      })),
      
      updateTodo: (id, updates) => set(state => ({
        todos: state.todos.map(todo =>
          todo.id === id ? { ...todo, ...updates } : todo
        )
      })),
      
      setFilter: (filter) => set({ filter }),
      
      setSearchQuery: (query) => set({ searchQuery: query })
    }),
    {
      name: 'todo-storage',
      getStorage: () => localStorage
    }
  )
);

// 组件结构
function TodoApp() {
  return (
    <div className="app">
      <TodoHeader />
      <TodoFilters />
      <TodoList />
      <TodoStats />
    </div>
  );
}

const TodoList = React.memo(() => {
  const todos = useTodoStore(state => state.todos);
  const filter = useTodoStore(state => state.filter);
  const searchQuery = useTodoStore(state => state.searchQuery);
  
  const filteredTodos = useMemo(() => {
    let result = todos;
    
    // 过滤状态
    if (filter === 'active') {
      result = result.filter(t => !t.completed);
    } else if (filter === 'completed') {
      result = result.filter(t => t.completed);
    }
    
    // 搜索
    if (searchQuery) {
      result = result.filter(t =>
        t.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return result;
  }, [todos, filter, searchQuery]);
  
  return (
    <ul>
      {filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
});

const TodoItem = React.memo(({ todo }) => {
  const toggleTodo = useTodoStore(state => state.toggleTodo);
  const deleteTodo = useTodoStore(state => state.deleteTodo);
  const updateTodo = useTodoStore(state => state.updateTodo);
  
  return (
    <li className={todo.completed ? 'completed' : ''}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => toggleTodo(todo.id)}
      />
      <span>{todo.text}</span>
      <span className={`priority-${todo.priority}`}>{todo.priority}</span>
      <button onClick={() => deleteTodo(todo.id)}>Delete</button>
    </li>
  );
});
```

## 2. 聊天应用系统设计

### 2.1 需求分析

```typescript
const chatRequirements = {
  核心功能: [
    '发送消息',
    '接收消息',
    '消息历史',
    '在线状态',
    '输入提示'
  ],
  
  高级功能: [
    '多人聊天室',
    '私聊',
    '文件发送',
    '表情',
    '消息搜索',
    '已读未读'
  ],
  
  实时要求: [
    'WebSocket连接',
    '实时消息推送',
    '在线状态同步',
    '输入状态同步'
  ]
};
```

### 2.2 架构设计

```typescript
// WebSocket管理
class ChatService {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<Function>>();
  
  connect(url: string) {
    this.ws = new WebSocket(url);
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.emit(message.type, message.data);
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected');
      // 重连逻辑
      setTimeout(() => this.connect(url), 3000);
    };
  }
  
  send(type: string, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    }
  }
  
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
  
  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(cb => cb(data));
  }
}

// 状态管理
const useChatStore = create((set, get) => ({
  messages: [],
  onlineUsers: [],
  currentRoom: null,
  typing: new Set(),
  
  sendMessage: (text) => {
    const message = {
      id: nanoid(),
      text,
      userId: get().currentUser.id,
      timestamp: Date.now()
    };
    
    chatService.send('message', message);
    
    set(state => ({
      messages: [...state.messages, message]
    }));
  },
  
  receiveMessage: (message) => set(state => ({
    messages: [...state.messages, message]
  })),
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  setTyping: (userId, isTyping) => set(state => {
    const typing = new Set(state.typing);
    if (isTyping) {
      typing.add(userId);
    } else {
      typing.delete(userId);
    }
    return { typing };
  })
}));

// 组件结构
function ChatApp() {
  return (
    <div className="chat-app">
      <Sidebar />
      <ChatMain />
    </div>
  );
}

function ChatMain() {
  return (
    <div className="main">
      <MessageList />
      <TypingIndicator />
      <MessageInput />
    </div>
  );
}

const MessageList = React.memo(() => {
  const messages = useChatStore(state => state.messages);
  const bottomRef = useRef(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);
  
  return (
    <div className="messages">
      <VirtualList
        items={messages}
        itemHeight={60}
        renderItem={(msg) => <Message key={msg.id} message={msg} />}
      />
      <div ref={bottomRef} />
    </div>
  );
});
```

## 3. 后台管理系统设计

### 3.1 需求分析

```typescript
const adminRequirements = {
  功能模块: {
    用户管理: ['列表', '新增', '编辑', '删除', '权限'],
    内容管理: ['文章', '分类', '标签', '评论'],
    数据统计: ['Dashboard', '图表', '报表'],
    系统设置: ['配置', '日志', '备份']
  },
  
  权限系统: {
    角色: ['超级管理员', '管理员', '编辑', '访客'],
    权限: ['读', '写', '删除', '审核']
  },
  
  技术栈: [
    'React 19',
    'Redux Toolkit',
    'React Router',
    'Ant Design',
    'ECharts'
  ]
};
```

### 3.2 架构设计

```typescript
// 项目结构
const projectStructure = `
  admin/
  ├── src/
  │   ├── features/           # 功能模块
  │   │   ├── users/
  │   │   │   ├── UserList.tsx
  │   │   │   ├── UserForm.tsx
  │   │   │   ├── userSlice.ts
  │   │   │   └── userAPI.ts
  │   │   ├── posts/
  │   │   └── dashboard/
  │   ├── components/         # 共享组件
  │   │   ├── Table/
  │   │   ├── Form/
  │   │   └── Chart/
  │   ├── layouts/           # 布局
  │   │   ├── AdminLayout.tsx
  │   │   └── AuthLayout.tsx
  │   ├── routes/            # 路由
  │   ├── store/             # Redux store
  │   ├── utils/             # 工具函数
  │   └── App.tsx
  └── package.json
`;

// Redux store设计
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/users/userSlice';
import postReducer from './features/posts/postSlice';
import authReducer from './features/auth/authSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    posts: postReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// 用户管理slice
const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    }
  },
  reducers: {
    setUsers: (state, action) => {
      state.list = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

// 异步thunk
const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page, pageSize }) => {
    const response = await api.getUsers({ page, pageSize });
    return response.data;
  }
);
```

## 4. 面试要点

```typescript
const interviewPoints = {
  系统设计考察: [
    '需求分析能力',
    '架构设计能力',
    '技术选型能力',
    '性能优化意识',
    '可扩展性考虑'
  ],
  
  答题流程: [
    '1. 明确需求和功能',
    '2. 设计数据模型',
    '3. 规划组件结构',
    '4. 选择技术栈',
    '5. 考虑性能优化',
    '6. 讨论可扩展性'
  ]
};
```

## 4. 电商系统设计

### 4.1 需求分析

```typescript
const ecommerceRequirements = {
  功能模块: {
    首页: ['轮播图', '分类导航', '推荐商品', '热卖榜单'],
    商品: ['列表', '详情', '搜索', '筛选', '排序'],
    购物车: ['添加', '删除', '数量修改', '批量操作'],
    订单: ['创建', '支付', '查看', '取消'],
    用户: ['登录', '注册', '个人中心', '收货地址']
  },
  
  技术要求: {
    性能: ['虚拟滚动', '图片懒加载', '路由懒加载'],
    数据: ['本地缓存', 'API缓存', '乐观更新'],
    体验: ['骨架屏', '加载状态', '错误处理'],
    安全: ['Token认证', 'HTTPS', '输入校验']
  }
};
```

### 4.2 架构设计

```typescript
// 项目结构
const structure = `
  ecommerce/
  ├── src/
  │   ├── features/           # 功能模块
  │   │   ├── home/
  │   │   │   ├── HomePage.tsx
  │   │   │   ├── Carousel.tsx
  │   │   │   └── homeSlice.ts
  │   │   ├── products/
  │   │   │   ├── ProductList.tsx
  │   │   │   ├── ProductDetail.tsx
  │   │   │   ├── ProductFilter.tsx
  │   │   │   └── productSlice.ts
  │   │   ├── cart/
  │   │   │   ├── Cart.tsx
  │   │   │   ├── CartItem.tsx
  │   │   │   └── cartSlice.ts
  │   │   ├── order/
  │   │   │   ├── OrderList.tsx
  │   │   │   ├── OrderDetail.tsx
  │   │   │   └── orderSlice.ts
  │   │   └── user/
  │   │       ├── Login.tsx
  │   │       ├── Register.tsx
  │   │       ├── Profile.tsx
  │   │       └── userSlice.ts
  │   ├── components/         # 共享组件
  │   │   ├── ProductCard/
  │   │   ├── ImageLazy/
  │   │   └── Pagination/
  │   ├── hooks/              # 自定义Hooks
  │   ├── store/              # Redux Store
  │   ├── api/                # API封装
  │   └── utils/              # 工具函数
  └── package.json
`;

// Redux Store设计
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { productsApi } from './api/productsApi';
import cartReducer from './features/cart/cartSlice';
import userReducer from './features/user/userSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    [productsApi.reducerPath]: productsApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware)
});

setupListeners(store.dispatch);
```

### 4.3 商品列表实现

```tsx
// RTK Query API定义
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page = 1, category, sort }) => ({
        url: '/products',
        params: { page, category, sort }
      }),
      providesTags: ['Product']
    }),
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),
    searchProducts: builder.query({
      query: (keyword) => `/products/search?q=${keyword}`
    })
  })
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useSearchProductsQuery
} = productsApi;

// 商品列表组件
function ProductList() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('default');
  
  const { data, isLoading, isFetching, error } = useGetProductsQuery({
    page,
    category,
    sort
  });
  
  if (isLoading) return <ProductSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="product-list">
      <ProductFilter
        category={category}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
      />
      
      <div className="products-grid">
        {data.products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {isFetching && <LoadingOverlay />}
      
      <Pagination
        current={page}
        total={data.totalPages}
        onChange={setPage}
      />
    </div>
  );
}

// 商品卡片组件
const ProductCard = React.memo(({ product }) => {
  const dispatch = useDispatch();
  
  const handleAddToCart = () => {
    dispatch(addToCart(product));
  };
  
  return (
    <div className="product-card">
      <LazyImage src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">¥{product.price}</p>
      <button onClick={handleAddToCart}>加入购物车</button>
    </div>
  );
});
```

### 4.4 购物车实现

```tsx
// Cart Slice
import { createSlice } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [] as CartItem[],
    total: 0
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find(i => i.id === item.id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
      
      state.total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    },
    
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload);
      state.total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(i => i.id === id);
      
      if (item) {
        item.quantity = quantity;
        state.total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// 购物车组件
function Cart() {
  const { items, total } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <p>购物车是空的</p>
        <Link to="/products">去购物</Link>
      </div>
    );
  }
  
  return (
    <div className="cart">
      <h2>购物车</h2>
      
      <div className="cart-items">
        {items.map(item => (
          <CartItem
            key={item.id}
            item={item}
            onUpdateQuantity={(quantity) => 
              dispatch(updateQuantity({ id: item.id, quantity }))
            }
            onRemove={() => dispatch(removeFromCart(item.id))}
          />
        ))}
      </div>
      
      <div className="cart-summary">
        <div className="total">
          <span>总计:</span>
          <span className="amount">¥{total.toFixed(2)}</span>
        </div>
        <button className="checkout-btn" onClick={handleCheckout}>
          结算
        </button>
      </div>
    </div>
  );
}

// 购物车项组件
function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="cart-item">
      <img src={item.image} alt={item.name} />
      
      <div className="item-info">
        <h4>{item.name}</h4>
        <p className="price">¥{item.price}</p>
      </div>
      
      <div className="quantity-control">
        <button
          onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
        >
          -
        </button>
        <span>{item.quantity}</span>
        <button onClick={() => onUpdateQuantity(item.quantity + 1)}>
          +
        </button>
      </div>
      
      <button className="remove-btn" onClick={onRemove}>
        删除
      </button>
    </div>
  );
}
```

## 5. 社交媒体Feed系统

### 5.1 需求分析

```typescript
const socialFeedRequirements = {
  核心功能: [
    '无限滚动Feed流',
    '发布动态(文字/图片)',
    '点赞/评论',
    '关注/取消关注',
    '实时更新'
  ],
  
  性能要求: [
    '虚拟滚动(万级数据)',
    '图片懒加载',
    '乐观更新',
    '智能缓存'
  ],
  
  技术栈: [
    'React 19',
    'React Query',
    'WebSocket',
    'Virtual List'
  ]
};
```

### 5.2 Feed流实现

```tsx
// API层
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 获取Feed
function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => fetchFeed(pageParam),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length + 1 : undefined,
    staleTime: 1000 * 60 * 5, // 5分钟
    cacheTime: 1000 * 60 * 30 // 30分钟
  });
}

// 发布动态
function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (post) => createPost(post),
    onMutate: async (newPost) => {
      // 乐观更新
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousFeed = queryClient.getQueryData(['feed']);
      
      queryClient.setQueryData(['feed'], (old) => {
        const optimisticPost = {
          ...newPost,
          id: `temp-${Date.now()}`,
          createdAt: new Date(),
          likes: 0,
          comments: []
        };
        
        return {
          ...old,
          pages: [
            { posts: [optimisticPost, ...old.pages[0].posts], hasMore: true },
            ...old.pages.slice(1)
          ]
        };
      });
      
      return { previousFeed };
    },
    onError: (err, newPost, context) => {
      // 回滚
      queryClient.setQueryData(['feed'], context.previousFeed);
    },
    onSettled: () => {
      // 重新获取
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });
}

// Feed组件
function FeedList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useFeed();
  
  const observerRef = useRef();
  const lastPostRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );
  
  if (isLoading) return <FeedSkeleton />;
  
  const allPosts = data.pages.flatMap(page => page.posts);
  
  return (
    <div className="feed">
      <PostComposer />
      
      <div className="posts">
        {allPosts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            ref={index === allPosts.length - 1 ? lastPostRef : null}
          />
        ))}
      </div>
      
      {isFetchingNextPage && <LoadingSpinner />}
    </div>
  );
}

// 发布组件
function PostComposer() {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const createPost = useCreatePost();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    await createPost.mutateAsync({
      content,
      images
    });
    
    setContent('');
    setImages([]);
  };
  
  return (
    <form className="post-composer" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="分享新鲜事..."
        rows={4}
      />
      
      <ImageUploader
        images={images}
        onChange={setImages}
        maxImages={9}
      />
      
      <button
        type="submit"
        disabled={!content.trim() || createPost.isLoading}
      >
        {createPost.isLoading ? '发布中...' : '发布'}
      </button>
    </form>
  );
}

// 动态卡片
const PostCard = React.memo(forwardRef(({ post }, ref) => {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  
  const handleLike = async () => {
    // 乐观更新
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    
    try {
      await toggleLike(post.id);
    } catch (error) {
      // 回滚
      setLiked(liked);
      setLikeCount(likeCount);
    }
  };
  
  return (
    <div className="post-card" ref={ref}>
      <div className="post-header">
        <Avatar src={post.author.avatar} />
        <div>
          <h4>{post.author.name}</h4>
          <time>{formatTime(post.createdAt)}</time>
        </div>
      </div>
      
      <div className="post-content">
        <p>{post.content}</p>
        {post.images.length > 0 && (
          <ImageGrid images={post.images} />
        )}
      </div>
      
      <div className="post-actions">
        <button
          className={liked ? 'liked' : ''}
          onClick={handleLike}
        >
          ❤️ {likeCount}
        </button>
        <button>💬 {post.comments.length}</button>
        <button>🔄 分享</button>
      </div>
      
      <CommentList postId={post.id} />
    </div>
  );
}));
```

## 6. 实时协作编辑器

### 6.1 需求分析

```typescript
const collaborativeEditorRequirements = {
  核心功能: [
    '多人实时编辑',
    '光标位置同步',
    '在线用户列表',
    '版本历史',
    '冲突解决'
  ],
  
  技术难点: [
    'OT/CRDT算法',
    'WebSocket连接管理',
    '离线编辑',
    '性能优化'
  ],
  
  技术方案: [
    'Yjs (CRDT库)',
    'Socket.io',
    'CodeMirror/Monaco',
    'React'
  ]
};
```

### 6.2 编辑器实现

```tsx
// 使用Yjs实现协作编辑
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useEffect, useRef, useState } from 'react';

// 协作编辑Hook
function useCollaborativeEditor(documentId: string) {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [synced, setSynced] = useState(false);
  
  useEffect(() => {
    // 创建WebSocket Provider
    const wsProvider = new WebsocketProvider(
      'ws://localhost:1234',
      documentId,
      doc
    );
    
    wsProvider.on('status', event => {
      setSynced(event.status === 'connected');
    });
    
    wsProvider.awareness.on('change', () => {
      const states = Array.from(wsProvider.awareness.getStates().values());
      setUsers(states.map(state => state.user));
    });
    
    setProvider(wsProvider);
    
    return () => {
      wsProvider.destroy();
    };
  }, [documentId, doc]);
  
  return { doc, provider, users, synced };
}

// 编辑器组件
function CollaborativeEditor({ documentId }) {
  const { doc, provider, users, synced } = useCollaborativeEditor(documentId);
  const editorRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!editorRef.current) return;
    
    const yText = doc.getText('content');
    
    // 监听文本变化
    const observer = () => {
      const content = yText.toString();
      if (editorRef.current) {
        editorRef.current.textContent = content;
      }
    };
    
    yText.observe(observer);
    
    return () => {
      yText.unobserve(observer);
    };
  }, [doc]);
  
  const handleInput = (e) => {
    const yText = doc.getText('content');
    const newContent = e.currentTarget.textContent;
    
    // 更新Yjs文档
    yText.delete(0, yText.length);
    yText.insert(0, newContent);
  };
  
  return (
    <div className="collaborative-editor">
      <div className="editor-header">
        <div className="sync-status">
          {synced ? '✓ 已同步' : '同步中...'}
        </div>
        
        <OnlineUsers users={users} />
      </div>
      
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
      />
    </div>
  );
}

// 在线用户组件
function OnlineUsers({ users }) {
  return (
    <div className="online-users">
      <span>在线: {users.length}</span>
      <div className="user-avatars">
        {users.map(user => (
          <Avatar
            key={user.id}
            src={user.avatar}
            name={user.name}
            color={user.color}
          />
        ))}
      </div>
    </div>
  );
}
```

## 7. 视频会议应用

### 7.1 需求分析

```typescript
const videoConferenceRequirements = {
  核心功能: [
    '音视频通话',
    '屏幕共享',
    '聊天',
    '举手',
    '静音控制'
  ],
  
  技术栈: [
    'WebRTC',
    'Socket.io',
    'React',
    'MediaStream API'
  ],
  
  挑战: [
    'P2P连接建立',
    '多人混流',
    '网络质量适配',
    '设备权限管理'
  ]
};
```

### 7.2 WebRTC实现

```tsx
// WebRTC Hook
function useWebRTC(roomId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [peers, setPeers] = useState<Map<string, RTCPeerConnection>>(new Map());
  const socketRef = useRef<Socket>();
  
  useEffect(() => {
    // 获取本地媒体流
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      setLocalStream(stream);
    });
    
    // 连接信令服务器
    socketRef.current = io('ws://localhost:3000');
    
    socketRef.current.emit('join-room', roomId);
    
    socketRef.current.on('user-connected', async (userId) => {
      const peerConnection = createPeerConnection(userId);
      setPeers(prev => new Map(prev).set(userId, peerConnection));
      
      // 创建offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      socketRef.current?.emit('offer', { to: userId, offer });
    });
    
    socketRef.current.on('offer', async ({ from, offer }) => {
      const peerConnection = createPeerConnection(from);
      setPeers(prev => new Map(prev).set(from, peerConnection));
      
      await peerConnection.setRemoteDescription(offer);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      socketRef.current?.emit('answer', { to: from, answer });
    });
    
    socketRef.current.on('answer', async ({ from, answer }) => {
      const peerConnection = peers.get(from);
      await peerConnection?.setRemoteDescription(answer);
    });
    
    socketRef.current.on('ice-candidate', async ({ from, candidate }) => {
      const peerConnection = peers.get(from);
      await peerConnection?.addIceCandidate(candidate);
    });
    
    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      peers.forEach(peer => peer.close());
      socketRef.current?.disconnect();
    };
  }, [roomId]);
  
  const createPeerConnection = (userId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    // 添加本地流
    localStream?.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });
    
    // 接收远程流
    peerConnection.ontrack = (event) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set(userId, event.streams[0]);
        return newMap;
      });
    };
    
    // ICE候选
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          to: userId,
          candidate: event.candidate
        });
      }
    };
    
    return peerConnection;
  };
  
  const toggleAudio = () => {
    localStream?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
  };
  
  const toggleVideo = () => {
    localStream?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
  };
  
  const shareScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true
    });
    
    const screenTrack = screenStream.getVideoTracks()[0];
    
    peers.forEach(peer => {
      const sender = peer.getSenders().find(s => s.track?.kind === 'video');
      sender?.replaceTrack(screenTrack);
    });
  };
  
  return {
    localStream,
    remoteStreams,
    toggleAudio,
    toggleVideo,
    shareScreen
  };
}

// 视频会议组件
function VideoConference({ roomId }) {
  const {
    localStream,
    remoteStreams,
    toggleAudio,
    toggleVideo,
    shareScreen
  } = useWebRTC(roomId);
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  
  const handleToggleAudio = () => {
    toggleAudio();
    setAudioEnabled(!audioEnabled);
  };
  
  const handleToggleVideo = () => {
    toggleVideo();
    setVideoEnabled(!videoEnabled);
  };
  
  return (
    <div className="video-conference">
      <div className="video-grid">
        {/* 本地视频 */}
        <VideoPlayer stream={localStream} muted label="You" />
        
        {/* 远程视频 */}
        {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
          <VideoPlayer key={userId} stream={stream} label={userId} />
        ))}
      </div>
      
      <div className="controls">
        <button
          className={audioEnabled ? '' : 'disabled'}
          onClick={handleToggleAudio}
        >
          {audioEnabled ? '🎤' : '🔇'}
        </button>
        
        <button
          className={videoEnabled ? '' : 'disabled'}
          onClick={handleToggleVideo}
        >
          {videoEnabled ? '📹' : '📵'}
        </button>
        
        <button onClick={shareScreen}>
          📺 共享屏幕
        </button>
        
        <button className="hang-up">
          📞 挂断
        </button>
      </div>
    </div>
  );
}

// 视频播放器组件
function VideoPlayer({ stream, muted = false, label }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  return (
    <div className="video-player">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
      />
      <div className="video-label">{label}</div>
    </div>
  );
}
```

## 8. 面试评分标准

### 8.1 评分维度

```typescript
const evaluationCriteria = {
  需求理解: {
    权重: '20%',
    考察点: [
      '是否全面理解需求',
      '是否识别隐含需求',
      '是否提出合理问题'
    ]
  },
  
  架构设计: {
    权重: '30%',
    考察点: [
      '模块划分是否合理',
      '技术选型是否恰当',
      '可扩展性考虑',
      '性能优化方案'
    ]
  },
  
  代码实现: {
    权重: '30%',
    考察点: [
      '代码质量',
      '最佳实践',
      '错误处理',
      '边界情况'
    ]
  },
  
  沟通表达: {
    权重: '20%',
    考察点: [
      '思路清晰',
      '逻辑严谨',
      '主动沟通',
      '接受反馈'
    ]
  }
};
```

### 8.2 答题策略

```typescript
const answerStrategy = {
  第一步_需求澄清: `
    主动提问:
    - 用户规模?
    - 数据量级?
    - 性能要求?
    - 平台支持?
  `,
  
  第二步_设计思路: `
    1. 绘制架构图
    2. 说明模块职责
    3. 数据流向
    4. 关键技术点
  `,
  
  第三步_核心实现: `
    选择最有挑战的模块:
    - 详细讲解实现
    - 突出技术难点
    - 展示优化方案
  `,
  
  第四步_扩展讨论: `
    - 可能遇到的问题
    - 解决方案
    - 未来优化方向
  `
};
```

## 9. 面试技巧总结

### 9.1 时间分配

```typescript
const timeAllocation = {
  '60分钟系统设计': {
    '5-10分钟': '需求澄清',
    '15-20分钟': '架构设计',
    '20-25分钟': '核心实现',
    '10-15分钟': '扩展讨论'
  },
  
  建议: [
    '不要急于编码',
    '充分思考后再动手',
    '预留测试和优化时间',
    '保持与面试官沟通'
  ]
};
```

### 9.2 常见陷阱

```typescript
const commonPitfalls = {
  陷阱1: {
    描述: '直接开始写代码',
    正确做法: '先设计架构,再实现细节'
  },
  
  陷阱2: {
    描述: '过度设计',
    正确做法: '从简单开始,逐步完善'
  },
  
  陷阱3: {
    描述: '忽略性能',
    正确做法: '主动提出性能优化方案'
  },
  
  陷阱4: {
    描述: '不考虑边界情况',
    正确做法: '全面考虑异常和边界'
  }
};
```

## 10. 总结

系统设计题的核心要点:

1. **需求分析**: 明确功能和技术要求,主动澄清
2. **架构设计**: 合理的项目结构,清晰的模块划分
3. **状态管理**: 选择合适方案(Redux/Zustand/React Query)
4. **性能优化**: 虚拟滚动、懒加载、缓存策略
5. **实时功能**: WebSocket、WebRTC实现
6. **可扩展性**: 模块化、可维护、可测试
7. **用户体验**: 加载状态、错误处理、骨架屏
8. **安全性**: 认证授权、输入校验、XSS防护

系统设计题不仅考察技术能力,更看重思维方式和问题解决能力。

