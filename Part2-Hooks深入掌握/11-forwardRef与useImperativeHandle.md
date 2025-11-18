# forwardRef与useImperativeHandle

## 学习目标

通过本章学习,你将全面掌握:

- forwardRef的核心概念和应用
- ref转发的工作原理
- useImperativeHandle的作用机制
- 自定义ref暴露方法的最佳实践
- forwardRef在组件库中的应用
- ref回调函数的高级用法
- TypeScript中的ref类型定义
- React 19中ref处理的简化
- forwardRef与useImperativeHandle的组合模式

## 第一部分:forwardRef核心概念

### 1.1 为什么需要forwardRef

```jsx
import { useRef, forwardRef } from 'react';

// 问题演示:函数组件不能直接接收ref
function MyInput(props) {
  return <input {...props} />;
}

function ProblemDemo() {
  const inputRef = useRef(null);
  
  return (
    <div>
      {/* 警告: Function components cannot be given refs */}
      <MyInput ref={inputRef} />
      <button onClick={() => inputRef.current?.focus()}>
        聚焦输入框
      </button>
    </div>
  );
}

// 问题原因:
// 1. 函数组件没有实例,不像类组件有this
// 2. ref是React的特殊prop,不会传递给组件
// 3. 直接传递ref会被React忽略并警告

// 解决方案:使用forwardRef
const MyInputForwarded = forwardRef((props, ref) => {
  // ref作为第二个参数传入
  return <input ref={ref} {...props} />;
});

function SolutionDemo() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current?.focus();
  };
  
  const selectAll = () => {
    inputRef.current?.select();
  };
  
  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  
  return (
    <div>
      <MyInputForwarded
        ref={inputRef}
        placeholder="这是一个转发了ref的输入框"
      />
      <div>
        <button onClick={focusInput}>聚焦</button>
        <button onClick={selectAll}>全选</button>
        <button onClick={clearInput}>清空</button>
      </div>
    </div>
  );
}
```

### 1.2 forwardRef的基本语法

```jsx
// 基本语法
const Component = forwardRef((props, ref) => {
  // props: 组件的所有props
  // ref: 从父组件传递的ref
  
  return <div ref={ref}>内容</div>;
});

// 带显示名称
const NamedComponent = forwardRef(function MyComponent(props, ref) {
  return <div ref={ref}>内容</div>;
});

// 设置displayName(调试用)
const DisplayNameComponent = forwardRef((props, ref) => {
  return <div ref={ref}>内容</div>;
});
DisplayNameComponent.displayName = 'DisplayNameComponent';

// 完整示例:自定义输入框
const CustomInput = forwardRef(function CustomInput(
  { label, error, ...props },
  ref
) {
  return (
    <div className="custom-input">
      {label && <label>{label}</label>}
      <input
        ref={ref}
        className={error ? 'error' : ''}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

// 使用自定义输入框
function FormWithCustomInput() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Name:', nameRef.current.value);
    console.log('Email:', emailRef.current.value);
  };
  
  const focusFirstEmpty = () => {
    if (!nameRef.current.value) {
      nameRef.current.focus();
    } else if (!emailRef.current.value) {
      emailRef.current.focus();
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CustomInput
        ref={nameRef}
        label="姓名"
        placeholder="请输入姓名"
      />
      
      <CustomInput
        ref={emailRef}
        label="邮箱"
        type="email"
        placeholder="请输入邮箱"
      />
      
      <button type="submit">提交</button>
      <button type="button" onClick={focusFirstEmpty}>
        聚焦第一个空字段
      </button>
    </form>
  );
}
```

### 1.3 ref转发的工作原理

```jsx
// ref转发链条
function RefForwardingChain() {
  const finalInputRef = useRef(null);
  
  return (
    <div>
      {/* 
        ref转发链:
        Parent (finalInputRef)
          ↓
        Container (转发ref)
          ↓
        Wrapper (转发ref)
          ↓
        Input (最终接收ref)
      */}
      <Container ref={finalInputRef} />
      <button onClick={() => finalInputRef.current?.focus()}>
        聚焦最内层输入框
      </button>
    </div>
  );
}

const Container = forwardRef((props, ref) => {
  console.log('Container收到ref');
  return <Wrapper ref={ref} {...props} />;
});

const Wrapper = forwardRef((props, ref) => {
  console.log('Wrapper收到ref');
  return (
    <div className="wrapper">
      <Input ref={ref} {...props} />
    </div>
  );
});

const Input = forwardRef((props, ref) => {
  console.log('Input收到ref');
  return <input ref={ref} {...props} />;
});

// 多ref管理
const MultiRefComponent = forwardRef((props, externalRef) => {
  // 内部也需要使用ref
  const internalRef = useRef(null);
  
  useEffect(() => {
    // 内部逻辑使用internalRef
    console.log('内部ref:', internalRef.current);
  }, []);
  
  // 同时支持外部ref
  useEffect(() => {
    if (typeof externalRef === 'function') {
      externalRef(internalRef.current);
    } else if (externalRef) {
      externalRef.current = internalRef.current;
    }
  }, [externalRef]);
  
  return <input ref={internalRef} {...props} />;
});
```

## 第二部分:useImperativeHandle详解

### 2.1 useImperativeHandle的作用

```jsx
import { forwardRef, useRef, useImperativeHandle } from 'react';

// 不使用useImperativeHandle:暴露整个DOM元素
const InputWithoutImperative = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

function ParentWithoutImperative() {
  const inputRef = useRef(null);
  
  const handleClick = () => {
    // 可以访问input的所有方法和属性
    inputRef.current.focus();
    inputRef.current.select();
    inputRef.current.value = 'Modified directly';  // 直接修改DOM
    inputRef.current.style.color = 'red';  // 直接修改样式
    // 问题:父组件可以完全控制DOM,破坏了封装性
  };
  
  return (
    <div>
      <InputWithoutImperative ref={inputRef} />
      <button onClick={handleClick}>操作</button>
    </div>
  );
}

// 使用useImperativeHandle:只暴露特定方法
const InputWithImperative = forwardRef((props, ref) => {
  const internalRef = useRef(null);
  
  // 只暴露focus和clear方法
  useImperativeHandle(ref, () => ({
    focus: () => {
      internalRef.current?.focus();
    },
    clear: () => {
      if (internalRef.current) {
        internalRef.current.value = '';
      }
    }
  }), []);
  
  return <input ref={internalRef} {...props} />;
});

function ParentWithImperative() {
  const inputRef = useRef(null);
  
  const handleClick = () => {
    // 只能使用暴露的方法
    inputRef.current.focus();  // ✅ 可以
    inputRef.current.clear();  // ✅ 可以
    // inputRef.current.select();  // ❌ 不可以,未暴露
    // inputRef.current.value = '';  // ❌ 不可以,没有直接访问DOM
  };
  
  return (
    <div>
      <InputWithImperative ref={inputRef} />
      <button onClick={handleClick}>操作</button>
    </div>
  );
}
```

### 2.2 useImperativeHandle的语法

```jsx
// 基本语法
useImperativeHandle(ref, createHandle, dependencies);

// 参数说明:
// ref: forwardRef传入的ref
// createHandle: 返回要暴露的方法对象的函数
// dependencies: 依赖数组(可选,默认每次渲染都重新创建)

// 完整示例
const AdvancedInput = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  
  useImperativeHandle(
    ref,
    () => ({
      // 暴露的方法
      focus: () => {
        inputRef.current?.focus();
      },
      blur: () => {
        inputRef.current?.blur();
      },
      getValue: () => {
        return value;
      },
      setValue: (newValue) => {
        setValue(newValue);
      },
      clear: () => {
        setValue('');
      },
      selectAll: () => {
        inputRef.current?.select();
      },
      insertText: (text) => {
        setValue(prev => prev + text);
      }
    }),
    [value]  // 依赖value,当value变化时重新创建handle
  );
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => setValue(e.target.value)}
      {...props}
    />
  );
});

// 使用
function AdvancedInputUsage() {
  const inputRef = useRef(null);
  
  return (
    <div>
      <AdvancedInput ref={inputRef} placeholder="高级输入框" />
      
      <div>
        <button onClick={() => inputRef.current?.focus()}>
          聚焦
        </button>
        <button onClick={() => inputRef.current?.blur()}>
          失焦
        </button>
        <button onClick={() => inputRef.current?.selectAll()}>
          全选
        </button>
        <button onClick={() => inputRef.current?.clear()}>
          清空
        </button>
        <button onClick={() => inputRef.current?.insertText('Hello')}>
          插入文本
        </button>
        <button onClick={() => {
          const value = inputRef.current?.getValue();
          alert(`当前值: ${value}`);
        }}>
          获取值
        </button>
      </div>
    </div>
  );
}
```

### 2.3 暴露的方法设计

```jsx
// 设计1:只暴露操作方法,不暴露状态
const ReadOnlyInput = forwardRef((props, ref) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => setValue(''),
    // 不暴露getValue,父组件无法直接读取值
    // 父组件需要通过onChange回调获取值
  }), []);
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => {
        setValue(e.target.value);
        props.onChange?.(e);
      }}
    />
  );
});

// 设计2:暴露读写方法
const ReadWriteInput = forwardRef((props, ref) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    // 读方法
    getValue: () => value,
    isEmpty: () => value.trim() === '',
    getLength: () => value.length,
    
    // 写方法
    setValue: (newValue) => setValue(newValue),
    clear: () => setValue(''),
    append: (text) => setValue(prev => prev + text),
    
    // DOM操作
    focus: () => inputRef.current?.focus(),
    select: () => inputRef.current?.select()
  }), [value]);
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => setValue(e.target.value)}
      {...props}
    />
  );
});

// 设计3:暴露验证方法
const ValidatedInput = forwardRef((props, ref) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    // 验证方法
    validate: () => {
      if (!value) {
        setError('不能为空');
        return false;
      }
      if (value.length < 3) {
        setError('至少3个字符');
        return false;
      }
      setError('');
      return true;
    },
    
    // 获取状态
    getValue: () => value,
    hasError: () => !!error,
    getError: () => error,
    
    // 操作方法
    focus: () => inputRef.current?.focus(),
    clear: () => {
      setValue('');
      setError('');
    }
  }), [value, error]);
  
  return (
    <div className="validated-input">
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        className={error ? 'error' : ''}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

// 使用验证输入框
function FormWithValidation() {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证所有字段
    const nameValid = nameRef.current?.validate();
    const emailValid = emailRef.current?.validate();
    const passwordValid = passwordRef.current?.validate();
    
    if (nameValid && emailValid && passwordValid) {
      // 获取所有值
      const formData = {
        name: nameRef.current.getValue(),
        email: emailRef.current.getValue(),
        password: passwordRef.current.getValue()
      };
      
      console.log('提交表单:', formData);
    } else {
      // 聚焦第一个错误字段
      if (!nameValid) {
        nameRef.current?.focus();
      } else if (!emailValid) {
        emailRef.current?.focus();
      } else if (!passwordValid) {
        passwordRef.current?.focus();
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <ValidatedInput
        ref={nameRef}
        placeholder="姓名"
      />
      
      <ValidatedInput
        ref={emailRef}
        type="email"
        placeholder="邮箱"
      />
      
      <ValidatedInput
        ref={passwordRef}
        type="password"
        placeholder="密码"
      />
      
      <button type="submit">提交</button>
    </form>
  );
}
```

## 第三部分:高级应用模式

### 3.1 多ref组合

```jsx
// 组件同时需要内部ref和外部ref
const DualRefComponent = forwardRef((props, externalRef) => {
  const internalRef = useRef(null);
  
  // 内部使用internalRef
  useEffect(() => {
    console.log('内部ref:', internalRef.current);
    // 内部逻辑...
  }, []);
  
  // 暴露给外部
  useImperativeHandle(externalRef, () => ({
    focus: () => internalRef.current?.focus(),
    getElement: () => internalRef.current
  }), []);
  
  return <input ref={internalRef} {...props} />;
});

// 合并多个ref
function useCombinedRefs(...refs) {
  return useCallback((element) => {
    refs.forEach(ref => {
      if (!ref) return;
      
      if (typeof ref === 'function') {
        ref(element);
      } else {
        ref.current = element;
      }
    });
  }, refs);
}

// 使用合并的ref
const CombinedRefComponent = forwardRef((props, externalRef) => {
  const internalRef = useRef(null);
  const combinedRef = useCombinedRefs(internalRef, externalRef);
  
  useEffect(() => {
    // 两个ref都可以使用
    console.log('内部ref:', internalRef.current);
  }, []);
  
  return <input ref={combinedRef} {...props} />;
});
```

### 3.2 条件ref转发

```jsx
// 根据条件决定ref转发目标
const ConditionalRefForward = forwardRef(({ type, ...props }, ref) => {
  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  
  useImperativeHandle(ref, () => {
    const targetRef = type === 'textarea' ? textareaRef : inputRef;
    
    return {
      focus: () => targetRef.current?.focus(),
      getValue: () => targetRef.current?.value || '',
      setValue: (value) => {
        if (targetRef.current) {
          targetRef.current.value = value;
        }
      }
    };
  }, [type]);
  
  if (type === 'textarea') {
    return <textarea ref={textareaRef} {...props} />;
  }
  
  return <input ref={inputRef} {...props} />;
});

// 使用
function ConditionalRefUsage() {
  const [inputType, setInputType] = useState('input');
  const ref = useRef(null);
  
  return (
    <div>
      <select value={inputType} onChange={e => setInputType(e.target.value)}>
        <option value="input">Input</option>
        <option value="textarea">Textarea</option>
      </select>
      
      <ConditionalRefForward ref={ref} type={inputType} />
      
      <button onClick={() => ref.current?.focus()}>
        聚焦
      </button>
      <button onClick={() => ref.current?.setValue('Hello')}>
        设置值
      </button>
    </div>
  );
}
```

### 3.3 ref回调函数

```jsx
// 使用回调函数形式的ref
function CallbackRefExample() {
  const [height, setHeight] = useState(0);
  
  // ref回调函数
  const measureRef = useCallback((element) => {
    if (element) {
      console.log('元素挂载:', element);
      setHeight(element.getBoundingClientRect().height);
    } else {
      console.log('元素卸载');
      setHeight(0);
    }
  }, []);
  
  return (
    <div>
      <div ref={measureRef} style={{ padding: '20px', background: '#f0f0f0' }}>
        <p>这个div的高度会被测量</p>
        <p>可以添加更多内容改变高度</p>
      </div>
      <p>测量的高度: {height}px</p>
    </div>
  );
}

// forwardRef with callback ref
const MeasurableComponent = forwardRef((props, ref) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const internalRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    measure: () => {
      if (internalRef.current) {
        const rect = internalRef.current.getBoundingClientRect();
        const dims = {
          width: rect.width,
          height: rect.height
        };
        setDimensions(dims);
        return dims;
      }
      return null;
    },
    getDimensions: () => dimensions,
    getElement: () => internalRef.current
  }), [dimensions]);
  
  return (
    <div ref={internalRef} {...props}>
      <p>宽度: {dimensions.width}px</p>
      <p>高度: {dimensions.height}px</p>
      {props.children}
    </div>
  );
});
```

## 第四部分:实战案例

### 4.1 Modal组件

```jsx
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

const Modal = forwardRef(({ title, children, onClose }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      onClose?.();
    },
    toggle: () => {
      setIsOpen(prev => !prev);
    },
    isOpen: () => isOpen,
    focusContent: () => {
      contentRef.current?.focus();
    }
  }), [isOpen, onClose]);
  
  useEffect(() => {
    if (isOpen) {
      // 打开时聚焦内容
      contentRef.current?.focus();
      
      // 禁止body滚动
      document.body.style.overflow = 'hidden';
      
      // ESC键关闭
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          onClose?.();
        }
      };
      
      window.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={() => {
      setIsOpen(false);
      onClose?.();
    }}>
      <div
        ref={contentRef}
        className="modal-content"
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            className="close-button"
            onClick={() => {
              setIsOpen(false);
              onClose?.();
            }}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

// 使用Modal
function ModalUsage() {
  const modalRef = useRef(null);
  const confirmModalRef = useRef(null);
  
  const handleAction = () => {
    // 使用暴露的方法
    modalRef.current?.close();
    confirmModalRef.current?.open();
  };
  
  return (
    <div>
      <button onClick={() => modalRef.current?.open()}>
        打开模态框
      </button>
      
      <Modal ref={modalRef} title="信息">
        <p>这是模态框内容</p>
        <button onClick={handleAction}>
          执行操作
        </button>
      </Modal>
      
      <Modal ref={confirmModalRef} title="确认" onClose={() => console.log('已关闭')}>
        <p>确认要执行此操作吗?</p>
        <div>
          <button onClick={() => {
            console.log('已确认');
            confirmModalRef.current?.close();
          }}>
            确认
          </button>
          <button onClick={() => confirmModalRef.current?.close()}>
            取消
          </button>
        </div>
      </Modal>
    </div>
  );
}
```

### 4.2 Video播放器组件

```jsx
const VideoPlayer = forwardRef(({ src, poster, onTimeUpdate, onEnded }, ref) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  
  useImperativeHandle(ref, () => ({
    // 播放控制
    play: async () => {
      try {
        await videoRef.current?.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('播放失败:', err);
      }
    },
    pause: () => {
      videoRef.current?.pause();
      setIsPlaying(false);
    },
    stop: () => {
      videoRef.current?.pause();
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
    },
    togglePlay: async () => {
      if (isPlaying) {
        videoRef.current?.pause();
        setIsPlaying(false);
      } else {
        try {
          await videoRef.current?.play();
          setIsPlaying(true);
        } catch (err) {
          console.error('播放失败:', err);
        }
      }
    },
    
    // 时间控制
    seek: (time) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(0, Math.min(time, duration));
        setCurrentTime(videoRef.current.currentTime);
      }
    },
    skipForward: (seconds = 10) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.min(
          videoRef.current.currentTime + seconds,
          duration
        );
      }
    },
    skipBackward: (seconds = 10) => {
      if (videoRef.current) {
        videoRef.current.currentTime = Math.max(
          videoRef.current.currentTime - seconds,
          0
        );
      }
    },
    
    // 音量控制
    setVolume: (vol) => {
      if (videoRef.current) {
        videoRef.current.volume = Math.max(0, Math.min(vol, 1));
        setVolume(videoRef.current.volume);
      }
    },
    mute: () => {
      if (videoRef.current) {
        videoRef.current.muted = true;
        setMuted(true);
      }
    },
    unmute: () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        setMuted(false);
      }
    },
    toggleMute: () => {
      if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setMuted(videoRef.current.muted);
      }
    },
    
    // 获取状态
    isPlaying: () => isPlaying,
    getCurrentTime: () => currentTime,
    getDuration: () => duration,
    getVolume: () => volume,
    isMuted: () => muted,
    
    // 获取原始元素
    getVideoElement: () => videoRef.current
  }), [isPlaying, currentTime, duration, volume, muted]);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onTimeUpdate, onEnded]);
  
  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
      />
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

// 使用VideoPlayer
function VideoPlayerController() {
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  
  return (
    <div>
      <VideoPlayer
        ref={playerRef}
        src="/video.mp4"
        onTimeUpdate={setCurrentTime}
      />
      
      <div className="controls">
        <button onClick={() => playerRef.current?.togglePlay()}>
          播放/暂停
        </button>
        <button onClick={() => playerRef.current?.stop()}>
          停止
        </button>
        <button onClick={() => playerRef.current?.skipBackward(10)}>
          后退10秒
        </button>
        <button onClick={() => playerRef.current?.skipForward(10)}>
          前进10秒
        </button>
        <button onClick={() => playerRef.current?.toggleMute()}>
          静音
        </button>
      </div>
      
      <div className="info">
        <p>当前时间: {currentTime.toFixed(2)}秒</p>
        <p>总时长: {playerRef.current?.getDuration().toFixed(2)}秒</p>
      </div>
    </div>
  );
}
```

### 4.3 Form组件

```jsx
const Form = forwardRef(({ onSubmit, children }, ref) => {
  const formRef = useRef(null);
  const fieldsRef = useRef(new Map());
  
  useImperativeHandle(ref, () => ({
    // 注册字段
    registerField: (name, fieldRef) => {
      fieldsRef.current.set(name, fieldRef);
    },
    
    // 注销字段
    unregisterField: (name) => {
      fieldsRef.current.delete(name);
    },
    
    // 验证所有字段
    validateAll: () => {
      let isValid = true;
      const errors = {};
      
      fieldsRef.current.forEach((fieldRef, name) => {
        if (fieldRef.current?.validate) {
          const valid = fieldRef.current.validate();
          if (!valid) {
            isValid = false;
            errors[name] = fieldRef.current.getError?.() || '验证失败';
          }
        }
      });
      
      return { isValid, errors };
    },
    
    // 获取所有值
    getValues: () => {
      const values = {};
      
      fieldsRef.current.forEach((fieldRef, name) => {
        if (fieldRef.current?.getValue) {
          values[name] = fieldRef.current.getValue();
        }
      });
      
      return values;
    },
    
    // 设置所有值
    setValues: (values) => {
      Object.entries(values).forEach(([name, value]) => {
        const fieldRef = fieldsRef.current.get(name);
        if (fieldRef?.current?.setValue) {
          fieldRef.current.setValue(value);
        }
      });
    },
    
    // 重置所有字段
    reset: () => {
      fieldsRef.current.forEach((fieldRef) => {
        fieldRef.current?.clear?.();
      });
    },
    
    // 聚焦第一个错误字段
    focusFirstError: () => {
      for (const [name, fieldRef] of fieldsRef.current) {
        if (fieldRef.current?.hasError?.()) {
          fieldRef.current?.focus?.();
          break;
        }
      }
    },
    
    // 提交表单
    submit: () => {
      formRef.current?.requestSubmit();
    }
  }), []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { isValid, errors } = ref.current?.validateAll() || { isValid: false, errors: {} };
    
    if (isValid) {
      const values = ref.current?.getValues() || {};
      onSubmit?.(values);
    } else {
      console.error('表单验证失败:', errors);
      ref.current?.focusFirstError();
    }
  };
  
  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {children}
    </form>
  );
});

// Field组件
const Field = forwardRef(({ name, label, required, minLength }, ref) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const formRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    validate: () => {
      if (required && !value) {
        setError('此字段必填');
        return false;
      }
      if (minLength && value.length < minLength) {
        setError(`至少${minLength}个字符`);
        return false;
      }
      setError('');
      return true;
    },
    getValue: () => value,
    setValue: (newValue) => setValue(newValue),
    clear: () => {
      setValue('');
      setError('');
    },
    hasError: () => !!error,
    getError: () => error,
    focus: () => inputRef.current?.focus()
  }), [value, error, required, minLength]);
  
  // 注册到表单
  useEffect(() => {
    // 向上查找Form组件并注册
    // 这里简化处理,实际应该使用Context
    return () => {
      // 组件卸载时注销
    };
  }, [name]);
  
  return (
    <div className="field">
      <label>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
});

// 使用Form和Field
function FormUsage() {
  const formRef = useRef(null);
  
  const handleSubmit = (values) => {
    console.log('表单提交:', values);
    alert(`提交成功!\n${JSON.stringify(values, null, 2)}`);
  };
  
  const handleReset = () => {
    formRef.current?.reset();
  };
  
  const handleFill = () => {
    formRef.current?.setValues({
      name: 'Alice',
      email: 'alice@example.com',
      password: '123456'
    });
  };
  
  return (
    <div>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <Field
          name="name"
          label="姓名"
          required
          minLength={3}
        />
        
        <Field
          name="email"
          label="邮箱"
          type="email"
          required
        />
        
        <Field
          name="password"
          label="密码"
          type="password"
          required
          minLength={6}
        />
        
        <div className="form-actions">
          <button type="submit">提交</button>
          <button type="button" onClick={handleReset}>
            重置
          </button>
          <button type="button" onClick={handleFill}>
            填充示例数据
          </button>
        </div>
      </Form>
    </div>
  );
}
```

### 4.4 Carousel组件

```jsx
const Carousel = forwardRef(({ items, autoPlay = false, interval = 3000 }, ref) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    next: () => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    },
    prev: () => {
      setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
    },
    goTo: (index) => {
      if (index >= 0 && index < items.length) {
        setCurrentIndex(index);
      }
    },
    getCurrentIndex: () => currentIndex,
    getItemCount: () => items.length,
    startAutoPlay: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % items.length);
      }, interval);
    },
    stopAutoPlay: () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }), [currentIndex, items.length, interval]);
  
  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % items.length);
      }, interval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoPlay, interval, items.length]);
  
  return (
    <div className="carousel" ref={containerRef}>
      <div className="carousel-items">
        {items.map((item, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
            style={{
              transform: `translateX(-${currentIndex * 100}%)`
            }}
          >
            {item}
          </div>
        ))}
      </div>
      
      <div className="carousel-indicators">
        {items.map((_, index) => (
          <button
            key={index}
            className={index === currentIndex ? 'active' : ''}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
});

Carousel.displayName = 'Carousel';

// 使用Carousel
function CarouselUsage() {
  const carouselRef = useRef(null);
  
  const items = [
    <div className="slide">幻灯片 1</div>,
    <div className="slide">幻灯片 2</div>,
    <div className="slide">幻灯片 3</div>
  ];
  
  return (
    <div>
      <Carousel ref={carouselRef} items={items} autoPlay interval={2000} />
      
      <div className="controls">
        <button onClick={() => carouselRef.current?.prev()}>
          上一张
        </button>
        <button onClick={() => carouselRef.current?.next()}>
          下一张
        </button>
        <button onClick={() => carouselRef.current?.goTo(0)}>
          回到第一张
        </button>
        <button onClick={() => carouselRef.current?.stopAutoPlay()}>
          停止自动播放
        </button>
        <button onClick={() => carouselRef.current?.startAutoPlay()}>
          开始自动播放
        </button>
      </div>
      
      <p>
        当前: {(carouselRef.current?.getCurrentIndex() ?? 0) + 1} / {items.length}
      </p>
    </div>
  );
}
```

## 第五部分:TypeScript支持

### 5.1 forwardRef的类型定义

```typescript
import { forwardRef, useRef, useImperativeHandle, Ref, ForwardedRef } from 'react';

// 基本类型
interface InputProps {
  label?: string;
  placeholder?: string;
}

const TypedInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, placeholder, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} placeholder={placeholder} {...props} />
      </div>
    );
  }
);

// 使用
function TypedInputUsage() {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    inputRef.current?.focus();  // 完全类型安全
  };
  
  return (
    <div>
      <TypedInput ref={inputRef} label="用户名" />
      <button onClick={handleClick}>聚焦</button>
    </div>
  );
}
```

### 5.2 useImperativeHandle的类型

```typescript
// 定义暴露的方法接口
interface InputHandle {
  focus: () => void;
  blur: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  clear: () => void;
}

interface InputProps {
  label?: string;
  defaultValue?: string;
}

const TypedImperativeInput = forwardRef<InputHandle, InputProps>(
  ({ label, defaultValue = '' }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState(defaultValue);
    
    useImperativeHandle(
      ref,
      (): InputHandle => ({
        focus: () => {
          inputRef.current?.focus();
        },
        blur: () => {
          inputRef.current?.blur();
        },
        getValue: () => {
          return value;
        },
        setValue: (newValue: string) => {
          setValue(newValue);
        },
        clear: () => {
          setValue('');
        }
      }),
      [value]
    );
    
    return (
      <div>
        {label && <label>{label}</label>}
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
        />
      </div>
    );
  }
);

// 使用
function TypedImperativeUsage() {
  const inputRef = useRef<InputHandle>(null);
  
  const handleClick = () => {
    inputRef.current?.focus();  // ✅ 类型安全
    const value = inputRef.current?.getValue();  // ✅ 类型推断
    console.log('Value:', value);
  };
  
  return (
    <div>
      <TypedImperativeInput ref={inputRef} label="姓名" />
      <button onClick={handleClick}>操作</button>
    </div>
  );
}
```

### 5.3 复杂类型定义

```typescript
// 泛型forwardRef组件
interface ListHandle<T> {
  getItems: () => T[];
  addItem: (item: T) => void;
  removeItem: (id: string | number) => void;
  clear: () => void;
  getItemCount: () => number;
}

interface ListProps<T> {
  initialItems?: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

const List = forwardRef(function List<T>(
  { initialItems = [], renderItem, keyExtractor }: ListProps<T>,
  ref: ForwardedRef<ListHandle<T>>
) {
  const [items, setItems] = useState<T[]>(initialItems);
  
  useImperativeHandle(
    ref,
    (): ListHandle<T> => ({
      getItems: () => items,
      addItem: (item: T) => {
        setItems(prev => [...prev, item]);
      },
      removeItem: (id: string | number) => {
        setItems(prev => prev.filter(item => keyExtractor(item) !== id));
      },
      clear: () => {
        setItems([]);
      },
      getItemCount: () => items.length
    }),
    [items, keyExtractor]
  );
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={keyExtractor(item)}>
          {renderItem(item, index)}
        </li>
      ))}
    </ul>
  );
}) as <T>(
  props: ListProps<T> & { ref?: ForwardedRef<ListHandle<T>> }
) => JSX.Element;

// 使用泛型List
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoListUsage() {
  const listRef = useRef<ListHandle<Todo>>(null);
  
  const addTodo = () => {
    listRef.current?.addItem({
      id: Date.now(),
      text: '新任务',
      completed: false
    });
  };
  
  return (
    <div>
      <List<Todo>
        ref={listRef}
        renderItem={(todo) => (
          <div>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => {}}
            />
            <span>{todo.text}</span>
          </div>
        )}
        keyExtractor={todo => todo.id}
      />
      
      <button onClick={addTodo}>添加任务</button>
      <button onClick={() => listRef.current?.clear()}>清空</button>
    </div>
  );
}
```

## 第六部分:性能优化

### 6.1 避免不必要的重新创建

```jsx
// ❌ 问题:每次渲染都创建新的handle对象
const BadImperative = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus()
  }));  // 没有依赖数组,每次渲染都重新创建
  
  return <input ref={inputRef} />;
});

// ✅ 解决:使用空依赖数组
const GoodImperative = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus()
  }), []);  // 空依赖,只创建一次
  
  return <input ref={inputRef} />;
});

// 有依赖的情况
const DependentImperative = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    getValue: () => value,  // 依赖value
    setValue: (newValue) => setValue(newValue)  // 修改value
  }), [value]);  // 只在value变化时重新创建
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => setValue(e.target.value)}
    />
  );
});
```

### 6.2 memo与forwardRef结合

```jsx
import { memo, forwardRef } from 'react';

// 组合使用memo和forwardRef
const MemoizedInput = memo(
  forwardRef((props, ref) => {
    console.log('MemoizedInput渲染');
    
    return <input ref={ref} {...props} />;
  })
);

MemoizedInput.displayName = 'MemoizedInput';

// 使用
function MemoizedInputUsage() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>增加Count</button>
      
      {/* MemoizedInput不会因为count变化而重新渲染 */}
      <MemoizedInput
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      
      <button onClick={() => inputRef.current?.focus()}>
        聚焦输入框
      </button>
    </div>
  );
}

// 自定义比较函数
const MemoizedWithCompare = memo(
  forwardRef((props, ref) => {
    return <input ref={ref} {...props} />;
  }),
  (prevProps, nextProps) => {
    // 返回true表示不重新渲染
    return prevProps.value === nextProps.value;
  }
);
```

## 第七部分:React 19增强

### 7.1 ref作为prop(React 19)

```jsx
// React 19简化:ref可以直接作为prop传递

// 旧方式(React 18及之前)
const OldWayInput = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// 新方式(React 19)
function NewWayInput({ ref, ...props }) {
  // ref直接作为普通prop
  return <input ref={ref} {...props} />;
}

// 使用
function React19RefUsage() {
  const inputRef = useRef(null);
  
  return (
    <div>
      {/* 两种方式都可以 */}
      <OldWayInput ref={inputRef} />
      <NewWayInput ref={inputRef} />
      
      <button onClick={() => inputRef.current?.focus()}>
        聚焦
      </button>
    </div>
  );
}

// React 19中不再需要forwardRef
function SimpleComponent({ ref, children }) {
  return <div ref={ref}>{children}</div>;
}

// 但对于需要useImperativeHandle的情况,仍然有用
const CustomHandleComponent = forwardRef((props, ref) => {
  const internalRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => internalRef.current?.focus(),
    getElement: () => internalRef.current
  }), []);
  
  return <div ref={internalRef}>{props.children}</div>;
});
```

### 7.2 ref cleanup function

```jsx
// React 19: ref cleanup支持
function CleanupRefExample() {
  const [show, setShow] = useState(true);
  
  const refCallback = (element) => {
    if (element) {
      console.log('元素挂载:', element);
      element.style.background = 'lightblue';
      
      // React 19: 返回清理函数
      return () => {
        console.log('元素卸载,执行清理');
        element.style.background = '';
      };
    }
  };
  
  return (
    <div>
      <button onClick={() => setShow(!show)}>切换</button>
      {show && <div ref={refCallback}>带清理函数的ref</div>}
    </div>
  );
}

// forwardRef with cleanup
const CleanupComponent = forwardRef((props, ref) => {
  const internalRef = useRef(null);
  
  useImperativeHandle(ref, () => {
    const handle = {
      focus: () => internalRef.current?.focus(),
      highlight: () => {
        if (internalRef.current) {
          internalRef.current.style.background = 'yellow';
        }
      }
    };
    
    // React 19: 返回清理函数
    return () => {
      console.log('清理imperative handle');
      if (internalRef.current) {
        internalRef.current.style.background = '';
      }
    };
  }, []);
  
  return <input ref={internalRef} {...props} />;
});
```

## 第八部分:最佳实践

### 8.1 命名规范

```jsx
// ✅ 好的命名
const Button = forwardRef(function Button(props, ref) {
  return <button ref={ref} {...props} />;
});
Button.displayName = 'Button';

const Input = forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} />;
});
Input.displayName = 'Input';

const CustomSelect = forwardRef(function CustomSelect(props, ref) {
  return <select ref={ref} {...props} />;
});
CustomSelect.displayName = 'CustomSelect';

// ❌ 不好的命名
const Component1 = forwardRef((props, ref) => {
  return <div ref={ref} />;
});
// 没有displayName,调试困难

const FC = forwardRef(function FC(props, ref) {
  return <div ref={ref} />;
});
// 名称不清晰
```

### 8.2 ref暴露的API设计

```jsx
// 原则1:最小暴露原则
const MinimalExposureInput = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  
  useImperativeHandle(ref, () => ({
    // 只暴露必要的方法
    focus: () => inputRef.current?.focus(),
    clear: () => setValue('')
    
    // 不暴露:
    // - setValue (通过onChange控制)
    // - blur (一般不需要)
    // - select (不是核心功能)
    // - 直接访问DOM元素
  }), []);
  
  return (
    <input
      ref={inputRef}
      value={value}
      onChange={e => {
        setValue(e.target.value);
        props.onChange?.(e);
      }}
    />
  );
});

// 原则2:语义化方法名
const SemanticMethodsInput = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  const [value, setValue] = useState('');
  
  useImperativeHandle(ref, () => ({
    // ✅ 好的方法名
    focus: () => inputRef.current?.focus(),
    clear: () => setValue(''),
    isEmpty: () => value.trim() === '',
    validate: () => value.length >= 3,
    
    // ❌ 不好的方法名
    // doFocus: () => {},  // 多余的'do'
    // clearValue: () => {},  // 'Value'是多余的
    // checkIfEmpty: () => {},  // 太啰嗦
    // val: () => {},  // 太简短
  }), [value]);
  
  return <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} />;
});

// 原则3:一致的接口设计
// 所有输入组件都应该有相似的接口
const ConsistentInput = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    focus: () => {},
    blur: () => {},
    getValue: () => {},
    setValue: (value) => {},
    validate: () => {},
    clear: () => {}
  }), []);
  
  return <input {...props} />;
});

const ConsistentTextarea = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    focus: () => {},
    blur: () => {},
    getValue: () => {},
    setValue: (value) => {},
    validate: () => {},
    clear: () => {}
    // 相同的接口,方便替换使用
  }), []);
  
  return <textarea {...props} />;
});
```

### 8.3 错误处理

```jsx
const ErrorHandlingComponent = forwardRef((props, ref) => {
  const elementRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      try {
        if (!elementRef.current) {
          throw new Error('元素未挂载');
        }
        elementRef.current.focus();
      } catch (error) {
        console.error('聚焦失败:', error);
        props.onError?.(error);
      }
    },
    
    getValue: () => {
      if (!elementRef.current) {
        console.warn('元素未挂载,返回空字符串');
        return '';
      }
      return elementRef.current.value;
    },
    
    safeOperation: (callback) => {
      try {
        if (elementRef.current) {
          callback(elementRef.current);
        } else {
          throw new Error('元素未挂载');
        }
      } catch (error) {
        console.error('操作失败:', error);
        return { success: false, error };
      }
      return { success: true };
    }
  }), [props]);
  
  return <input ref={elementRef} {...props} />;
});
```

## 第九部分:组件库开发

### 9.1 Button组件

```jsx
interface ButtonHandle {
  focus: () => void;
  blur: () => void;
  click: () => void;
  disable: () => void;
  enable: () => void;
}

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  onClick?: () => void;
}

const Button = forwardRef<ButtonHandle, ButtonProps>(
  ({ children, variant = 'primary', size = 'medium', loading = false, onClick, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [disabled, setDisabled] = useState(false);
    
    useImperativeHandle(
      ref,
      (): ButtonHandle => ({
        focus: () => {
          buttonRef.current?.focus();
        },
        blur: () => {
          buttonRef.current?.blur();
        },
        click: () => {
          buttonRef.current?.click();
        },
        disable: () => {
          setDisabled(true);
        },
        enable: () => {
          setDisabled(false);
        }
      }),
      []
    );
    
    return (
      <button
        ref={buttonRef}
        className={`btn btn-${variant} btn-${size}`}
        disabled={disabled || loading}
        onClick={onClick}
        {...props}
      >
        {loading ? <span className="spinner" /> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 9.2 Select组件

```jsx
interface SelectHandle {
  focus: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  getSelectedOption: () => { value: string; label: string } | null;
  clear: () => void;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const Select = forwardRef<SelectHandle, SelectProps>(
  ({ options, defaultValue = '', placeholder, onChange }, ref) => {
    const selectRef = useRef<HTMLSelectElement>(null);
    const [value, setValue] = useState(defaultValue);
    
    useImperativeHandle(
      ref,
      (): SelectHandle => ({
        focus: () => {
          selectRef.current?.focus();
        },
        getValue: () => {
          return value;
        },
        setValue: (newValue: string) => {
          if (options.some(opt => opt.value === newValue)) {
            setValue(newValue);
            onChange?.(newValue);
          }
        },
        getSelectedOption: () => {
          const option = options.find(opt => opt.value === value);
          return option || null;
        },
        clear: () => {
          setValue('');
          onChange?.('');
        }
      }),
      [value, options, onChange]
    );
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange?.(newValue);
    };
    
    return (
      <select ref={selectRef} value={value} onChange={handleChange}>
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';
```

### 9.3 Slider组件

```jsx
interface SliderHandle {
  getValue: () => number;
  setValue: (value: number) => void;
  increment: (step?: number) => void;
  decrement: (step?: number) => void;
  reset: () => void;
}

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
}

const Slider = forwardRef<SliderHandle, SliderProps>(
  ({ min = 0, max = 100, step = 1, defaultValue = 50, onChange }, ref) => {
    const [value, setValue] = useState(defaultValue);
    const sliderRef = useRef<HTMLInputElement>(null);
    
    useImperativeHandle(
      ref,
      (): SliderHandle => ({
        getValue: () => value,
        
        setValue: (newValue: number) => {
          const clampedValue = Math.max(min, Math.min(max, newValue));
          setValue(clampedValue);
          onChange?.(clampedValue);
        },
        
        increment: (customStep = step) => {
          const newValue = Math.min(value + customStep, max);
          setValue(newValue);
          onChange?.(newValue);
        },
        
        decrement: (customStep = step) => {
          const newValue = Math.max(value - customStep, min);
          setValue(newValue);
          onChange?.(newValue);
        },
        
        reset: () => {
          setValue(defaultValue);
          onChange?.(defaultValue);
        }
      }),
      [value, min, max, step, defaultValue, onChange]
    );
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setValue(newValue);
      onChange?.(newValue);
    };
    
    return (
      <div className="slider-container">
        <input
          ref={sliderRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
        />
        <span className="slider-value">{value}</span>
      </div>
    );
  }
);

Slider.displayName = 'Slider';

// 使用Slider
function SliderUsage() {
  const sliderRef = useRef<SliderHandle>(null);
  
  return (
    <div>
      <Slider
        ref={sliderRef}
        min={0}
        max={100}
        step={5}
        defaultValue={50}
        onChange={(value) => console.log('值变化:', value)}
      />
      
      <div className="controls">
        <button onClick={() => sliderRef.current?.increment()}>
          +5
        </button>
        <button onClick={() => sliderRef.current?.decrement()}>
          -5
        </button>
        <button onClick={() => sliderRef.current?.increment(20)}>
          +20
        </button>
        <button onClick={() => sliderRef.current?.reset()}>
          重置
        </button>
        <button onClick={() => {
          const value = sliderRef.current?.getValue();
          alert(`当前值: ${value}`);
        }}>
          获取值
        </button>
      </div>
    </div>
  );
}
```

## 第十部分:复杂实战案例

### 10.1 富文本编辑器

```jsx
interface EditorHandle {
  focus: () => void;
  getContent: () => string;
  setContent: (content: string) => void;
  insertText: (text: string) => void;
  clear: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

interface EditorProps {
  defaultContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = forwardRef<EditorHandle, EditorProps>(
  ({ defaultContent = '', onChange, placeholder }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [content, setContent] = useState(defaultContent);
    const [history, setHistory] = useState<string[]>([defaultContent]);
    const [historyIndex, setHistoryIndex] = useState(0);
    
    useImperativeHandle(
      ref,
      (): EditorHandle => ({
        focus: () => {
          editorRef.current?.focus();
        },
        
        getContent: () => {
          return content;
        },
        
        setContent: (newContent: string) => {
          setContent(newContent);
          if (editorRef.current) {
            editorRef.current.innerHTML = newContent;
          }
          addToHistory(newContent);
        },
        
        insertText: (text: string) => {
          if (editorRef.current) {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(text));
              
              const newContent = editorRef.current.innerHTML;
              setContent(newContent);
              addToHistory(newContent);
            }
          }
        },
        
        clear: () => {
          const newContent = '';
          setContent(newContent);
          if (editorRef.current) {
            editorRef.current.innerHTML = newContent;
          }
          addToHistory(newContent);
        },
        
        undo: () => {
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const newContent = history[newIndex];
            setHistoryIndex(newIndex);
            setContent(newContent);
            if (editorRef.current) {
              editorRef.current.innerHTML = newContent;
            }
          }
        },
        
        redo: () => {
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const newContent = history[newIndex];
            setHistoryIndex(newIndex);
            setContent(newContent);
            if (editorRef.current) {
              editorRef.current.innerHTML = newContent;
            }
          }
        },
        
        canUndo: () => historyIndex > 0,
        canRedo: () => historyIndex < history.length - 1
      }),
      [content, history, historyIndex]
    );
    
    const addToHistory = (newContent: string) => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        // 限制历史记录长度
        if (newHistory.length > 50) {
          newHistory.shift();
          setHistoryIndex(prev => prev);
        } else {
          setHistoryIndex(newHistory.length - 1);
        }
        return newHistory;
      });
    };
    
    const handleInput = () => {
      if (editorRef.current) {
        const newContent = editorRef.current.innerHTML;
        setContent(newContent);
        onChange?.(newContent);
        addToHistory(newContent);
      }
    };
    
    return (
      <div
        ref={editorRef}
        contentEditable
        className="rich-text-editor"
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

// 使用富文本编辑器
function EditorUsage() {
  const editorRef = useRef<EditorHandle>(null);
  
  const handleBold = () => {
    document.execCommand('bold');
  };
  
  const handleItalic = () => {
    document.execCommand('italic');
  };
  
  const handleSave = () => {
    const content = editorRef.current?.getContent();
    console.log('保存内容:', content);
    alert('已保存!');
  };
  
  return (
    <div>
      <div className="toolbar">
        <button onClick={handleBold}>加粗</button>
        <button onClick={handleItalic}>斜体</button>
        <button onClick={() => editorRef.current?.insertText('Hello')}>
          插入文本
        </button>
        <button onClick={() => editorRef.current?.undo()}
                disabled={!editorRef.current?.canUndo()}>
          撤销
        </button>
        <button onClick={() => editorRef.current?.redo()}
                disabled={!editorRef.current?.canRedo()}>
          重做
        </button>
        <button onClick={() => editorRef.current?.clear()}>
          清空
        </button>
        <button onClick={handleSave}>
          保存
        </button>
      </div>
      
      <RichTextEditor
        ref={editorRef}
        placeholder="开始输入..."
        onChange={(content) => console.log('内容变化:', content)}
      />
    </div>
  );
}
```

### 10.2 Tabs组件

```jsx
interface TabsHandle {
  activateTab: (index: number) => void;
  getActiveIndex: () => number;
  nextTab: () => void;
  prevTab: () => void;
}

interface TabsProps {
  children: React.ReactNode;
  defaultActiveIndex?: number;
  onChange?: (index: number) => void;
}

const Tabs = forwardRef<TabsHandle, TabsProps>(
  ({ children, defaultActiveIndex = 0, onChange }, ref) => {
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    
    const tabs = React.Children.toArray(children);
    
    useImperativeHandle(
      ref,
      (): TabsHandle => ({
        activateTab: (index: number) => {
          if (index >= 0 && index < tabs.length) {
            setActiveIndex(index);
            onChange?.(index);
            tabRefs.current[index]?.focus();
          }
        },
        
        getActiveIndex: () => activeIndex,
        
        nextTab: () => {
          const nextIndex = (activeIndex + 1) % tabs.length;
          setActiveIndex(nextIndex);
          onChange?.(nextIndex);
          tabRefs.current[nextIndex]?.focus();
        },
        
        prevTab: () => {
          const prevIndex = (activeIndex - 1 + tabs.length) % tabs.length;
          setActiveIndex(prevIndex);
          onChange?.(prevIndex);
          tabRefs.current[prevIndex]?.focus();
        }
      }),
      [activeIndex, tabs.length, onChange]
    );
    
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') {
          ref.current?.nextTab();
        } else if (e.key === 'ArrowLeft') {
          ref.current?.prevTab();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [ref]);
    
    return (
      <div className="tabs">
        <div className="tab-headers">
          {tabs.map((tab: any, index) => (
            <button
              key={index}
              ref={el => tabRefs.current[index] = el}
              className={`tab-header ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                setActiveIndex(index);
                onChange?.(index);
              }}
            >
              {tab.props.title}
            </button>
          ))}
        </div>
        
        <div className="tab-content">
          {tabs[activeIndex]}
        </div>
      </div>
    );
  }
);

Tabs.displayName = 'Tabs';

// Tab子组件
function Tab({ title, children }: { title: string; children: React.ReactNode }) {
  return <div>{children}</div>;
}

// 使用Tabs
function TabsUsage() {
  const tabsRef = useRef<TabsHandle>(null);
  
  return (
    <div>
      <div className="tab-controls">
        <button onClick={() => tabsRef.current?.prevTab()}>
          上一个标签
        </button>
        <button onClick={() => tabsRef.current?.nextTab()}>
          下一个标签
        </button>
        <button onClick={() => tabsRef.current?.activateTab(0)}>
          回到第一个标签
        </button>
        <button onClick={() => {
          const index = tabsRef.current?.getActiveIndex();
          alert(`当前标签索引: ${index}`);
        }}>
          获取当前索引
        </button>
      </div>
      
      <Tabs ref={tabsRef} onChange={(index) => console.log('切换到标签:', index)}>
        <Tab title="首页">
          <h2>首页内容</h2>
          <p>这是首页的内容</p>
        </Tab>
        
        <Tab title="个人资料">
          <h2>个人资料</h2>
          <p>这是个人资料页面</p>
        </Tab>
        
        <Tab title="设置">
          <h2>设置</h2>
          <p>这是设置页面</p>
        </Tab>
      </Tabs>
      
      <p className="hint">
        提示: 使用左右箭头键也可以切换标签
      </p>
    </div>
  );
}
```

## 练习题

### 基础练习

1. 创建一个使用forwardRef的自定义输入框组件
2. 使用useImperativeHandle暴露focus和clear方法
3. 实现一个可以通过ref控制的Modal组件
4. 创建一个带验证的表单字段组件

### 进阶练习

1. 实现一个完整的Form组件,支持多个Field注册
2. 创建一个Video播放器组件,暴露播放控制方法
3. 实现一个Carousel组件,支持通过ref控制切换
4. 使用TypeScript定义完整的ref类型系统

### 高级练习

1. 实现一个富文本编辑器组件,支持撤销/重做
2. 创建一个可拖拽的组件,暴露位置控制方法
3. 实现一个Tab组件,支持键盘导航
4. 创建一个组件库,统一ref接口设计

### 实战项目

1. 开发一个完整的UI组件库,所有组件支持ref
2. 实现一个表单构建器,动态创建和管理表单字段
3. 创建一个可视化编辑器,通过ref控制元素
4. 实现一个游戏,使用ref管理游戏对象

通过本章学习,你已经全面掌握了forwardRef和useImperativeHandle的使用,从基础概念到高级模式,从简单ref转发到复杂组件库开发。这两个工具是构建可复用组件的关键,掌握它们将使你能够创建专业级的React组件库。
