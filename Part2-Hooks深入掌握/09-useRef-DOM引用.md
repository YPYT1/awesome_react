# useRef-DOM引用

## 学习目标

通过本章学习，你将全面掌握：

- useRef的概念和工作原理
- 使用useRef访问DOM元素
- useRef与createRef的区别
- DOM操作的各种场景
- 聚焦、滚动、测量等常见操作
- 第三方库集成
- 性能优化技巧
- React 19中的ref增强

## 第一部分：useRef基础

### 1.1 什么是useRef

useRef返回一个可变的ref对象，其`.current`属性被初始化为传入的参数。返回的ref对象在组件的整个生命周期内保持不变。

```jsx
import { useRef } from 'react';

function BasicUseRef() {
  // 创建ref对象
  const inputRef = useRef(null);
  
  // ref对象的结构
  console.log(inputRef);  // { current: null }
  
  const handleClick = () => {
    // 通过ref访问DOM元素
    console.log(inputRef.current);  // <input> 元素
    
    // 操作DOM
    inputRef.current.focus();
    inputRef.current.select();
  };
  
  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handleClick}>聚焦输入框</button>
    </div>
  );
}
```

### 1.2 useRef vs createRef

```jsx
import { useRef, createRef } from 'react';

function UseRefVsCreateRef() {
  // useRef：在整个组件生命周期中保持同一个引用
  const useRefExample = useRef(null);
  
  // createRef：每次渲染都创建新引用
  const createRefExample = createRef();
  
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('useRef:', useRefExample.current);      // 总是同一个DOM
    console.log('createRef:', createRefExample.current); // 每次可能不同
  });
  
  return (
    <div>
      <input ref={useRefExample} placeholder="useRef" />
      <input ref={createRefExample} placeholder="createRef" />
      <button onClick={() => setCount(c => c + 1)}>
        重新渲染 ({count})
      </button>
    </div>
  );
}

// 结论：函数组件中应该使用useRef，不要使用createRef
```

### 1.3 ref的赋值时机

```jsx
function RefAssignmentTiming() {
  const inputRef = useRef(null);
  
  console.log('1. 渲染阶段，ref.current:', inputRef.current);  // null
  
  useEffect(() => {
    console.log('3. Effect阶段，ref.current:', inputRef.current);  // <input>
  });
  
  useLayoutEffect(() => {
    console.log('2. LayoutEffect阶段，ref.current:', inputRef.current);  // <input>
  });
  
  return <input ref={inputRef} />;
  
  // 执行顺序：
  // 1. 渲染阶段：ref.current = null
  // 2. DOM更新
  // 3. ref赋值：ref.current = <input>
  // 4. useLayoutEffect执行：可以访问ref
  // 5. 浏览器绘制
  // 6. useEffect执行：可以访问ref
}
```

## 第二部分：访问DOM元素

### 2.1 访问单个元素

```jsx
function SingleElementAccess() {
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const selectRef = useRef(null);
  const divRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  const getInputValue = () => {
    console.log('input值:', inputRef.current.value);
  };
  
  const setInputValue = () => {
    inputRef.current.value = '新值';
  };
  
  const clearTextarea = () => {
    textareaRef.current.value = '';
  };
  
  const selectOption = () => {
    selectRef.current.value = 'option2';
  };
  
  const scrollToDiv = () => {
    divRef.current.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div>
      <input ref={inputRef} defaultValue="初始值" />
      <button onClick={focusInput}>聚焦</button>
      <button onClick={getInputValue}>获取值</button>
      <button onClick={setInputValue}>设置值</button>
      
      <textarea ref={textareaRef} defaultValue="文本内容" />
      <button onClick={clearTextarea}>清空</button>
      
      <select ref={selectRef}>
        <option value="option1">选项1</option>
        <option value="option2">选项2</option>
      </select>
      <button onClick={selectOption}>选择选项2</button>
      
      <div ref={divRef} style={{ marginTop: '1000px', height: '100px', background: '#f0f0f0' }}>
        目标区域
      </div>
      <button onClick={scrollToDiv}>滚动到div</button>
    </div>
  );
}
```

### 2.2 访问多个元素

```jsx
function MultipleElementsAccess() {
  // 方法1：多个useRef
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  
  // 方法2：使用数组
  const inputRefs = useRef([]);
  
  // 方法3：使用对象
  const elementRefs = useRef({});
  
  // 方法4：使用Map
  const refMap = useRef(new Map());
  
  const focusAll = () => {
    // 多个ref
    input1Ref.current?.focus();
    input2Ref.current?.focus();
    input3Ref.current?.focus();
    
    // 数组refs
    inputRefs.current.forEach(input => input?.focus());
    
    // 对象refs
    Object.values(elementRefs.current).forEach(el => el?.focus());
    
    // Map refs
    refMap.current.forEach(el => el?.focus());
  };
  
  return (
    <div>
      {/* 多个useRef */}
      <input ref={input1Ref} />
      <input ref={input2Ref} />
      <input ref={input3Ref} />
      
      {/* 数组refs */}
      {[0, 1, 2].map(i => (
        <input
          key={i}
          ref={el => inputRefs.current[i] = el}
        />
      ))}
      
      {/* 对象refs */}
      {['name', 'email', 'phone'].map(field => (
        <input
          key={field}
          ref={el => elementRefs.current[field] = el}
          placeholder={field}
        />
      ))}
      
      {/* Map refs */}
      {['a', 'b', 'c'].map(id => (
        <input
          key={id}
          ref={el => refMap.current.set(id, el)}
        />
      ))}
      
      <button onClick={focusAll}>全部聚焦</button>
    </div>
  );
}
```

### 2.3 动态列表的ref

```jsx
function DynamicListRefs() {
  const [items, setItems] = useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' }
  ]);
  
  const itemRefs = useRef(new Map());
  
  const addItem = () => {
    setItems([...items, {
      id: Date.now(),
      text: `Item ${items.length + 1}`
    }]);
  };
  
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    itemRefs.current.delete(id);
  };
  
  const focusItem = (id) => {
    const element = itemRefs.current.get(id);
    element?.focus();
  };
  
  const scrollToItem = (id) => {
    const element = itemRefs.current.get(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  // 清理不存在的refs
  useEffect(() => {
    const currentIds = new Set(items.map(item => item.id));
    
    itemRefs.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        itemRefs.current.delete(id);
      }
    });
  }, [items]);
  
  return (
    <div>
      <button onClick={addItem}>添加项目</button>
      
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <input
              ref={el => {
                if (el) {
                  itemRefs.current.set(item.id, el);
                } else {
                  itemRefs.current.delete(item.id);
                }
              }}
              defaultValue={item.text}
            />
            <button onClick={() => focusItem(item.id)}>聚焦</button>
            <button onClick={() => scrollToItem(item.id)}>滚动到这里</button>
            <button onClick={() => removeItem(item.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 第三部分：常见DOM操作

### 3.1 聚焦控制

```jsx
function FocusControl() {
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);
  const submitRef = useRef(null);
  
  // 组件挂载时自动聚焦
  useEffect(() => {
    usernameRef.current.focus();
  }, []);
  
  // 按Enter键切换焦点
  const handleUsernameKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current.focus();
    }
  };
  
  const handlePasswordKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitRef.current.focus();
      submitRef.current.click();
    }
  };
  
  // 全选文本
  const selectAll = () => {
    usernameRef.current.select();
  };
  
  // 设置光标位置
  const setCursorPosition = (position) => {
    usernameRef.current.setSelectionRange(position, position);
    usernameRef.current.focus();
  };
  
  return (
    <form onSubmit={e => e.preventDefault()}>
      <input
        ref={usernameRef}
        type="text"
        placeholder="用户名"
        onKeyPress={handleUsernameKeyPress}
      />
      
      <input
        ref={passwordRef}
        type="password"
        placeholder="密码"
        onKeyPress={handlePasswordKeyPress}
      />
      
      <button ref={submitRef} type="submit">
        登录
      </button>
      
      <div>
        <button onClick={selectAll}>全选用户名</button>
        <button onClick={() => setCursorPosition(0)}>光标到开头</button>
        <button onClick={() => setCursorPosition(5)}>光标到位置5</button>
      </div>
    </form>
  );
}
```

### 3.2 滚动控制

```jsx
function ScrollControl() {
  const containerRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  
  // 滚动到顶部
  const scrollToTop = () => {
    containerRef.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // 滚动到底部
  const scrollToBottom = () => {
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  };
  
  // 滚动到指定元素
  const scrollToElement = (ref) => {
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  // 监听滚动位置
  const handleScroll = () => {
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    console.log({
      scrollTop,
      scrollHeight,
      clientHeight,
      atTop: scrollTop === 0,
      atBottom: scrollTop + clientHeight >= scrollHeight - 1
    });
  };
  
  return (
    <div>
      <div className="scroll-controls">
        <button onClick={scrollToTop}>回到顶部</button>
        <button onClick={scrollToBottom}>滚动到底部</button>
        <button onClick={() => scrollToElement(topRef)}>滚动到顶部标记</button>
        <button onClick={() => scrollToElement(bottomRef)}>滚动到底部标记</button>
      </div>
      
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '400px',
          overflow: 'auto',
          border: '1px solid #ccc'
        }}
      >
        <div ref={topRef} style={{ background: '#f0f0f0', padding: '10px' }}>
          顶部标记
        </div>
        
        <div style={{ height: '1500px', padding: '20px' }}>
          <p>很长的内容...</p>
          {Array.from({ length: 50 }, (_, i) => (
            <p key={i}>段落 {i + 1}</p>
          ))}
        </div>
        
        <div ref={bottomRef} style={{ background: '#f0f0f0', padding: '10px' }}>
          底部标记
        </div>
      </div>
    </div>
  );
}
```

### 3.3 元素测量

```jsx
function ElementMeasurement() {
  const boxRef = useRef(null);
  const [dimensions, setDimensions] = useState(null);
  const [position, setPosition] = useState(null);
  
  const measureElement = () => {
    const element = boxRef.current;
    
    // 获取尺寸
    const rect = element.getBoundingClientRect();
    setDimensions({
      width: rect.width,
      height: rect.height,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight
    });
    
    // 获取位置
    setPosition({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      x: rect.x,
      y: rect.y
    });
  };
  
  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      measureElement();
    };
    
    window.addEventListener('resize', handleResize);
    measureElement();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div>
      <div
        ref={boxRef}
        style={{
          width: '300px',
          height: '200px',
          padding: '20px',
          border: '2px solid blue',
          margin: '50px',
          overflow: 'auto'
        }}
      >
        <div style={{ height: '400px' }}>
          测量这个盒子
        </div>
      </div>
      
      <button onClick={measureElement}>测量</button>
      
      {dimensions && (
        <div>
          <h3>尺寸信息：</h3>
          <pre>{JSON.stringify(dimensions, null, 2)}</pre>
        </div>
      )}
      
      {position && (
        <div>
          <h3>位置信息：</h3>
          <pre>{JSON.stringify(position, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### 3.4 样式操作

```jsx
function StyleManipulation() {
  const boxRef = useRef(null);
  
  const changeColor = (color) => {
    boxRef.current.style.backgroundColor = color;
  };
  
  const changeSize = (width, height) => {
    boxRef.current.style.width = width + 'px';
    boxRef.current.style.height = height + 'px';
  };
  
  const addClass = (className) => {
    boxRef.current.classList.add(className);
  };
  
  const removeClass = (className) => {
    boxRef.current.classList.remove(className);
  };
  
  const toggleClass = (className) => {
    boxRef.current.classList.toggle(className);
  };
  
  const setTransform = (transform) => {
    boxRef.current.style.transform = transform;
  };
  
  return (
    <div>
      <div
        ref={boxRef}
        style={{
          width: '200px',
          height: '200px',
          background: 'blue',
          transition: 'all 0.3s'
        }}
      >
        可操作的盒子
      </div>
      
      <div className="controls">
        <button onClick={() => changeColor('red')}>变红色</button>
        <button onClick={() => changeColor('green')}>变绿色</button>
        <button onClick={() => changeSize(300, 300)}>变大</button>
        <button onClick={() => changeSize(100, 100)}>变小</button>
        <button onClick={() => addClass('rounded')}>添加圆角</button>
        <button onClick={() => removeClass('rounded')}>移除圆角</button>
        <button onClick={() => toggleClass('shadow')}>切换阴影</button>
        <button onClick={() => setTransform('rotate(45deg)')}>旋转</button>
        <button onClick={() => setTransform('scale(1.5)')}>缩放</button>
      </div>
    </div>
  );
}
```

## 第四部分：实战场景

### 4.1 自动聚焦搜索框

```jsx
function SearchWithAutoFocus() {
  const searchRef = useRef(null);
  const [results, setResults] = useState([]);
  
  // 组件挂载时自动聚焦
  useEffect(() => {
    searchRef.current.focus();
  }, []);
  
  // 按ESC清空并重新聚焦
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      searchRef.current.value = '';
      searchRef.current.focus();
      setResults([]);
    }
  };
  
  // 执行搜索
  const handleSearch = (e) => {
    const term = e.target.value;
    if (term) {
      performSearch(term).then(setResults);
    } else {
      setResults([]);
    }
  };
  
  return (
    <div className="search-container">
      <input
        ref={searchRef}
        type="search"
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        placeholder="输入搜索词... (ESC清空)"
        autoComplete="off"
      />
      
      <div className="search-results">
        {results.map(result => (
          <div key={result.id}>{result.title}</div>
        ))}
      </div>
    </div>
  );
}
```

### 4.2 滚动到新消息

```jsx
function ChatWindow({ messages }) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  
  // 新消息时滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 检查是否在底部
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const handleScroll = () => {
    const container = containerRef.current;
    const isBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
    setIsAtBottom(isBottom);
  };
  
  // 只有在底部时才自动滚动
  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);
  
  return (
    <div className="chat-window">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="messages-container"
      >
        {messages.map(message => (
          <div key={message.id} className="message">
            <span className="author">{message.author}:</span>
            <span className="text">{message.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {!isAtBottom && (
        <button
          className="scroll-to-bottom"
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          ↓ 回到底部
        </button>
      )}
    </div>
  );
}
```

### 4.3 图片懒加载

```jsx
function LazyImageLoader() {
  const [images] = useState(
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      src: `https://picsum.photos/300/200?random=${i}`,
      alt: `Image ${i}`
    }))
  );
  
  const imageRefs = useRef(new Map());
  const [loadedImages, setLoadedImages] = useState(new Set());
  
  useEffect(() => {
    // 使用Intersection Observer实现懒加载
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            
            if (src && !img.src) {
              img.src = src;
              setLoadedImages(prev => new Set([...prev, img.dataset.id]));
              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '50px'  // 提前50px开始加载
      }
    );
    
    imageRefs.current.forEach(img => {
      if (img) observer.observe(img);
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return (
    <div className="image-grid">
      {images.map(image => (
        <div key={image.id} className="image-container">
          <img
            ref={el => imageRefs.current.set(image.id, el)}
            data-src={image.src}
            data-id={image.id}
            alt={image.alt}
            className={loadedImages.has(String(image.id)) ? 'loaded' : 'loading'}
          />
          {!loadedImages.has(String(image.id)) && (
            <div className="placeholder">加载中...</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### 4.4 Canvas绘图

```jsx
function CanvasDrawing() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 初始化canvas
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);
  
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(
      e.clientX - rect.left,
      e.clientY - rect.top
    );
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  
  const saveImage = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataUrl;
    link.click();
  };
  
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        style={{
          border: '1px solid #000',
          cursor: 'crosshair'
        }}
      />
      
      <div>
        <button onClick={clearCanvas}>清空</button>
        <button onClick={saveImage}>保存</button>
      </div>
    </div>
  );
}
```

### 4.5 视频播放器控制

```jsx
function VideoPlayerControl() {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  const play = () => {
    videoRef.current.play();
    setPlaying(true);
  };
  
  const pause = () => {
    videoRef.current.pause();
    setPlaying(false);
  };
  
  const togglePlay = () => {
    playing ? pause() : play();
  };
  
  const seek = (time) => {
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  const changeVolume = (vol) => {
    videoRef.current.volume = vol;
    setVolume(vol);
  };
  
  const toggleMute = () => {
    videoRef.current.muted = !videoRef.current.muted;
  };
  
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };
  
  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };
  
  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src="/video.mp4"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        width="100%"
      />
      
      <div className="controls">
        <button onClick={togglePlay}>
          {playing ? '⏸' : '▶'}
        </button>
        
        <span className="time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={e => seek(Number(e.target.value))}
          className="seek-bar"
        />
        
        <button onClick={toggleMute}>
          {videoRef.current?.muted ? '🔇' : '🔊'}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={e => changeVolume(Number(e.target.value))}
          className="volume-bar"
        />
        
        <button onClick={toggleFullscreen}>
          ⛶ 全屏
        </button>
      </div>
    </div>
  );
}
```

## 第五部分：第三方库集成

### 5.1 集成富文本编辑器

```jsx
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function QuillEditor({ initialValue, onChange }) {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  
  useEffect(() => {
    // 初始化Quill
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      }
    });
    
    // 设置初始值
    if (initialValue) {
      quillRef.current.root.innerHTML = initialValue;
    }
    
    // 监听变化
    quillRef.current.on('text-change', () => {
      const html = quillRef.current.root.innerHTML;
      onChange?.(html);
    });
    
    return () => {
      quillRef.current = null;
    };
  }, []);
  
  return <div ref={editorRef} />;
}
```

### 5.2 集成图表库

```jsx
import Chart from 'chart.js/auto';

function ChartComponent({ data, type = 'bar' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    
    // 销毁旧图表
    if (chartRef.current) {
      chartRef.current.destroy();
    }
    
    // 创建新图表
    chartRef.current = new Chart(ctx, {
      type,
      data: {
        labels: data.labels,
        datasets: data.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, type]);
  
  return (
    <div style={{ height: '400px' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
```

### 5.3 集成地图库

```jsx
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapComponent({ center, zoom, markers }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  useEffect(() => {
    // 初始化地图
    mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);
    
    // 添加瓦片层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);
    
    return () => {
      mapInstanceRef.current.remove();
    };
  }, []);
  
  // 更新中心点
  useEffect(() => {
    mapInstanceRef.current?.setView(center, zoom);
  }, [center, zoom]);
  
  // 更新标记
  useEffect(() => {
    // 清除旧标记
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // 添加新标记
    markers.forEach(markerData => {
      const marker = L.marker([markerData.lat, markerData.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(markerData.popup);
      
      markersRef.current.push(marker);
    });
  }, [markers]);
  
  return <div ref={mapRef} style={{ height: '500px', width: '100%' }} />;
}
```

## 第六部分：性能优化

### 6.1 避免过度使用ref

```jsx
// ❌ 不好：过度使用ref
function OveruseRef() {
  const textRef = useRef(null);
  
  // 不需要ref，应该用state
  const handleChange = () => {
    const value = textRef.current.value;
    // 每次都要读取DOM
  };
  
  return <input ref={textRef} onChange={handleChange} />;
}

// ✅ 好：合理使用state
function ProperState() {
  const [text, setText] = useState('');
  
  // 直接使用state，更符合React理念
  return <input value={text} onChange={e => setText(e.target.value)} />;
}

// ✅ ref的正确使用场景：
// 1. 聚焦、选择、滚动等DOM操作
// 2. 测量DOM尺寸和位置
// 3. 集成第三方DOM库
// 4. 保存不触发渲染的可变值
```

### 6.2 ref回调的优化

```jsx
function OptimizedRefCallback() {
  const [items, setItems] = useState([]);
  const itemRefs = useRef(new Map());
  
  // ❌ 不好：每次渲染创建新函数
  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          ref={el => {
            if (el) {
              itemRefs.current.set(item.id, el);
            }
          }}
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
  
  // ✅ 好：使用useCallback
  const setItemRef = useCallback((id) => {
    return (el) => {
      if (el) {
        itemRefs.current.set(id, el);
      } else {
        itemRefs.current.delete(id);
      }
    };
  }, []);
  
  return (
    <ul>
      {items.map(item => (
        <li key={item.id} ref={setItemRef(item.id)}>
          {item.text}
        </li>
      ))}
    </ul>
  );
}
```

## 第七部分：React 19增强

### 7.1 ref作为prop

```jsx
// React 19：ref可以作为普通prop传递
function MyInput({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// 使用
function Parent() {
  const inputRef = useRef(null);
  
  return (
    <div>
      <MyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>
        聚焦
      </button>
    </div>
  );
}

// React 18及之前需要forwardRef
const MyInputOld = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

### 7.2 ref清理函数

```jsx
// React 19：ref回调支持返回清理函数
function RefCleanup() {
  const [items, setItems] = useState([]);
  
  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          ref={el => {
            if (el) {
              console.log('元素挂载:', item.id);
              
              // 返回清理函数
              return () => {
                console.log('元素卸载:', item.id);
              };
            }
          }}
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
}
```

## 练习题

### 基础练习

1. 使用useRef实现输入框的自动聚焦
2. 创建一个滚动到顶部/底部的功能
3. 测量一个元素的尺寸和位置
4. 实现一个简单的视频播放器控制

### 进阶练习

1. 实现一个聊天窗口，新消息自动滚动到底部
2. 创建一个图片懒加载组件
3. 集成一个第三方富文本编辑器
4. 实现一个Canvas绘图应用

### 高级练习

1. 实现一个虚拟滚动列表，使用ref优化性能
2. 创建一个复杂的表单，使用ref管理多个输入
3. 集成多个第三方库，正确管理ref生命周期
4. 使用React 19的新ref特性优化代码

通过本章学习，你已经全面掌握了useRef访问DOM的各种技巧。useRef是React中操作DOM的主要方式，掌握它对集成第三方库和实现复杂交互非常重要。继续学习，探索useRef的更多用法！

