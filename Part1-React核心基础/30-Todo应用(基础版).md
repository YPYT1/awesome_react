# Todo应用(基础版)

## 学习目标

通过本章实战项目，你将综合运用：

- 组件的创建和组合
- State状态管理
- 事件处理
- 列表渲染
- 条件渲染
- 表单处理
- React 19的新特性

## 项目概述

我们将创建一个完整的Todo应用，包含以下功能：
- 添加待办事项
- 标记完成/未完成
- 删除待办事项
- 过滤显示（全部/进行中/已完成）
- 统计信息
- 本地存储

## 第一部分：基础功能实现

### 1.1 创建基本结构

```jsx
import { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');
  
  // 添加todo
  const addTodo = (e) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputValue,
        completed: false,
        createdAt: new Date()
      };
      
      setTodos([...todos, newTodo]);
      setInputValue('');
    }
  };
  
  // 切换完成状态
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };
  
  // 删除todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // 过滤todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  // 统计
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };
  
  return (
    <div className="todo-app">
      <h1>Todo List</h1>
      
      {/* 输入框 */}
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="添加新任务..."
        />
        <button type="submit">添加</button>
      </form>
      
      {/* 过滤器 */}
      <div className="filters">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          全部 ({stats.total})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'active' : ''}
        >
          进行中 ({stats.active})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? 'active' : ''}
        >
          已完成 ({stats.completed})
        </button>
      </div>
      
      {/* 列表 */}
      <ul className="todo-list">
        {filteredTodos.length === 0 ? (
          <li className="empty">暂无任务</li>
        ) : (
          filteredTodos.map(todo => (
            <li key={todo.id} className={todo.completed ? 'completed' : ''}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button onClick={() => deleteTodo(todo.id)}>删除</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default TodoApp;
```

### 1.2 添加样式

```css
/* TodoApp.css */
.todo-app {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}

.todo-app h1 {
  text-align: center;
  color: #333;
}

.todo-app form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.todo-app input[type="text"] {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.todo-app button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #007bff;
  color: white;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filters button {
  background: #f0f0f0;
  color: #333;
}

.filters button.active {
  background: #007bff;
  color: white;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-list li.empty {
  text-align: center;
  color: #999;
}
```

## 第二部分：功能增强

### 2.1 编辑功能

```jsx
function EnhancedTodo() {
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };
  
  const saveEdit = () => {
    setTodos(todos.map(todo =>
      todo.id === editingId
        ? { ...todo, text: editText }
        : todo
    ));
    setEditingId(null);
    setEditText('');
  };
  
  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {editingId === todo.id ? (
            <div>
              <input
                value={editText}
                onChange={e => setEditText(e.target.value)}
              />
              <button onClick={saveEdit}>保存</button>
              <button onClick={cancelEdit}>取消</button>
            </div>
          ) : (
            <div>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              <span>{todo.text}</span>
              <button onClick={() => startEdit(todo)}>编辑</button>
              <button onClick={() => deleteTodo(todo.id)}>删除</button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
```

### 2.2 批量操作

```jsx
function BatchOperations() {
  const [todos, setTodos] = useState([]);
  
  const toggleAll = () => {
    const allCompleted = todos.every(t => t.completed);
    setTodos(todos.map(todo => ({
      ...todo,
      completed: !allCompleted
    })));
  };
  
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };
  
  return (
    <div>
      <button onClick={toggleAll}>全选/取消全选</button>
      <button onClick={clearCompleted}>清除已完成</button>
    </div>
  );
}
```

### 2.3 本地存储

```jsx
function TodoWithStorage() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  return <div>{/* ... */}</div>;
}
```

## 第三部分：组件拆分

### 3.1 拆分为子组件

```jsx
// TodoInput组件
function TodoInput({ onAdd }) {
  const [value, setValue] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value);
      setValue('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="添加新任务..."
      />
      <button type="submit">添加</button>
    </form>
  );
}

// TodoItem组件
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  
  const handleSave = () => {
    onEdit(todo.id, editText);
    setIsEditing(false);
  };
  
  if (isEditing) {
    return (
      <li>
        <input
          value={editText}
          onChange={e => setEditText(e.target.value)}
        />
        <button onClick={handleSave}>保存</button>
        <button onClick={() => setIsEditing(false)}>取消</button>
      </li>
    );
  }
  
  return (
    <li className={todo.completed ? 'completed' : ''}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => setIsEditing(true)}>编辑</button>
      <button onClick={() => onDelete(todo.id)}>删除</button>
    </li>
  );
}

// TodoList组件
function TodoList({ todos, onToggle, onDelete, onEdit }) {
  if (todos.length === 0) {
    return <div className="empty">暂无任务</div>;
  }
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}

// TodoFilters组件
function TodoFilters({ filter, onFilterChange, stats }) {
  return (
    <div className="filters">
      <button
        onClick={() => onFilterChange('all')}
        className={filter === 'all' ? 'active' : ''}
      >
        全部 ({stats.total})
      </button>
      <button
        onClick={() => onFilterChange('active')}
        className={filter === 'active' ? 'active' : ''}
      >
        进行中 ({stats.active})
      </button>
      <button
        onClick={() => onFilterChange('completed')}
        className={filter === 'completed' ? 'active' : ''}
      >
        已完成 ({stats.completed})
      </button>
    </div>
  );
}

// 主组件
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const addTodo = (text) => {
    setTodos([...todos, {
      id: Date.now(),
      text,
      completed: false
    }]);
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  const editTodo = (id, newText) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
  };
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };
  
  return (
    <div className="todo-app">
      <h1>我的待办事项</h1>
      
      <TodoInput onAdd={addTodo} />
      
      <TodoFilters
        filter={filter}
        onFilterChange={setFilter}
        stats={stats}
      />
      
      <TodoList
        todos={filteredTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
      />
    </div>
  );
}

export default TodoApp;
```

## 第四部分：优先级和标签

### 4.1 添加优先级

```jsx
function TodoWithPriority() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('medium');
  
  const addTodo = (e) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false,
        priority,  // high, medium, low
        createdAt: new Date()
      }]);
      setInputValue('');
      setPriority('medium');
    }
  };
  
  const updatePriority = (id, newPriority) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, priority: newPriority } : todo
    ));
  };
  
  // 按优先级排序
  const sortedTodos = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...todos].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }, [todos]);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };
  
  return (
    <div className="todo-app">
      <h1>Todo应用（优先级版）</h1>
      
      <form onSubmit={addTodo}>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="添加新任务..."
        />
        
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
        
        <button type="submit">添加</button>
      </form>
      
      <ul>
        {sortedTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            
            <span style={{
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: getPriorityColor(todo.priority)
            }}>
              {todo.text}
            </span>
            
            <select
              value={todo.priority}
              onChange={e => updatePriority(todo.id, e.target.value)}
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
            
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.2 添加标签系统

```jsx
function TodoWithTags() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filterTag, setFilterTag] = useState(null);
  
  const availableTags = ['工作', '学习', '生活', '娱乐', '健康'];
  
  const addTodo = (e) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false,
        tags: selectedTags,
        createdAt: new Date()
      }]);
      setInputValue('');
      setSelectedTags([]);
    }
  };
  
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  const addTagToTodo = (todoId, tag) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? { ...todo, tags: [...todo.tags, tag] }
        : todo
    ));
  };
  
  const removeTagFromTodo = (todoId, tag) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? { ...todo, tags: todo.tags.filter(t => t !== tag) }
        : todo
    ));
  };
  
  // 按标签过滤
  const filteredTodos = useMemo(() => {
    if (!filterTag) return todos;
    return todos.filter(todo => todo.tags.includes(filterTag));
  }, [todos, filterTag]);
  
  return (
    <div className="todo-app">
      <h1>Todo应用（标签版）</h1>
      
      <form onSubmit={addTodo}>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="添加新任务..."
        />
        
        <div className="tag-selector">
          {availableTags.map(tag => (
            <button
              key={tag}
              type="button"
              className={selectedTags.includes(tag) ? 'selected' : ''}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        
        <button type="submit">添加</button>
      </form>
      
      <div className="tag-filter">
        <button
          className={!filterTag ? 'active' : ''}
          onClick={() => setFilterTag(null)}
        >
          全部
        </button>
        {availableTags.map(tag => (
          <button
            key={tag}
            className={filterTag === tag ? 'active' : ''}
            onClick={() => setFilterTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      
      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            
            <div className="tags">
              {todo.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button onClick={() => removeTagFromTodo(todo.id, tag)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <button onClick={() => deleteTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.3 添加截止日期

```jsx
function TodoWithDeadline() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const addTodo = (e) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false,
        deadline: deadline ? new Date(deadline) : null,
        createdAt: new Date()
      }]);
      setInputValue('');
      setDeadline('');
    }
  };
  
  const updateDeadline = (id, newDeadline) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, deadline: new Date(newDeadline) } : todo
    ));
  };
  
  const isOverdue = (todo) => {
    if (!todo.deadline || todo.completed) return false;
    return new Date() > new Date(todo.deadline);
  };
  
  const getDaysUntilDeadline = (todo) => {
    if (!todo.deadline) return null;
    const days = Math.ceil((new Date(todo.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };
  
  return (
    <div className="todo-app">
      <h1>Todo应用（截止日期版）</h1>
      
      <form onSubmit={addTodo}>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="添加新任务..."
        />
        
        <input
          type="date"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        
        <button type="submit">添加</button>
      </form>
      
      <ul>
        {todos.map(todo => {
          const days = getDaysUntilDeadline(todo);
          const overdue = isOverdue(todo);
          
          return (
            <li key={todo.id} className={overdue ? 'overdue' : ''}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              
              <span>{todo.text}</span>
              
              {todo.deadline && (
                <div className="deadline-info">
                  <span>截止: {new Date(todo.deadline).toLocaleDateString()}</span>
                  {!todo.completed && (
                    <span className={overdue ? 'overdue-label' : 'days-left'}>
                      {overdue ? '已逾期' : `还剩 ${days} 天`}
                    </span>
                  )}
                </div>
              )}
              
              <button onClick={() => deleteTodo(todo.id)}>删除</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

## 第五部分：高级功能

### 5.1 子任务功能

```jsx
function TodoWithSubtasks() {
  const [todos, setTodos] = useState([]);
  
  const addSubtask = (todoId, subtaskText) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            subtasks: [
              ...todo.subtasks,
              {
                id: Date.now(),
                text: subtaskText,
                completed: false
              }
            ]
          }
        : todo
    ));
  };
  
  const toggleSubtask = (todoId, subtaskId) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            subtasks: todo.subtasks.map(subtask =>
              subtask.id === subtaskId
                ? { ...subtask, completed: !subtask.completed }
                : subtask
            )
          }
        : todo
    ));
  };
  
  const deleteSubtask = (todoId, subtaskId) => {
    setTodos(todos.map(todo =>
      todo.id === todoId
        ? {
            ...todo,
            subtasks: todo.subtasks.filter(subtask => subtask.id !== subtaskId)
          }
        : todo
    ));
  };
  
  const getSubtaskProgress = (todo) => {
    if (!todo.subtasks || todo.subtasks.length === 0) return null;
    const completed = todo.subtasks.filter(s => s.completed).length;
    return { completed, total: todo.subtasks.length };
  };
  
  return (
    <div className="todo-app">
      <h1>Todo应用（子任务版）</h1>
      
      <ul className="todo-list">
        {todos.map(todo => {
          const progress = getSubtaskProgress(todo);
          
          return (
            <li key={todo.id} className="todo-item">
              <div className="todo-main">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
                
                {progress && (
                  <span className="progress-indicator">
                    {progress.completed}/{progress.total}
                  </span>
                )}
              </div>
              
              {/* 子任务列表 */}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <ul className="subtask-list">
                  {todo.subtasks.map(subtask => (
                    <li key={subtask.id} className="subtask-item">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => toggleSubtask(todo.id, subtask.id)}
                      />
                      <span>{subtask.text}</span>
                      <button onClick={() => deleteSubtask(todo.id, subtask.id)}>
                        删除
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* 添加子任务 */}
              <div className="add-subtask">
                <input
                  placeholder="添加子任务..."
                  onKeyPress={e => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addSubtask(todo.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

### 5.2 添加搜索功能

```jsx
function TodoWithSearch() {
  const [todos, setTodos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchedTodos = useMemo(() => {
    if (!searchTerm) return todos;
    
    const term = searchTerm.toLowerCase();
    return todos.filter(todo =>
      todo.text.toLowerCase().includes(term) ||
      (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }, [todos, searchTerm]);
  
  return (
    <div className="todo-app">
      <h1>Todo应用（搜索版）</h1>
      
      <div className="search-bar">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="搜索任务..."
          className="search-input"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')}>
            清除
          </button>
        )}
      </div>
      
      <p className="search-results">
        {searchTerm && `找到 ${searchedTodos.length} 个结果`}
      </p>
      
      <TodoList todos={searchedTodos} />
    </div>
  );
}
```

### 5.3 添加统计面板

```jsx
function TodoWithStatistics() {
  const [todos, setTodos] = useState([]);
  
  const statistics = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
    
    // 按优先级统计
    const byPriority = {
      high: todos.filter(t => t.priority === 'high' && !t.completed).length,
      medium: todos.filter(t => t.priority === 'medium' && !t.completed).length,
      low: todos.filter(t => t.priority === 'low' && !t.completed).length
    };
    
    // 今日任务
    const today = new Date().toDateString();
    const todayTasks = todos.filter(t => 
      new Date(t.createdAt).toDateString() === today
    ).length;
    
    // 逾期任务
    const overdue = todos.filter(t => 
      !t.completed && t.deadline && new Date() > new Date(t.deadline)
    ).length;
    
    return {
      total,
      completed,
      active,
      completionRate,
      byPriority,
      todayTasks,
      overdue
    };
  }, [todos]);
  
  return (
    <div className="todo-app">
      <h1>Todo应用（统计版）</h1>
      
      <div className="statistics-panel">
        <div className="stat-card">
          <h3>总任务</h3>
          <p className="stat-value">{statistics.total}</p>
        </div>
        
        <div className="stat-card">
          <h3>已完成</h3>
          <p className="stat-value">{statistics.completed}</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${statistics.completionRate}%` }}
            />
          </div>
          <p className="stat-label">{statistics.completionRate}%</p>
        </div>
        
        <div className="stat-card">
          <h3>进行中</h3>
          <p className="stat-value">{statistics.active}</p>
        </div>
        
        <div className="stat-card">
          <h3>今日新增</h3>
          <p className="stat-value">{statistics.todayTasks}</p>
        </div>
        
        {statistics.overdue > 0 && (
          <div className="stat-card alert">
            <h3>逾期任务</h3>
            <p className="stat-value">{statistics.overdue}</p>
          </div>
        )}
        
        <div className="stat-card">
          <h3>待办优先级</h3>
          <div className="priority-stats">
            <p>高: {statistics.byPriority.high}</p>
            <p>中: {statistics.byPriority.medium}</p>
            <p>低: {statistics.byPriority.low}</p>
          </div>
        </div>
      </div>
      
      <TodoList todos={todos} />
    </div>
  );
}
```

## 第六部分：数据持久化

### 6.1 localStorage完整实现

```jsx
function useTodoStorage() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem('todos');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('读取todos失败:', error);
      return [];
    }
  });
  
  useEffect(() => {
    try {
      localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('保存todos失败:', error);
    }
  }, [todos]);
  
  return [todos, setTodos];
}

function PersistentTodoApp() {
  const [todos, setTodos] = useTodoStorage();
  const [lastSaved, setLastSaved] = useState(null);
  
  useEffect(() => {
    setLastSaved(new Date());
  }, [todos]);
  
  return (
    <div className="todo-app">
      <header>
        <h1>Todo应用</h1>
        {lastSaved && (
          <p className="save-indicator">
            最后保存: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </header>
      
      <TodoList todos={todos} onUpdate={setTodos} />
    </div>
  );
}
```

### 6.2 导出和导入

```jsx
function TodoWithExport() {
  const [todos, setTodos] = useState([]);
  
  // 导出为JSON
  const exportTodos = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };
  
  // 导入JSON
  const importTodos = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        setTodos(imported);
        alert(`成功导入 ${imported.length} 个任务`);
      } catch (error) {
        alert('导入失败，文件格式错误');
      }
    };
    reader.readAsText(file);
  };
  
  // 导出为CSV
  const exportToCSV = () => {
    const headers = ['ID', '任务', '状态', '创建时间'];
    const rows = todos.map(todo => [
      todo.id,
      todo.text,
      todo.completed ? '已完成' : '未完成',
      new Date(todo.createdAt).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString()}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="todo-app">
      <div className="export-import">
        <button onClick={exportTodos}>导出JSON</button>
        <button onClick={exportToCSV}>导出CSV</button>
        
        <label className="import-btn">
          导入JSON
          <input
            type="file"
            accept=".json"
            onChange={importTodos}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      
      <TodoList todos={todos} />
    </div>
  );
}
```

## 第七部分：React 19版本

### 7.1 使用Server Actions

```jsx
// app/actions/todoActions.js
'use server';

import { revalidatePath } from 'next/cache';

export async function addTodo(formData) {
  const text = formData.get('text');
  
  if (!text) {
    return { error: '任务不能为空' };
  }
  
  await db.todos.create({
    text,
    completed: false
  });
  
  revalidatePath('/todos');
  return { success: true };
}

export async function toggleTodo(id) {
  const todo = await db.todos.findById(id);
  await db.todos.update(id, {
    completed: !todo.completed
  });
  
  revalidatePath('/todos');
}

export async function deleteTodo(id) {
  await db.todos.delete(id);
  revalidatePath('/todos');
}

// app/components/TodoApp.jsx
'use client';

import { useActionState, useOptimistic } from 'react';
import { addTodo, toggleTodo, deleteTodo } from '../actions/todoActions';

function TodoApp({ initialTodos }) {
  const [optimisticTodos, updateOptimistic] = useOptimistic(
    initialTodos,
    (state, { type, todo }) => {
      switch (type) {
        case 'add':
          return [...state, todo];
        case 'toggle':
          return state.map(t =>
            t.id === todo.id ? { ...t, completed: !t.completed } : t
          );
        case 'delete':
          return state.filter(t => t.id !== todo.id);
        default:
          return state;
      }
    }
  );
  
  const [state, formAction, isPending] = useActionState(addTodo, null);
  
  const handleAdd = async (formData) => {
    const text = formData.get('text');
    const newTodo = {
      id: Date.now(),
      text,
      completed: false
    };
    
    updateOptimistic({ type: 'add', todo: newTodo });
    await formAction(formData);
  };
  
  const handleToggle = async (id) => {
    updateOptimistic({ type: 'toggle', todo: { id } });
    await toggleTodo(id);
  };
  
  const handleDelete = async (id) => {
    updateOptimistic({ type: 'delete', todo: { id } });
    await deleteTodo(id);
  };
  
  return (
    <div>
      <form action={handleAdd}>
        <input name="text" required />
        <button disabled={isPending}>添加</button>
      </form>
      
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => handleDelete(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 第八部分：完整样式

```css
/* TodoApp.css - 完整样式 */
.todo-app {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.todo-app h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 32px;
}

/* 输入表单 */
.todo-app form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.todo-app input[type="text"] {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.todo-app input[type="text"]:focus {
  outline: none;
  border-color: #007bff;
}

.todo-app button[type="submit"] {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.todo-app button[type="submit"]:hover {
  background: #0056b3;
}

/* 过滤器 */
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filters button {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.filters button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.filters button:hover {
  border-color: #007bff;
}

/* Todo列表 */
.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.todo-list li:hover {
  background: #f8f9fa;
}

.todo-list li.completed {
  opacity: 0.6;
}

.todo-list li.overdue {
  background: #fff5f5;
  border-left: 4px solid #e74c3c;
}

.todo-list li input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.todo-list li span {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #999;
}

.todo-list button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.todo-list button:hover {
  opacity: 0.8;
}

/* 编辑状态 */
.todo-list li.editing {
  background: #fff8dc;
}

.todo-list li.editing input[type="text"] {
  flex: 1;
  padding: 8px;
  border: 2px solid #007bff;
  border-radius: 4px;
}

/* 标签 */
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #e7f3ff;
  border-radius: 12px;
  font-size: 12px;
  color: #007bff;
}

.tag button {
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: transparent;
  color: #007bff;
  font-size: 14px;
}

/* 优先级标签 */
.priority-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.priority-badge.high {
  background: #ffebee;
  color: #e74c3c;
}

.priority-badge.medium {
  background: #fff3e0;
  color: #f39c12;
}

.priority-badge.low {
  background: #e3f2fd;
  color: #3498db;
}

/* 截止日期 */
.deadline-info {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 14px;
}

.days-left {
  color: #28a745;
  font-weight: bold;
}

.overdue-label {
  color: #e74c3c;
  font-weight: bold;
}

/* 统计面板 */
.statistics-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-card.alert {
  background: #ffebee;
  border: 2px solid #e74c3c;
}

.stat-card h3 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s;
}

/* 子任务 */
.subtask-list {
  list-style: none;
  padding: 10px 0 10px 40px;
  margin: 10px 0;
}

.subtask-item {
  padding: 8px 0;
  border-bottom: none;
  font-size: 14px;
  color: #666;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todo-app {
    margin: 20px;
    padding: 20px;
  }
  
  .statistics-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .todo-list li {
    flex-wrap: wrap;
  }
}
```

## 练习题

### 基础练习

1. 实现基础Todo应用，包含添加、完成、删除功能
2. 添加过滤功能，显示全部/进行中/已完成
3. 实现编辑Todo功能
4. 添加统计信息显示

### 进阶练习

1. 实现优先级功能，按优先级排序
2. 添加标签系统，支持多标签过滤
3. 实现截止日期功能，显示逾期提醒
4. 添加子任务功能
5. 实现搜索功能
6. 添加数据导出和导入功能

### 高级练习

1. 使用localStorage实现数据持久化
2. 实现拖拽排序功能
3. 添加动画效果
4. 实现多人协作（使用WebSocket）
5. 使用React 19的Server Actions
6. 实现离线支持（PWA）
7. 添加单元测试和集成测试

### 挑战练习

1. 实现完整的GTD（Getting Things Done）系统
2. 添加日历视图
3. 实现任务提醒通知
4. 支持Markdown格式的任务描述
5. 实现任务模板功能
6. 添加数据分析和可视化

## 总结

通过完成这个Todo应用，你已经：

- 综合运用了React核心概念
- 掌握了复杂State管理
- 实现了完整的CRUD操作
- 学会了组件拆分和复用
- 了解了性能优化方法
- 掌握了数据持久化技术
- 体验了React 19新特性

Todo应用是学习React的最佳实践项目，通过不断迭代和优化，你可以将它打造成一个功能完善的生产级应用！

恭喜完成Part1的所有学习！你已经掌握了React核心基础，可以开始构建实际的生产级应用了！继续学习Part2，深入掌握React Hooks的强大功能！

