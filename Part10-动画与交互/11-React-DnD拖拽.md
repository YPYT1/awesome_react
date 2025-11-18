# React DnD拖拽

## 概述

React DnD是一个强大的拖放库,基于HTML5拖放API构建,为React应用提供了灵活的拖拽功能。它采用高阶组件和Hooks模式,支持复杂的拖放交互场景。本文将全面介绍React DnD的核心概念、使用方法以及实战应用。

## 安装与配置

### 安装

```bash
# 核心库
npm install react-dnd react-dnd-html5-backend

# 触摸设备支持
npm install react-dnd-touch-backend

# 多后端支持
npm install react-dnd-multi-backend
```

### 基础配置

```tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <YourComponents />
    </DndProvider>
  );
}
```

### 触摸设备配置

```tsx
import { TouchBackend } from 'react-dnd-touch-backend';

function MobileApp() {
  return (
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <YourComponents />
    </DndProvider>
  );
}
```

### 多后端配置

```tsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MouseTransition, TouchTransition } from 'react-dnd-multi-backend';

const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

function UniversalApp() {
  return (
    <DndProvider options={HTML5toTouch}>
      <YourComponents />
    </DndProvider>
  );
}
```

## 核心概念

### Items和Types

```tsx
// 定义拖拽项类型
export const ItemTypes = {
  CARD: 'card',
  BOX: 'box',
  FILE: 'file',
} as const;

// 定义拖拽项接口
export interface DragItem {
  type: string;
  id: string;
  index?: number;
  [key: string]: any;
}
```

### useDrag Hook

```tsx
import { useDrag } from 'react-dnd';

interface CardProps {
  id: string;
  text: string;
}

function DraggableCard({ id, text }: CardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      {text}
    </div>
  );
}
```

### useDrop Hook

```tsx
import { useDrop } from 'react-dnd';

interface DropTargetProps {
  onDrop: (item: DragItem) => void;
}

function DropTarget({ onDrop }: DropTargetProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: DragItem) => {
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  
  const backgroundColor = isOver
    ? canDrop
      ? '#d1fae5'
      : '#fee2e2'
    : '#f3f4f6';
  
  return (
    <div
      ref={drop}
      style={{
        backgroundColor,
        minHeight: 200,
        padding: 16,
      }}
    >
      {isOver ? 'Release to drop' : 'Drop here'}
    </div>
  );
}
```

## 基础实现

### 简单拖放

```tsx
function SimpleDragDrop() {
  const [items, setItems] = useState<string[]>([]);
  
  const handleDrop = (item: DragItem) => {
    setItems(prev => [...prev, item.text]);
  };
  
  return (
    <div>
      <div className="draggable-items">
        <DraggableCard id="1" text="Card 1" />
        <DraggableCard id="2" text="Card 2" />
        <DraggableCard id="3" text="Card 3" />
      </div>
      
      <DropTarget onDrop={handleDrop} />
      
      <div className="dropped-items">
        <h3>Dropped Items:</h3>
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  );
}
```

### 列表排序

```tsx
interface SortableItem {
  id: string;
  text: string;
}

interface SortableCardProps extends SortableItem {
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

function SortableCard({ id, text, index, moveCard }: SortableCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ handlerId }, drop] = useDrop<
    DragItem,
    void,
    { handlerId: string | symbol | null }
  >({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index!;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  drag(drop(ref));
  
  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{
        opacity: isDragging ? 0 : 1,
        padding: 8,
        margin: 4,
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        cursor: 'move',
      }}
    >
      {text}
    </div>
  );
}

function SortableList() {
  const [cards, setCards] = useState<SortableItem[]>([
    { id: '1', text: 'Item 1' },
    { id: '2', text: 'Item 2' },
    { id: '3', text: 'Item 3' },
    { id: '4', text: 'Item 4' },
  ]);
  
  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const dragCard = newCards[dragIndex];
      newCards.splice(dragIndex, 1);
      newCards.splice(hoverIndex, 0, dragCard);
      return newCards;
    });
  }, []);
  
  return (
    <div>
      {cards.map((card, index) => (
        <SortableCard
          key={card.id}
          index={index}
          id={card.id}
          text={card.text}
          moveCard={moveCard}
        />
      ))}
    </div>
  );
}
```

## 高级功能

### 自定义拖拽预览

```tsx
import { useDrag, DragPreviewImage } from 'react-dnd';

function CustomPreviewCard({ id, text }: CardProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  return (
    <>
      <DragPreviewImage connect={preview} src="/drag-preview.png" />
      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
      >
        {text}
      </div>
    </>
  );
}
```

### 拖拽句柄

```tsx
function DragHandleCard({ id, text }: CardProps) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  return (
    <div
      ref={preview}
      style={{
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        ref={drag}
        style={{
          cursor: 'move',
          padding: '8px',
          backgroundColor: '#e5e7eb',
        }}
      >
        ⋮⋮
      </div>
      <div style={{ flex: 1, padding: '8px' }}>
        {text}
      </div>
    </div>
  );
}
```

### 条件拖放

```tsx
interface ConditionalDropProps {
  accept: string[];
  onDrop: (item: DragItem) => void;
}

function ConditionalDrop({ accept, onDrop }: ConditionalDropProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept,
    canDrop: (item: DragItem) => {
      // 自定义拖放条件
      return item.id !== 'locked';
    },
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  
  const backgroundColor = isOver
    ? canDrop
      ? '#d1fae5'
      : '#fee2e2'
    : '#f3f4f6';
  
  return (
    <div
      ref={drop}
      style={{
        backgroundColor,
        minHeight: 200,
        border: canDrop ? '2px dashed #10b981' : '2px dashed #6b7280',
      }}
    >
      {!canDrop && isOver ? 'Cannot drop here' : 'Drop here'}
    </div>
  );
}
```

### 嵌套拖放

```tsx
interface NestedItem {
  id: string;
  text: string;
  children?: NestedItem[];
}

function NestedDraggable({ item, onMove }: {
  item: NestedItem;
  onMove: (dragId: string, hoverId: string) => void;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: item.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (dragItem: DragItem, monitor) => {
      if (monitor.didDrop()) return;
      onMove(dragItem.id, item.id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));
  
  const ref = useRef<HTMLDivElement>(null);
  drag(drop(ref));
  
  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? '#e5e7eb' : '#fff',
        border: '1px solid #d1d5db',
        padding: 8,
        marginLeft: item.children ? 20 : 0,
      }}
    >
      <div>{item.text}</div>
      {item.children && (
        <div>
          {item.children.map(child => (
            <NestedDraggable
              key={child.id}
              item={child}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

## 实战案例

### 1. 看板系统

```tsx
interface Task {
  id: string;
  title: string;
  status: 'todo' | 'inProgress' | 'done';
}

interface ColumnProps {
  status: Task['status'];
  tasks: Task[];
  onDrop: (taskId: string, newStatus: Task['status']) => void;
}

function Column({ status, tasks, onDrop }: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: DragItem) => {
      onDrop(item.id, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  
  const titles = {
    todo: 'To Do',
    inProgress: 'In Progress',
    done: 'Done',
  };
  
  return (
    <div
      ref={drop}
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: isOver ? '#e5e7eb' : '#f3f4f6',
        minHeight: 400,
      }}
    >
      <h3>{titles[status]}</h3>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: 12,
        margin: '8px 0',
        backgroundColor: '#fff',
        borderRadius: 4,
        cursor: 'move',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      {task.title}
    </div>
  );
}

function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Task 1', status: 'todo' },
    { id: '2', title: 'Task 2', status: 'todo' },
    { id: '3', title: 'Task 3', status: 'inProgress' },
    { id: '4', title: 'Task 4', status: 'done' },
  ]);
  
  const handleDrop = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };
  
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'inProgress');
  const doneTasks = tasks.filter(t => t.status === 'done');
  
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <Column status="todo" tasks={todoTasks} onDrop={handleDrop} />
      <Column status="inProgress" tasks={inProgressTasks} onDrop={handleDrop} />
      <Column status="done" tasks={doneTasks} onDrop={handleDrop} />
    </div>
  );
}
```

### 2. 文件上传

```tsx
function FileUploadZone() {
  const [files, setFiles] = useState<File[]>([]);
  
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (item: { files: File[] }) => {
      setFiles(prev => [...prev, ...item.files]);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  
  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <>
      <div
        ref={drop}
        style={{
          border: '2px dashed',
          borderColor: isOver ? '#10b981' : '#d1d5db',
          backgroundColor: isOver ? '#d1fae5' : '#f9fafb',
          padding: 32,
          textAlign: 'center',
          borderRadius: 8,
        }}
      >
        {isOver ? 'Drop files here' : 'Drag files here to upload'}
      </div>
      
      <div style={{ marginTop: 16 }}>
        <h3>Uploaded Files:</h3>
        {files.map((file, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: 8,
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <span>{file.name}</span>
            <button onClick={() => handleRemove(index)}>Remove</button>
          </div>
        ))}
      </div>
    </>
  );
}
```

### 3. 表单构建器

```tsx
interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea';
  label: string;
}

function FormBuilder() {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  
  const availableFields: FormField[] = [
    { id: 'text-1', type: 'text', label: 'Text Input' },
    { id: 'email-1', type: 'email', label: 'Email Input' },
    { id: 'number-1', type: 'number', label: 'Number Input' },
    { id: 'textarea-1', type: 'textarea', label: 'Text Area' },
  ];
  
  const handleDrop = (item: DragItem) => {
    const field = availableFields.find(f => f.id === item.id);
    if (field) {
      setFormFields(prev => [
        ...prev,
        { ...field, id: `${field.type}-${Date.now()}` }
      ]);
    }
  };
  
  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    setFormFields((prevFields) => {
      const newFields = [...prevFields];
      const dragField = newFields[dragIndex];
      newFields.splice(dragIndex, 1);
      newFields.splice(hoverIndex, 0, dragField);
      return newFields;
    });
  }, []);
  
  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <div style={{ flex: 1 }}>
        <h3>Available Fields</h3>
        {availableFields.map(field => (
          <FieldPalette key={field.id} field={field} />
        ))}
      </div>
      
      <div style={{ flex: 2 }}>
        <h3>Form Preview</h3>
        <FormCanvas
          fields={formFields}
          onDrop={handleDrop}
          moveField={moveField}
        />
      </div>
    </div>
  );
}

function FieldPalette({ field }: { field: FormField }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',
    item: { id: field.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  
  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: 12,
        margin: '8px 0',
        backgroundColor: '#f3f4f6',
        cursor: 'move',
        borderRadius: 4,
      }}
    >
      {field.label}
    </div>
  );
}

function FormCanvas({
  fields,
  onDrop,
  moveField,
}: {
  fields: FormField[];
  onDrop: (item: DragItem) => void;
  moveField: (dragIndex: number, hoverIndex: number) => void;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FIELD',
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));
  
  return (
    <div
      ref={drop}
      style={{
        border: '2px dashed #d1d5db',
        backgroundColor: isOver ? '#e5e7eb' : '#fff',
        minHeight: 400,
        padding: 16,
        borderRadius: 8,
      }}
    >
      {fields.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280' }}>
          Drag fields here
        </p>
      ) : (
        fields.map((field, index) => (
          <FormFieldPreview
            key={field.id}
            field={field}
            index={index}
            moveField={moveField}
          />
        ))
      )}
    </div>
  );
}

function FormFieldPreview({
  field,
  index,
  moveField,
}: {
  field: FormField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: 'FIELD',
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index!;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  
  const [{ isDragging }, drag] = useDrag({
    type: 'FIELD',
    item: () => ({ id: field.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  drag(drop(ref));
  
  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      style={{
        opacity: isDragging ? 0 : 1,
        padding: 12,
        margin: '8px 0',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 4,
      }}
    >
      <label>{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea style={{ width: '100%', marginTop: 8 }} />
      ) : (
        <input
          type={field.type}
          style={{ width: '100%', marginTop: 8 }}
        />
      )}
    </div>
  );
}
```

## 性能优化

### 使用useMemo优化

```tsx
function OptimizedDraggable({ items }: { items: Item[] }) {
  const memoizedItems = useMemo(
    () => items.map((item, index) => (
      <SortableCard
        key={item.id}
        index={index}
        {...item}
      />
    )),
    [items]
  );
  
  return <div>{memoizedItems}</div>;
}
```

### 防抖优化

```tsx
function DebouncedDrop() {
  const handleDrop = useMemo(
    () =>
      debounce((item: DragItem) => {
        // 处理拖放
        console.log('Dropped:', item);
      }, 200),
    []
  );
  
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: handleDrop,
  }));
  
  return <div ref={drop}>Drop Zone</div>;
}
```

## 调试技巧

### 使用DragLayer调试

```tsx
import { useDragLayer } from 'react-dnd';

function CustomDragLayer() {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));
  
  if (!isDragging || !currentOffset) {
    return null;
  }
  
  return (
    <div
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 100,
        left: currentOffset.x,
        top: currentOffset.y,
      }}
    >
      <div style={{ backgroundColor: '#3b82f6', color: '#fff', padding: 8 }}>
        Dragging: {item.text}
      </div>
    </div>
  );
}
```

## 最佳实践总结

### 性能优化

```
✅ 使用useMemo缓存拖拽项
✅ 合理使用防抖和节流
✅ 避免在拖拽时执行昂贵操作
✅ 使用浅比较优化重渲染
✅ 合理配置拖放监听器
```

### 用户体验

```
✅ 提供清晰的拖放视觉反馈
✅ 支持键盘导航
✅ 提供拖放预览
✅ 合理的拖放约束
✅ 处理拖放边界情况
```

### 可访问性

```
✅ 提供键盘替代方案
✅ 使用ARIA属性
✅ 提供屏幕阅读器支持
✅ 明确的拖放提示
```

React DnD为React应用提供了强大的拖放能力。通过掌握核心概念和最佳实践,你可以构建出色的拖放交互体验。

