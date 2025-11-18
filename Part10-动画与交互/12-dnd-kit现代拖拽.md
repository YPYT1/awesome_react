# dnd-kit现代拖拽方案

## 概述

dnd-kit是一个现代化的、轻量级的拖放库，专为React构建。与React DnD相比，它提供了更好的性能、更小的包体积、更灵活的API，并且原生支持触摸设备、键盘导航和无障碍访问。本文将全面介绍dnd-kit的核心概念、使用方法以及实战应用。

## 核心优势

### 性能优势
- **零依赖**: 不依赖于HTML5拖放API
- **轻量级**: 核心包仅~15KB gzipped
- **高性能**: 使用CSS transforms和translate3d
- **优化的重渲染**: 智能的状态管理避免不必要的渲染

### 功能优势
- **多种传感器**: 鼠标、触摸、键盘、指针传感器
- **无障碍访问**: 内置ARIA支持和键盘导航
- **灵活的约束**: 支持轴限制、边界限制等
- **碰撞检测**: 多种碰撞检测算法
- **自定义拖拽层**: 完全可定制的拖拽预览

## 安装与配置

### 安装核心包

```bash
npm install @dnd-kit/core

# 可选的辅助包
npm install @dnd-kit/sortable @dnd-kit/utilities
```

### 基础配置

```tsx
import { DndContext } from '@dnd-kit/core';

function App() {
  return (
    <DndContext>
      <YourComponents />
    </DndContext>
  );
}
```

## 核心概念

### DndContext

```tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';

function BasicDnD() {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      console.log(`Dropped ${active.id} on ${over.id}`);
    }
  }
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Draggable id="draggable-1" />
      <Droppable id="droppable-1" />
    </DndContext>
  );
}
```

### Draggable组件

```tsx
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

function Draggable({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      Drag me
    </div>
  );
}
```

### Droppable组件

```tsx
import { useDroppable } from '@dnd-kit/core';

function Droppable({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  
  const style = {
    backgroundColor: isOver ? '#e5e7eb' : '#f3f4f6',
    padding: '20px',
    minHeight: '200px',
  };
  
  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
```

## 传感器配置

### 鼠标传感器

```tsx
import { DndContext, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';

function WithMouseSensor() {
  const mouseSensor = useSensor(MouseSensor, {
    // 需要移动5px才激活拖拽
    activationConstraint: {
      distance: 5,
    },
  });
  
  const sensors = useSensors(mouseSensor);
  
  return (
    <DndContext sensors={sensors}>
      {/* ... */}
    </DndContext>
  );
}
```

### 触摸传感器

```tsx
import { TouchSensor } from '@dnd-kit/core';

function WithTouchSensor() {
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 长按250ms激活
      tolerance: 5, // 允许5px的移动容差
    },
  });
  
  const sensors = useSensors(touchSensor);
  
  return (
    <DndContext sensors={sensors}>
      {/* ... */}
    </DndContext>
  );
}
```

### 键盘传感器

```tsx
import { KeyboardSensor } from '@dnd-kit/core';

function WithKeyboardSensor() {
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(keyboardSensor);
  
  return (
    <DndContext sensors={sensors}>
      {/* ... */}
    </DndContext>
  );
}
```

### 多传感器组合

```tsx
import { 
  PointerSensor, 
  KeyboardSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';

function MultiSensor() {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  
  const keyboardSensor = useSensor(KeyboardSensor);
  
  const sensors = useSensors(pointerSensor, keyboardSensor);
  
  return (
    <DndContext sensors={sensors}>
      {/* ... */}
    </DndContext>
  );
}
```

## 碰撞检测算法

### 矩形交叉检测

```tsx
import { rectIntersection } from '@dnd-kit/core';

function WithRectIntersection() {
  return (
    <DndContext collisionDetection={rectIntersection}>
      {/* ... */}
    </DndContext>
  );
}
```

### 最近中心点检测

```tsx
import { closestCenter } from '@dnd-kit/core';

function WithClosestCenter() {
  return (
    <DndContext collisionDetection={closestCenter}>
      {/* ... */}
    </DndContext>
  );
}
```

### 最近角落检测

```tsx
import { closestCorners } from '@dnd-kit/core';

function WithClosestCorners() {
  return (
    <DndContext collisionDetection={closestCorners}>
      {/* ... */}
    </DndContext>
  );
}
```

### 自定义碰撞检测

```tsx
import { CollisionDetection, closestCenter } from '@dnd-kit/core';

const customCollisionDetection: CollisionDetection = (args) => {
  // 首先使用标准检测
  const closestCenterCollision = closestCenter(args);
  
  // 自定义逻辑
  if (closestCenterCollision.length > 0) {
    const collision = closestCenterCollision[0];
    
    // 过滤掉某些特定ID
    if (collision.id === 'restricted-zone') {
      return [];
    }
  }
  
  return closestCenterCollision;
};

function CustomCollision() {
  return (
    <DndContext collisionDetection={customCollisionDetection}>
      {/* ... */}
    </DndContext>
  );
}
```

## 排序功能(@dnd-kit/sortable)

### 基础排序

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface Item {
  id: string;
  content: string;
}

function SortableList() {
  const [items, setItems] = useState<Item[]>([
    { id: '1', content: 'Item 1' },
    { id: '2', content: 'Item 2' },
    { id: '3', content: 'Item 3' },
  ]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id} content={item.content} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

### SortableItem组件

```tsx
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, content }: { id: string; content: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: '16px',
    margin: '8px 0',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    cursor: 'grab',
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {content}
    </div>
  );
}
```

## 排序策略

### 垂直列表策略

```tsx
import { verticalListSortingStrategy } from '@dnd-kit/sortable';

<SortableContext items={items} strategy={verticalListSortingStrategy}>
  {/* ... */}
</SortableContext>
```

### 水平列表策略

```tsx
import { horizontalListSortingStrategy } from '@dnd-kit/sortable';

<SortableContext items={items} strategy={horizontalListSortingStrategy}>
  {/* ... */}
</SortableContext>
```

### 网格策略

```tsx
import { rectSortingStrategy } from '@dnd-kit/sortable';

<SortableContext items={items} strategy={rectSortingStrategy}>
  {/* ... */}
</SortableContext>
```

## 拖拽修饰符

### 轴限制

```tsx
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

function VerticalOnly() {
  return (
    <DndContext modifiers={[restrictToVerticalAxis]}>
      {/* 只能垂直拖拽 */}
    </DndContext>
  );
}
```

### 父容器限制

```tsx
import { restrictToParentElement } from '@dnd-kit/modifiers';

function RestrictedToParent() {
  return (
    <DndContext modifiers={[restrictToParentElement]}>
      {/* 拖拽不能超出父元素 */}
    </DndContext>
  );
}
```

### 窗口边界限制

```tsx
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

function RestrictedToWindow() {
  return (
    <DndContext modifiers={[restrictToWindowEdges]}>
      {/* 拖拽不能超出窗口 */}
    </DndContext>
  );
}
```

### 自定义修饰符

```tsx
import { Modifier } from '@dnd-kit/core';

const snapToGrid: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: Math.ceil(transform.x / 25) * 25,
    y: Math.ceil(transform.y / 25) * 25,
  };
};

function SnapToGrid() {
  return (
    <DndContext modifiers={[snapToGrid]}>
      {/* 拖拽会吸附到25px网格 */}
    </DndContext>
  );
}
```

## 拖拽覆盖层

### DragOverlay基础使用

```tsx
import { DragOverlay } from '@dnd-kit/core';

function WithDragOverlay() {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }
  
  function handleDragEnd() {
    setActiveId(null);
  }
  
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items}>
        {items.map((item) => (
          <SortableItem key={item.id} {...item} />
        ))}
      </SortableContext>
      
      <DragOverlay>
        {activeId ? (
          <div style={{ opacity: 0.8 }}>
            Dragging: {items.find(i => i.id === activeId)?.content}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### 自定义DragOverlay样式

```tsx
function CustomDragOverlay() {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  return (
    <DndContext
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={() => setActiveId(null)}
    >
      {/* ... */}
      
      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeId ? (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transform: 'rotate(5deg)',
            }}
          >
            {items.find(i => i.id === activeId)?.content}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

## 实战案例

### 1. 看板系统

```tsx
interface Task {
  id: string;
  title: string;
  columnId: string;
}

interface Column {
  id: string;
  title: string;
}

function KanbanBoard() {
  const [columns] = useState<Column[]>([
    { id: 'todo', title: 'To Do' },
    { id: 'inProgress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ]);
  
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Task 1', columnId: 'todo' },
    { id: '2', title: 'Task 2', columnId: 'todo' },
    { id: '3', title: 'Task 3', columnId: 'inProgress' },
    { id: '4', title: 'Task 4', columnId: 'done' },
  ]);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );
  
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }
  
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeTask = tasks.find(t => t.id === activeId);
    const overTask = tasks.find(t => t.id === overId);
    
    if (!activeTask) return;
    
    // 拖到列上
    if (columns.find(c => c.id === overId)) {
      setTasks(tasks.map(t =>
        t.id === activeId ? { ...t, columnId: overId } : t
      ));
      return;
    }
    
    // 拖到任务上
    if (overTask && activeTask.columnId !== overTask.columnId) {
      setTasks(tasks.map(t =>
        t.id === activeId ? { ...t, columnId: overTask.columnId } : t
      ));
    }
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeTask = tasks.find(t => t.id === active.id);
      const overTask = tasks.find(t => t.id === over.id);
      
      if (activeTask && overTask && activeTask.columnId === overTask.columnId) {
        setTasks((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
    
    setActiveId(null);
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(t => t.columnId === column.id)}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeId ? (
          <TaskCard
            task={tasks.find(t => t.id === activeId)!}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ column, tasks }: { column: Column; tasks: Task[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });
  
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        padding: '16px',
        backgroundColor: isOver ? '#e5e7eb' : '#f3f4f6',
        borderRadius: '8px',
        minHeight: '400px',
      }}
    >
      <h3>{column.title}</h3>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: '12px',
    margin: '8px 0',
    backgroundColor: '#fff',
    borderRadius: '4px',
    cursor: 'grab',
    boxShadow: isDragging
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      : '0 1px 3px rgba(0, 0, 0, 0.1)',
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {task.title}
    </div>
  );
}
```

### 2. 文件管理器

```tsx
interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
}

function FileManager() {
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'Documents', type: 'folder', parentId: null },
    { id: '2', name: 'file1.txt', type: 'file', parentId: '1' },
    { id: '3', name: 'Pictures', type: 'folder', parentId: null },
    { id: '4', name: 'image.png', type: 'file', parentId: '3' },
  ]);
  
  const sensors = useSensors(useSensor(PointerSensor));
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeItem = files.find(f => f.id === active.id);
    const overItem = files.find(f => f.id === over.id);
    
    if (!activeItem || !overItem) return;
    
    // 只允许移动到文件夹
    if (overItem.type === 'folder') {
      setFiles(files.map(f =>
        f.id === activeItem.id
          ? { ...f, parentId: overItem.id }
          : f
      ));
    }
  }
  
  const rootItems = files.filter(f => f.parentId === null);
  
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {rootItems.map(item => (
        <FileItem key={item.id} item={item} files={files} />
      ))}
    </DndContext>
  );
}

function FileItem({ item, files }: { item: FileItem; files: FileItem[] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  });
  
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: item.id,
    disabled: item.type === 'file',
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    padding: '8px',
    margin: '4px 0',
    backgroundColor: isOver ? '#dbeafe' : '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
  };
  
  const children = files.filter(f => f.parentId === item.id);
  
  return (
    <div>
      <div
        ref={(node) => {
          setNodeRef(node);
          if (item.type === 'folder') {
            setDropRef(node);
          }
        }}
        style={style}
        {...attributes}
        {...listeners}
      >
        {item.type === 'folder' ? '📁' : '📄'} {item.name}
      </div>
      
      {item.type === 'folder' && children.length > 0 && (
        <div style={{ marginLeft: '20px' }}>
          {children.map(child => (
            <FileItem key={child.id} item={child} files={files} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 3. 表单字段排序

```tsx
interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea';
  label: string;
  required: boolean;
}

function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', type: 'text', label: 'Name', required: true },
    { id: '2', type: 'email', label: 'Email', required: true },
    { id: '3', type: 'textarea', label: 'Message', required: false },
  ]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={fields} strategy={verticalListSortingStrategy}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {fields.map((field) => (
            <SortableFormField key={field.id} field={field} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableFormField({ field }: { field: FormField }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: '16px',
        margin: '8px 0',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
        }}
        {...attributes}
        {...listeners}
      >
        <div style={{ cursor: 'grab', marginRight: '12px' }}>⋮⋮</div>
        <label style={{ fontWeight: 'bold' }}>
          {field.label}
          {field.required && <span style={{ color: 'red' }}> *</span>}
        </label>
      </div>
      
      {field.type === 'textarea' ? (
        <textarea
          placeholder={`Enter ${field.label.toLowerCase()}`}
          style={{ width: '100%', padding: '8px' }}
        />
      ) : (
        <input
          type={field.type}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          style={{ width: '100%', padding: '8px' }}
        />
      )}
    </div>
  );
}
```

### 4. 多列表拖拽

```tsx
interface Container {
  id: string;
  title: string;
  items: string[];
}

function MultipleContainers() {
  const [containers, setContainers] = useState<Container[]>([
    { id: 'A', title: 'Container A', items: ['A1', 'A2', 'A3'] },
    { id: 'B', title: 'Container B', items: ['B1', 'B2', 'B3'] },
    { id: 'C', title: 'Container C', items: ['C1', 'C2', 'C3'] },
  ]);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(useSensor(PointerSensor));
  
  function findContainer(id: string) {
    if (containers.find(c => c.id === id)) {
      return id;
    }
    
    return containers.find(c => c.items.includes(id))?.id;
  }
  
  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }
  
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }
    
    setContainers((containers) => {
      const activeItems = containers.find(c => c.id === activeContainer)!.items;
      const overItems = containers.find(c => c.id === overContainer)!.items;
      
      const activeIndex = activeItems.indexOf(activeId);
      const overIndex = overItems.indexOf(overId);
      
      let newIndex: number;
      if (overId in containers) {
        newIndex = overItems.length + 1;
      } else {
        newIndex = overIndex >= 0 ? overIndex : overItems.length + 1;
      }
      
      return containers.map(container => {
        if (container.id === activeContainer) {
          return {
            ...container,
            items: container.items.filter(item => item !== activeId),
          };
        }
        if (container.id === overContainer) {
          const newItems = [...container.items];
          newItems.splice(newIndex, 0, activeId);
          return {
            ...container,
            items: newItems,
          };
        }
        return container;
      });
    });
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);
    
    if (activeContainer === overContainer) {
      const container = containers.find(c => c.id === activeContainer);
      if (container) {
        const activeIndex = container.items.indexOf(activeId);
        const overIndex = container.items.indexOf(overId);
        
        if (activeIndex !== overIndex) {
          setContainers(containers.map(c =>
            c.id === activeContainer
              ? { ...c, items: arrayMove(c.items, activeIndex, overIndex) }
              : c
          ));
        }
      }
    }
    
    setActiveId(null);
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{ display: 'flex', gap: '16px' }}>
        {containers.map(container => (
          <DroppableContainer key={container.id} container={container} />
        ))}
      </div>
      
      <DragOverlay>
        {activeId ? <div style={{ padding: '8px' }}>{activeId}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}

function DroppableContainer({ container }: { container: Container }) {
  const { setNodeRef } = useDroppable({
    id: container.id,
  });
  
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        padding: '16px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        minHeight: '300px',
      }}
    >
      <h3>{container.title}</h3>
      <SortableContext items={container.items} strategy={verticalListSortingStrategy}>
        {container.items.map(item => (
          <SortableItem key={item} id={item} />
        ))}
      </SortableContext>
    </div>
  );
}
```

## 性能优化

### 虚拟化长列表

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedSortableList() {
  const [items] = useState(
    Array.from({ length: 10000 }, (_, i) => ({ id: `item-${i}`, text: `Item ${i}` }))
  );
  
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  function handleDragEnd(event: DragEndEvent) {
    // 处理拖拽结束
  }
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
        <div style={{ height: virtualizer.getTotalSize() }}>
          <SortableContext items={items}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <SortableItem id={item.id} content={item.text} />
                </div>
              );
            })}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}
```

### 防抖优化

```tsx
function DebouncedDrag() {
  const [items, setItems] = useState([/* ... */]);
  
  const debouncedUpdate = useMemo(
    () =>
      debounce((newItems: typeof items) => {
        // 执行耗时操作，如API调用
        console.log('Saving new order:', newItems);
      }, 500),
    []
  );
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        debouncedUpdate(newItems);
        
        return newItems;
      });
    }
  }
  
  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* ... */}
    </DndContext>
  );
}
```

## 无障碍访问

### 键盘导航

```tsx
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

function AccessibleSortable() {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  return (
    <DndContext sensors={sensors}>
      <SortableContext items={items}>
        {items.map(item => (
          <AccessibleItem key={item.id} {...item} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

function AccessibleItem({ id, content }: { id: string; content: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
      tabIndex={0}
      role="button"
      aria-label={`Draggable item ${content}. Press space to lift.`}
    >
      {content}
    </div>
  );
}
```

### 屏幕阅读器公告

```tsx
import { DndContext, Announcements } from '@dnd-kit/core';

const announcements: Announcements = {
  onDragStart(id) {
    return `Picked up draggable item ${id}.`;
  },
  onDragOver(id, overId) {
    if (overId) {
      return `Draggable item ${id} was moved over droppable area ${overId}.`;
    }
    return `Draggable item ${id} is no longer over a droppable area.`;
  },
  onDragEnd(id, overId) {
    if (overId) {
      return `Draggable item ${id} was dropped over droppable area ${overId}`;
    }
    return `Draggable item ${id} was dropped.`;
  },
  onDragCancel(id) {
    return `Dragging was cancelled. Draggable item ${id} was dropped.`;
  },
};

function AccessibleDnD() {
  return (
    <DndContext accessibility={{ announcements }}>
      {/* ... */}
    </DndContext>
  );
}
```

## 最佳实践总结

### 性能优化

```
✅ 使用DragOverlay避免重渲染
✅ 合理使用传感器激活约束
✅ 虚拟化长列表
✅ 使用useMemo缓存计算
✅ 防抖/节流频繁操作
```

### 用户体验

```
✅ 提供清晰的视觉反馈
✅ 支持多种输入方式
✅ 合理的拖拽约束
✅ 流畅的动画效果
✅ 错误状态处理
```

### 无障碍性

```
✅ 完整的键盘支持
✅ ARIA属性支持
✅ 屏幕阅读器公告
✅ 焦点管理
✅ 语义化HTML
```

dnd-kit作为现代化的拖放解决方案，提供了出色的性能、灵活性和可访问性。掌握其核心概念和最佳实践，你可以构建高质量的拖放交互体验。

