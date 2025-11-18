# Recoil选择器

## 概述

Selector是Recoil中用于计算派生状态的核心概念。它们允许你基于atoms或其他selectors计算新的状态，支持异步操作，并且会自动缓存结果以提高性能。本文深入探讨Recoil selectors的各种用法和高级特性。

## Selector基础

### 基础概念

Selector是纯函数，用于根据依赖的atoms或其他selectors计算派生状态：

```jsx
import { atom, selector, useRecoilValue } from 'recoil';

// 基础atoms
const temperatureAtom = atom({
  key: 'temperature',
  default: 0
});

const unitAtom = atom({
  key: 'unit',
  default: 'celsius' // 'celsius' | 'fahrenheit'
});

// 派生selector
const displayTemperatureSelector = selector({
  key: 'displayTemperature',
  get: ({get}) => {
    const temp = get(temperatureAtom);
    const unit = get(unitAtom);
    
    if (unit === 'fahrenheit') {
      return (temp * 9/5) + 32;
    }
    
    return temp;
  }
});

// 使用
function TemperatureDisplay() {
  const displayTemp = useRecoilValue(displayTemperatureSelector);
  const unit = useRecoilValue(unitAtom);
  
  return (
    <div>
      Temperature: {displayTemp.toFixed(1)}°{unit === 'celsius' ? 'C' : 'F'}
    </div>
  );
}
```

### 只读Selector

```jsx
const todosAtom = atom({
  key: 'todos',
  default: []
});

const filterAtom = atom({
  key: 'todoFilter',
  default: 'all'
});

// 过滤todos的selector
const filteredTodosSelector = selector({
  key: 'filteredTodos',
  get: ({get}) => {
    const todos = get(todosAtom);
    const filter = get(filterAtom);
    
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'active':
        return todos.filter(todo => !todo.completed);
      default:
        return todos;
    }
  }
});

// 统计selector
const todoStatsSelector = selector({
  key: 'todoStats',
  get: ({get}) => {
    const todos = get(todosAtom);
    
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length,
      completionRate: todos.length > 0 
        ? (todos.filter(t => t.completed).length / todos.length) * 100 
        : 0
    };
  }
});

// 使用
function TodoStats() {
  const stats = useRecoilValue(todoStatsSelector);
  
  return (
    <div>
      <p>Total: {stats.total}</p>
      <p>Completed: {stats.completed}</p>
      <p>Active: {stats.active}</p>
      <p>Completion Rate: {stats.completionRate.toFixed(1)}%</p>
    </div>
  );
}
```

### 可写Selector

```jsx
// 可读可写的selector
const fahrenheitSelector = selector({
  key: 'fahrenheit',
  get: ({get}) => {
    const celsius = get(temperatureAtom);
    return (celsius * 9/5) + 32;
  },
  set: ({set}, newValue) => {
    const celsius = (newValue - 32) * 5/9;
    set(temperatureAtom, celsius);
  }
});

// 使用可写selector
function TemperatureControl() {
  const [celsius, setCelsius] = useRecoilState(temperatureAtom);
  const [fahrenheit, setFahrenheit] = useRecoilState(fahrenheitSelector);
  
  return (
    <div>
      <div>
        <label>Celsius:</label>
        <input
          type="number"
          value={celsius}
          onChange={(e) => setCelsius(Number(e.target.value))}
        />
      </div>
      
      <div>
        <label>Fahrenheit:</label>
        <input
          type="number"
          value={fahrenheit}
          onChange={(e) => setFahrenheit(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

// 复杂可写selector
const userFullNameSelector = selector({
  key: 'userFullName',
  get: ({get}) => {
    const user = get(userAtom);
    return user ? `${user.firstName} ${user.lastName}` : '';
  },
  set: ({set}, newValue) => {
    const [firstName, ...lastNameParts] = newValue.split(' ');
    const lastName = lastNameParts.join(' ');
    
    set(userAtom, (prevUser) => ({
      ...prevUser,
      firstName: firstName || '',
      lastName: lastName || ''
    }));
  }
});
```

## 异步Selector

### 基础异步Selector

```jsx
const userIdAtom = atom({
  key: 'userId',
  default: 1
});

// 异步获取用户数据
const userSelector = selector({
  key: 'user',
  get: async ({get}) => {
    const userId = get(userIdAtom);
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  }
});

// 使用Suspense
function UserProfile() {
  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfileContent />
    </Suspense>
  );
}

function UserProfileContent() {
  const user = useRecoilValue(userSelector);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// 错误边界
import { ErrorBoundary } from 'react-error-boundary';

function UserWithErrorBoundary() {
  return (
    <ErrorBoundary 
      fallback={<div>Something went wrong loading user data</div>}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <UserProfileContent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 依赖链式异步Selector

```jsx
// 用户atom
const currentUserIdAtom = atom({
  key: 'currentUserId',
  default: 1
});

// 获取用户信息
const currentUserSelector = selector({
  key: 'currentUser',
  get: async ({get}) => {
    const userId = get(currentUserIdAtom);
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
});

// 基于用户获取其帖子
const userPostsSelector = selector({
  key: 'userPosts',
  get: async ({get}) => {
    const user = await get(currentUserSelector);
    const response = await fetch(`/api/users/${user.id}/posts`);
    return response.json();
  }
});

// 基于帖子获取评论
const postsWithCommentsSelector = selector({
  key: 'postsWithComments',
  get: async ({get}) => {
    const posts = await get(userPostsSelector);
    
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentsResponse = await fetch(`/api/posts/${post.id}/comments`);
        const comments = await commentsResponse.json();
        return { ...post, comments };
      })
    );
    
    return postsWithComments;
  }
});

// 使用
function UserDashboard() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <UserInfo />
      <UserPosts />
    </Suspense>
  );
}

function UserInfo() {
  const user = useRecoilValue(currentUserSelector);
  return <h1>Welcome, {user.name}!</h1>;
}

function UserPosts() {
  const posts = useRecoilValue(postsWithCommentsSelector);
  
  return (
    <div>
      <h2>Your Posts</h2>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.comments.length} comments</p>
        </div>
      ))}
    </div>
  );
}
```

### 并发异步Selector

```jsx
// 并行获取多个数据源
const dashboardDataSelector = selector({
  key: 'dashboardData',
  get: async ({get}) => {
    const userId = get(currentUserIdAtom);
    
    // 并行请求
    const [userProfile, userPosts, userAnalytics] = await Promise.all([
      fetch(`/api/users/${userId}`).then(r => r.json()),
      fetch(`/api/users/${userId}/posts`).then(r => r.json()),
      fetch(`/api/users/${userId}/analytics`).then(r => r.json())
    ]);
    
    return {
      profile: userProfile,
      posts: userPosts,
      analytics: userAnalytics,
      lastUpdated: new Date().toISOString()
    };
  }
});

// 条件异步Selector
const conditionalDataSelector = selector({
  key: 'conditionalData',
  get: async ({get}) => {
    const user = await get(currentUserSelector);
    
    // 根据用户角色获取不同数据
    if (user.role === 'admin') {
      const response = await fetch('/api/admin/dashboard');
      return response.json();
    } else {
      const response = await fetch(`/api/users/${user.id}/dashboard`);
      return response.json();
    }
  }
});
```

## Selector Family

Selector Family用于创建参数化的selectors：

```jsx
import { selectorFamily } from 'recoil';

// 基础Selector Family
const userSelectorFamily = selectorFamily({
  key: 'userById',
  get: (userId) => async ({get}) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
});

// 使用
function UserProfile({ userId }) {
  const user = useRecoilValue(userSelectorFamily(userId));
  return <div>{user.name}</div>;
}

// 带缓存的Selector Family
const cachedUserFamily = selectorFamily({
  key: 'cachedUser',
  get: (userId) => async ({get}) => {
    // 检查缓存
    const cache = get(userCacheAtom);
    const cached = cache[userId];
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5分钟缓存
      return cached.data;
    }
    
    // 从服务器获取
    const response = await fetch(`/api/users/${userId}`);
    const userData = await response.json();
    
    // 更新缓存
    set(userCacheAtom, prev => ({
      ...prev,
      [userId]: {
        data: userData,
        timestamp: Date.now()
      }
    }));
    
    return userData;
  }
});

// 可写Selector Family
const userFieldFamily = selectorFamily({
  key: 'userField',
  get: ({userId, field}) => ({get}) => {
    const user = get(userAtomFamily(userId));
    return user[field];
  },
  set: ({userId, field}) => ({set}, newValue) => {
    set(userAtomFamily(userId), (prevUser) => ({
      ...prevUser,
      [field]: newValue,
      updatedAt: new Date().toISOString()
    }));
  }
});

// 使用可写Selector Family
function UserField({ userId, field, label }) {
  const [value, setValue] = useRecoilState(
    userFieldFamily({userId, field})
  );
  
  return (
    <div>
      <label>{label}:</label>
      <input
        value={value || ''}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

// 复杂参数Selector Family
const searchResultsFamily = selectorFamily({
  key: 'searchResults',
  get: ({query, filters, page}) => async ({get}) => {
    if (!query) return { results: [], totalCount: 0 };
    
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      ...filters
    });
    
    const response = await fetch(`/api/search?${params}`);
    return response.json();
  }
});
```

## 实战案例

### 案例1：数据分析Dashboard

```jsx
import { atom, selector, selectorFamily } from 'recoil';

// 基础数据atoms
const rawDataAtom = atom({
  key: 'rawData',
  default: []
});

const dateRangeAtom = atom({
  key: 'dateRange',
  default: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
    end: new Date()
  }
});

const metricsConfigAtom = atom({
  key: 'metricsConfig',
  default: {
    groupBy: 'day', // 'day' | 'week' | 'month'
    metrics: ['views', 'clicks', 'conversions']
  }
});

// 过滤数据selector
const filteredDataSelector = selector({
  key: 'filteredData',
  get: ({get}) => {
    const rawData = get(rawDataAtom);
    const dateRange = get(dateRangeAtom);
    
    return rawData.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= dateRange.start && itemDate <= dateRange.end;
    });
  }
});

// 分组数据selector
const groupedDataSelector = selector({
  key: 'groupedData',
  get: ({get}) => {
    const data = get(filteredDataSelector);
    const config = get(metricsConfigAtom);
    
    const groups = {};
    
    data.forEach(item => {
      const date = new Date(item.timestamp);
      let groupKey;
      
      switch (config.groupBy) {
        case 'week':
          // 获取周的开始日期
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          groupKey = startOfWeek.toISOString().split('T')[0];
          break;
        case 'month':
          groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default: // day
          groupKey = date.toISOString().split('T')[0];
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });
    
    return groups;
  }
});

// 聚合指标selector
const metricsSelector = selector({
  key: 'metrics',
  get: ({get}) => {
    const groupedData = get(groupedDataSelector);
    const config = get(metricsConfigAtom);
    
    const metrics = {};
    
    Object.entries(groupedData).forEach(([date, items]) => {
      metrics[date] = {};
      
      config.metrics.forEach(metric => {
        switch (metric) {
          case 'views':
            metrics[date].views = items.reduce((sum, item) => sum + item.views, 0);
            break;
          case 'clicks':
            metrics[date].clicks = items.reduce((sum, item) => sum + item.clicks, 0);
            break;
          case 'conversions':
            metrics[date].conversions = items.reduce((sum, item) => sum + item.conversions, 0);
            break;
        }
      });
      
      // 计算派生指标
      if (metrics[date].views && metrics[date].clicks) {
        metrics[date].ctr = (metrics[date].clicks / metrics[date].views) * 100;
      }
      
      if (metrics[date].clicks && metrics[date].conversions) {
        metrics[date].conversionRate = (metrics[date].conversions / metrics[date].clicks) * 100;
      }
    });
    
    return metrics;
  }
});

// 图表数据selector
const chartDataSelector = selector({
  key: 'chartData',
  get: ({get}) => {
    const metrics = get(metricsSelector);
    const config = get(metricsConfigAtom);
    
    const dates = Object.keys(metrics).sort();
    const datasets = {};
    
    config.metrics.forEach(metric => {
      datasets[metric] = dates.map(date => ({
        x: date,
        y: metrics[date][metric] || 0
      }));
    });
    
    return {
      dates,
      datasets
    };
  }
});

// 摘要统计selector
const summaryStatsSelector = selector({
  key: 'summaryStats',
  get: ({get}) => {
    const metrics = get(metricsSelector);
    const dates = Object.keys(metrics);
    
    if (dates.length === 0) {
      return {
        totalViews: 0,
        totalClicks: 0,
        totalConversions: 0,
        averageCTR: 0,
        averageConversionRate: 0
      };
    }
    
    const totals = dates.reduce((acc, date) => {
      const dayMetrics = metrics[date];
      return {
        views: acc.views + (dayMetrics.views || 0),
        clicks: acc.clicks + (dayMetrics.clicks || 0),
        conversions: acc.conversions + (dayMetrics.conversions || 0)
      };
    }, { views: 0, clicks: 0, conversions: 0 });
    
    return {
      totalViews: totals.views,
      totalClicks: totals.clicks,
      totalConversions: totals.conversions,
      averageCTR: totals.views > 0 ? (totals.clicks / totals.views) * 100 : 0,
      averageConversionRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0
    };
  }
});

// Dashboard组件
function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useRecoilState(dateRangeAtom);
  const [config, setConfig] = useRecoilState(metricsConfigAtom);
  const summaryStats = useRecoilValue(summaryStatsSelector);
  const chartData = useRecoilValue(chartDataSelector);

  return (
    <div className="analytics-dashboard">
      <div className="controls">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
        
        <select
          value={config.groupBy}
          onChange={(e) => setConfig(prev => ({ ...prev, groupBy: e.target.value }))}
        >
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>

      <div className="summary-stats">
        <div className="stat-card">
          <h3>Total Views</h3>
          <p>{summaryStats.totalViews.toLocaleString()}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Clicks</h3>
          <p>{summaryStats.totalClicks.toLocaleString()}</p>
        </div>
        
        <div className="stat-card">
          <h3>Average CTR</h3>
          <p>{summaryStats.averageCTR.toFixed(2)}%</p>
        </div>
        
        <div className="stat-card">
          <h3>Average Conversion Rate</h3>
          <p>{summaryStats.averageConversionRate.toFixed(2)}%</p>
        </div>
      </div>

      <div className="charts">
        <MetricsChart data={chartData} />
      </div>
    </div>
  );
}
```

### 案例2：实时搜索系统

```jsx
import { atom, selector, selectorFamily, atomFamily } from 'recoil';

// 搜索查询atom
const searchQueryAtom = atom({
  key: 'searchQuery',
  default: ''
});

// 搜索过滤器atom
const searchFiltersAtom = atom({
  key: 'searchFilters',
  default: {
    category: '',
    priceRange: [0, 1000],
    inStock: false,
    rating: 0
  }
});

// 搜索结果缓存atom family
const searchCacheFamily = atomFamily({
  key: 'searchCache',
  default: null
});

// 防抖搜索selector
const debouncedSearchQuerySelector = selector({
  key: 'debouncedSearchQuery',
  get: ({get}) => {
    const query = get(searchQueryAtom);
    
    // 这里可以配合useRecoilValueLoadable实现防抖
    return query;
  }
});

// 搜索结果selector family
const searchResultsFamily = selectorFamily({
  key: 'searchResults',
  get: ({query, filters}) => async ({get}) => {
    if (!query.trim()) {
      return { results: [], totalCount: 0, facets: {} };
    }
    
    // 构建缓存key
    const cacheKey = JSON.stringify({ query, filters });
    
    // 检查缓存
    const cached = get(searchCacheFamily(cacheKey));
    if (cached && Date.now() - cached.timestamp < 60000) { // 1分钟缓存
      return cached.data;
    }
    
    // 构建查询参数
    const params = new URLSearchParams({
      q: query,
      category: filters.category,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      inStock: filters.inStock,
      minRating: filters.rating
    });
    
    const response = await fetch(`/api/search?${params}`);
    const results = await response.json();
    
    // 缓存结果
    set(searchCacheFamily(cacheKey), {
      data: results,
      timestamp: Date.now()
    });
    
    return results;
  }
});

// 搜索建议selector
const searchSuggestionsSelector = selector({
  key: 'searchSuggestions',
  get: async ({get}) => {
    const query = get(searchQueryAtom);
    
    if (query.length < 2) {
      return [];
    }
    
    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
    return response.json();
  }
});

// 热门搜索selector
const popularSearchesSelector = selector({
  key: 'popularSearches',
  get: async () => {
    const response = await fetch('/api/search/popular');
    return response.json();
  }
});

// 搜索历史atom（持久化）
const searchHistoryAtom = atom({
  key: 'searchHistory',
  default: [],
  effects: [
    ({setSelf, onSet}) => {
      // 从localStorage加载
      const saved = localStorage.getItem('searchHistory');
      if (saved) {
        setSelf(JSON.parse(saved));
      }

      // 保存到localStorage
      onSet(newValue => {
        localStorage.setItem('searchHistory', JSON.stringify(newValue));
      });
    }
  ]
});

// 组件
function SearchInterface() {
  const [query, setQuery] = useRecoilState(searchQueryAtom);
  const [filters, setFilters] = useRecoilState(searchFiltersAtom);
  const [searchHistory, setSearchHistory] = useRecoilState(searchHistoryAtom);
  
  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    
    // 添加到搜索历史
    if (searchQuery.trim()) {
      setSearchHistory(prev => {
        const filtered = prev.filter(item => item !== searchQuery);
        return [searchQuery, ...filtered].slice(0, 10); // 保留最近10个
      });
    }
  };

  return (
    <div className="search-interface">
      <SearchBox
        query={query}
        onSearch={handleSearch}
      />
      
      <SearchFilters
        filters={filters}
        onChange={setFilters}
      />
      
      <Suspense fallback={<div>Searching...</div>}>
        <SearchResults query={query} filters={filters} />
      </Suspense>
      
      <SearchSidebar history={searchHistory} />
    </div>
  );
}

function SearchResults({ query, filters }) {
  const results = useRecoilValue(searchResultsFamily({query, filters}));
  
  return (
    <div className="search-results">
      <div className="results-header">
        <h2>{results.totalCount} results for "{query}"</h2>
      </div>
      
      <div className="results-list">
        {results.results.map(item => (
          <SearchResultItem key={item.id} item={item} />
        ))}
      </div>
      
      <SearchFacets facets={results.facets} />
    </div>
  );
}

function SearchBox({ query, onSearch }) {
  const suggestions = useRecoilValueLoadable(searchSuggestionsSelector);
  const popularSearches = useRecoilValue(popularSearchesSelector);
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="search-box">
      <input
        type="text"
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder="Search products..."
      />
      
      {showSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.state === 'hasValue' && suggestions.contents.length > 0 && (
            <div className="suggestions-section">
              <h4>Suggestions</h4>
              {suggestions.contents.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion"
                  onClick={() => onSearch(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
          
          {popularSearches.length > 0 && (
            <div className="popular-section">
              <h4>Popular Searches</h4>
              {popularSearches.map((search, index) => (
                <div
                  key={index}
                  className="popular-search"
                  onClick={() => onSearch(search)}
                >
                  {search}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 案例3：表单验证系统

```jsx
// 表单字段atoms
const formFieldsAtom = atom({
  key: 'formFields',
  default: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  }
});

// 单个字段selector family
const fieldSelectorFamily = selectorFamily({
  key: 'formField',
  get: (fieldName) => ({get}) => {
    const fields = get(formFieldsAtom);
    return fields[fieldName];
  },
  set: (fieldName) => ({set}, newValue) => {
    set(formFieldsAtom, prev => ({
      ...prev,
      [fieldName]: newValue
    }));
  }
});

// 字段验证selector family
const fieldValidationFamily = selectorFamily({
  key: 'fieldValidation',
  get: (fieldName) => ({get}) => {
    const value = get(fieldSelectorFamily(fieldName));
    const allFields = get(formFieldsAtom);
    
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (!value) return 'This field is required';
        if (value.length < 2) return 'Must be at least 2 characters';
        break;
        
      case 'email':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Invalid email format';
        break;
        
      case 'phone':
        if (!value) return 'Phone is required';
        const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
        if (!phoneRegex.test(value)) return 'Format: (123) 456-7890';
        break;
        
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return 'Must contain uppercase, lowercase and number';
        }
        break;
        
      case 'confirmPassword':
        if (!value) return 'Please confirm password';
        if (value !== allFields.password) return 'Passwords do not match';
        break;
    }
    
    return null;
  }
});

// 表单有效性selector
const formValidationSelector = selector({
  key: 'formValidation',
  get: ({get}) => {
    const fields = get(formFieldsAtom);
    const fieldNames = Object.keys(fields);
    
    const errors = {};
    let isValid = true;
    
    fieldNames.forEach(fieldName => {
      const error = get(fieldValidationFamily(fieldName));
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });
    
    return {
      isValid,
      errors,
      completedFields: fieldNames.filter(name => fields[name]).length,
      totalFields: fieldNames.length
    };
  }
});

// 表单进度selector
const formProgressSelector = selector({
  key: 'formProgress',
  get: ({get}) => {
    const validation = get(formValidationSelector);
    return (validation.completedFields / validation.totalFields) * 100;
  }
});

// 组件
function ValidationForm() {
  const validation = useRecoilValue(formValidationSelector);
  const progress = useRecoilValue(formProgressSelector);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validation.isValid) {
      console.log('Form is valid, submitting...');
    } else {
      console.log('Form has errors:', validation.errors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <p>{progress.toFixed(0)}% completed</p>
      </div>

      <FormField name="firstName" label="First Name" />
      <FormField name="lastName" label="Last Name" />
      <FormField name="email" label="Email" type="email" />
      <FormField name="phone" label="Phone" placeholder="(123) 456-7890" />
      <FormField name="password" label="Password" type="password" />
      <FormField name="confirmPassword" label="Confirm Password" type="password" />

      <button type="submit" disabled={!validation.isValid}>
        Submit
      </button>
      
      {Object.keys(validation.errors).length > 0 && (
        <div className="form-errors">
          <h4>Please fix the following errors:</h4>
          <ul>
            {Object.entries(validation.errors).map(([field, error]) => (
              <li key={field}>{field}: {error}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

function FormField({ name, label, type = 'text', ...props }) {
  const [value, setValue] = useRecoilState(fieldSelectorFamily(name));
  const error = useRecoilValue(fieldValidationFamily(name));

  return (
    <div className="form-field">
      <label>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={error ? 'error' : ''}
        {...props}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
```

## 性能优化

### 1. 选择器缓存

```jsx
// 昂贵计算selector
const expensiveComputationSelector = selector({
  key: 'expensiveComputation',
  get: ({get}) => {
    const data = get(dataAtom);
    
    // 只在data变化时重新计算
    return expensiveFunction(data);
  }
});
```

### 2. 错误边界

```jsx
function SearchWithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<SearchError />}>
      <Suspense fallback={<SearchLoading />}>
        <SearchResults />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### 3. 条件渲染

```jsx
// 避免不必要的异步selector调用
function ConditionalData() {
  const shouldFetch = useRecoilValue(shouldFetchAtom);
  
  return (
    <div>
      {shouldFetch && (
        <Suspense fallback={<div>Loading...</div>}>
          <AsyncDataComponent />
        </Suspense>
      )}
    </div>
  );
}
```

## 总结

Recoil Selectors是强大的派生状态管理工具：

1. **派生状态**：基于atoms计算新状态
2. **异步支持**：原生支持异步计算
3. **自动缓存**：结果会自动缓存直到依赖变化
4. **Selector Family**：参数化的selector创建
5. **性能优化**：精确的依赖追踪
6. **错误处理**：配合ErrorBoundary处理异步错误

Selectors让Recoil可以处理复杂的状态逻辑和数据变换。
