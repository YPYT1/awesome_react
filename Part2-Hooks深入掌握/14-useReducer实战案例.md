# useReducer实战案例

## 学习目标

通过本章实战案例，你将掌握：

- useReducer在真实项目中的应用
- 购物车系统的完整实现
- 表单管理系统
- 数据获取与缓存
- 游戏状态管理
- 复杂UI状态控制
- 最佳实践模式
- 性能优化技巧
- TypeScript集成
- React 19新特性应用

## 第一部分：购物车系统

### 1.1 基础购物车实现

```jsx
function ShoppingCartWithReducer() {
  const initialState = {
    items: [],
    coupon: null,
    shipping: 0,
    tax: 0
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'ADD_ITEM': {
        const existing = state.items.find(item => item.id === action.product.id);
        
        if (existing) {
          return {
            ...state,
            items: state.items.map(item =>
              item.id === action.product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          };
        }
        
        return {
          ...state,
          items: [...state.items, { ...action.product, quantity: 1 }]
        };
      }
      
      case 'REMOVE_ITEM':
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.id)
        };
      
      case 'UPDATE_QUANTITY':
        if (action.quantity <= 0) {
          return {
            ...state,
            items: state.items.filter(item => item.id !== action.id)
          };
        }
        
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.id
              ? { ...item, quantity: action.quantity }
              : item
          )
        };
      
      case 'APPLY_COUPON':
        return {
          ...state,
          coupon: action.coupon
        };
      
      case 'REMOVE_COUPON':
        return {
          ...state,
          coupon: null
        };
      
      case 'SET_SHIPPING':
        return {
          ...state,
          shipping: action.amount
        };
      
      case 'CLEAR_CART':
        return initialState;
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 计算总价
  const calculations = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    const discount = state.coupon
      ? subtotal * state.coupon.discount
      : 0;
    
    const shipping = subtotal >= 299 ? 0 : 20;
    const tax = (subtotal - discount) * 0.13;
    const total = subtotal - discount + shipping + tax;
    
    return { subtotal, discount, shipping, tax, total };
  }, [state.items, state.coupon]);
  
  return (
    <div className="shopping-cart">
      <h2>购物车</h2>
      
      {state.items.length === 0 ? (
        <p>购物车是空的</p>
      ) : (
        <>
          <div className="cart-items">
            {state.items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <h4>{item.name}</h4>
                  <p>¥{item.price}</p>
                </div>
                
                <div className="quantity">
                  <button onClick={() => dispatch({
                    type: 'UPDATE_QUANTITY',
                    id: item.id,
                    quantity: item.quantity - 1
                  })}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => dispatch({
                    type: 'UPDATE_QUANTITY',
                    id: item.id,
                    quantity: item.quantity + 1
                  })}>
                    +
                  </button>
                </div>
                
                <button onClick={() => dispatch({
                  type: 'REMOVE_ITEM',
                  id: item.id
                })}>
                  删除
                </button>
              </div>
            ))}
          </div>
          
          <div className="summary">
            <div>小计: ¥{calculations.subtotal.toFixed(2)}</div>
            {calculations.discount > 0 && (
              <div>优惠: -¥{calculations.discount.toFixed(2)}</div>
            )}
            <div>运费: ¥{calculations.shipping.toFixed(2)}</div>
            <div>税费: ¥{calculations.tax.toFixed(2)}</div>
            <div className="total">
              总计: ¥{calculations.total.toFixed(2)}
            </div>
          </div>
          
          <button onClick={() => dispatch({ type: 'CLEAR_CART' })}>
            清空购物车
          </button>
        </>
      )}
    </div>
  );
}
```

### 1.2 高级购物车功能

添加更多功能：库存管理、愿望清单、历史订单等。

```jsx
function AdvancedShoppingCart() {
  const initialState = {
    items: [],
    wishlist: [],
    orders: [],
    coupons: [],
    selectedCoupon: null,
    shippingAddress: null,
    paymentMethod: null,
    inventory: {},
    ui: {
      showWishlist: false,
      showHistory: false,
      checkoutStep: 0
    }
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'ADD_ITEM': {
        const { product, quantity = 1 } = action;
        const currentStock = state.inventory[product.id]?.stock || 0;
        const currentInCart = state.items.find(item => item.id === product.id)?.quantity || 0;
        
        if (currentInCart + quantity > currentStock) {
          return state; // 库存不足
        }
        
        const existing = state.items.find(item => item.id === product.id);
        
        if (existing) {
          return {
            ...state,
            items: state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          };
        }
        
        return {
          ...state,
          items: [...state.items, { ...product, quantity }]
        };
      }
      
      case 'REMOVE_ITEM':
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.id)
        };
      
      case 'UPDATE_QUANTITY': {
        const { id, quantity } = action;
        const product = state.items.find(item => item.id === id);
        const stock = state.inventory[id]?.stock || 0;
        
        if (quantity > stock) {
          return state;
        }
        
        if (quantity <= 0) {
          return {
            ...state,
            items: state.items.filter(item => item.id !== id)
          };
        }
        
        return {
          ...state,
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        };
      }
      
      case 'ADD_TO_WISHLIST': {
        const existing = state.wishlist.find(item => item.id === action.product.id);
        
        if (existing) {
          return state;
        }
        
        return {
          ...state,
          wishlist: [...state.wishlist, action.product]
        };
      }
      
      case 'REMOVE_FROM_WISHLIST':
        return {
          ...state,
          wishlist: state.wishlist.filter(item => item.id !== action.id)
        };
      
      case 'MOVE_TO_CART': {
        const item = state.wishlist.find(w => w.id === action.id);
        
        if (!item) {
          return state;
        }
        
        return reducer(
          reducer(state, { type: 'REMOVE_FROM_WISHLIST', id: action.id }),
          { type: 'ADD_ITEM', product: item }
        );
      }
      
      case 'APPLY_COUPON': {
        const coupon = state.coupons.find(c => c.code === action.code);
        
        if (!coupon || !coupon.isValid) {
          return state;
        }
        
        return {
          ...state,
          selectedCoupon: coupon
        };
      }
      
      case 'REMOVE_COUPON':
        return {
          ...state,
          selectedCoupon: null
        };
      
      case 'SET_SHIPPING_ADDRESS':
        return {
          ...state,
          shippingAddress: action.address
        };
      
      case 'SET_PAYMENT_METHOD':
        return {
          ...state,
          paymentMethod: action.method
        };
      
      case 'UPDATE_INVENTORY':
        return {
          ...state,
          inventory: {
            ...state.inventory,
            [action.productId]: action.inventory
          }
        };
      
      case 'PLACE_ORDER': {
        const order = {
          id: Date.now(),
          items: state.items,
          total: action.total,
          date: new Date().toISOString(),
          status: 'pending'
        };
        
        return {
          ...initialState,
          orders: [...state.orders, order],
          inventory: state.inventory
        };
      }
      
      case 'UPDATE_UI':
        return {
          ...state,
          ui: {
            ...state.ui,
            ...action.updates
          }
        };
      
      case 'NEXT_CHECKOUT_STEP':
        return {
          ...state,
          ui: {
            ...state.ui,
            checkoutStep: Math.min(state.ui.checkoutStep + 1, 3)
          }
        };
      
      case 'PREV_CHECKOUT_STEP':
        return {
          ...state,
          ui: {
            ...state.ui,
            checkoutStep: Math.max(state.ui.checkoutStep - 1, 0)
          }
        };
      
      case 'CLEAR_CART':
        return {
          ...state,
          items: []
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const calculations = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    let discount = 0;
    if (state.selectedCoupon) {
      if (state.selectedCoupon.type === 'percentage') {
        discount = subtotal * (state.selectedCoupon.value / 100);
      } else if (state.selectedCoupon.type === 'fixed') {
        discount = Math.min(state.selectedCoupon.value, subtotal);
      }
    }
    
    const shipping = subtotal >= 299 ? 0 : 20;
    const tax = (subtotal - discount) * 0.13;
    const total = subtotal - discount + shipping + tax;
    
    return { subtotal, discount, shipping, tax, total };
  }, [state.items, state.selectedCoupon]);
  
  const handleCheckout = () => {
    dispatch({ type: 'PLACE_ORDER', total: calculations.total });
    alert('订单已提交！');
  };
  
  return (
    <div className="advanced-cart">
      <h2>高级购物车</h2>
      
      <div className="tabs">
        <button onClick={() => dispatch({ type: 'UPDATE_UI', updates: { showWishlist: false, showHistory: false } })}>
          购物车 ({state.items.length})
        </button>
        <button onClick={() => dispatch({ type: 'UPDATE_UI', updates: { showWishlist: true, showHistory: false } })}>
          愿望清单 ({state.wishlist.length})
        </button>
        <button onClick={() => dispatch({ type: 'UPDATE_UI', updates: { showWishlist: false, showHistory: true } })}>
          历史订单 ({state.orders.length})
        </button>
      </div>
      
      {!state.ui.showWishlist && !state.ui.showHistory && (
        <>
          {state.items.length === 0 ? (
            <p>购物车是空的</p>
          ) : (
            <>
              <div className="cart-items">
                {state.items.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} />
                    <div>
                      <h4>{item.name}</h4>
                      <p>¥{item.price}</p>
                      <p className="stock">
                        库存: {state.inventory[item.id]?.stock || 0}
                      </p>
                    </div>
                    
                    <div className="quantity">
                      <button onClick={() => dispatch({
                        type: 'UPDATE_QUANTITY',
                        id: item.id,
                        quantity: item.quantity - 1
                      })}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => dispatch({
                        type: 'UPDATE_QUANTITY',
                        id: item.id,
                        quantity: item.quantity + 1
                      })}>
                        +
                      </button>
                    </div>
                    
                    <button onClick={() => dispatch({
                      type: 'REMOVE_ITEM',
                      id: item.id
                    })}>
                      删除
                    </button>
                    
                    <button onClick={() => dispatch({
                      type: 'ADD_TO_WISHLIST',
                      product: item
                    })}>
                      加入愿望清单
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="summary">
                <div>小计: ¥{calculations.subtotal.toFixed(2)}</div>
                {calculations.discount > 0 && (
                  <div>优惠: -¥{calculations.discount.toFixed(2)}</div>
                )}
                <div>运费: ¥{calculations.shipping.toFixed(2)}</div>
                <div>税费: ¥{calculations.tax.toFixed(2)}</div>
                <div className="total">
                  总计: ¥{calculations.total.toFixed(2)}
                </div>
              </div>
              
              <button onClick={handleCheckout}>
                结账
              </button>
            </>
          )}
        </>
      )}
      
      {state.ui.showWishlist && (
        <div className="wishlist">
          <h3>愿望清单</h3>
          {state.wishlist.map(item => (
            <div key={item.id} className="wishlist-item">
              <img src={item.image} alt={item.name} />
              <div>
                <h4>{item.name}</h4>
                <p>¥{item.price}</p>
              </div>
              <button onClick={() => dispatch({ type: 'MOVE_TO_CART', id: item.id })}>
                加入购物车
              </button>
              <button onClick={() => dispatch({ type: 'REMOVE_FROM_WISHLIST', id: item.id })}>
                删除
              </button>
            </div>
          ))}
        </div>
      )}
      
      {state.ui.showHistory && (
        <div className="order-history">
          <h3>历史订单</h3>
          {state.orders.map(order => (
            <div key={order.id} className="order">
              <h4>订单 #{order.id}</h4>
              <p>日期: {new Date(order.date).toLocaleDateString()}</p>
              <p>总计: ¥{order.total.toFixed(2)}</p>
              <p>状态: {order.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 1.3 购物车持久化

使用localStorage保存购物车数据。

```jsx
function PersistentShoppingCart() {
  const initialState = {
    items: [],
    coupon: null
  };
  
  const init = (initialValue) => {
    try {
      const saved = localStorage.getItem('shopping-cart');
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  };
  
  const reducer = (state, action) => {
    // ... reducer逻辑同上
    
    switch (action.type) {
      case 'ADD_ITEM':
      case 'REMOVE_ITEM':
      case 'UPDATE_QUANTITY':
      case 'APPLY_COUPON':
      case 'REMOVE_COUPON':
      case 'CLEAR_CART':
        // 执行状态更新逻辑
        const newState = {
          ...state,
          // ... 更新逻辑
        };
        
        // 保存到localStorage
        localStorage.setItem('shopping-cart', JSON.stringify(newState));
        return newState;
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState, init);
  
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(state));
  }, [state]);
  
  return (
    <div>
      {/* UI组件 */}
    </div>
  );
}
```

## 第二部分：表单管理系统

### 2.1 基础表单管理

```jsx
function ComplexFormWithReducer() {
  const initialState = {
    fields: {
      personal: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      preferences: {
        newsletter: false,
        notifications: true
      }
    },
    validation: {
      errors: {},
      touched: {}
    },
    submission: {
      loading: false,
      success: false,
      error: null
    }
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_FIELD':
        const { section, field, value } = action;
        return {
          ...state,
          fields: {
            ...state.fields,
            [section]: {
              ...state.fields[section],
              [field]: value
            }
          }
        };
      
      case 'SET_TOUCHED':
        return {
          ...state,
          validation: {
            ...state.validation,
            touched: {
              ...state.validation.touched,
              [`${action.section}.${action.field}`]: true
            }
          }
        };
      
      case 'SET_ERROR':
        return {
          ...state,
          validation: {
            ...state.validation,
            errors: {
              ...state.validation.errors,
              [`${action.section}.${action.field}`]: action.error
            }
          }
        };
      
      case 'SET_ERRORS':
        return {
          ...state,
          validation: {
            ...state.validation,
            errors: action.errors
          }
        };
      
      case 'SUBMIT_START':
        return {
          ...state,
          submission: {
            loading: true,
            success: false,
            error: null
          }
        };
      
      case 'SUBMIT_SUCCESS':
        return {
          ...initialState,
          submission: {
            loading: false,
            success: true,
            error: null
          }
        };
      
      case 'SUBMIT_ERROR':
        return {
          ...state,
          submission: {
            loading: false,
            success: false,
            error: action.error
          }
        };
      
      case 'RESET':
        return initialState;
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const handleFieldChange = (section, field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    dispatch({ type: 'UPDATE_FIELD', section, field, value });
  };
  
  const handleBlur = (section, field) => () => {
    dispatch({ type: 'SET_TOUCHED', section, field });
    
    // 验证字段
    const value = state.fields[section][field];
    const error = validateField(field, value);
    
    if (error) {
      dispatch({ type: 'SET_ERROR', section, field, error });
    }
  };
  
  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        return !value.includes('@') ? '邮箱格式不正确' : null;
      case 'phone':
        return !/^\d{11}$/.test(value) ? '手机号格式不正确' : null;
      case 'zipCode':
        return !/^\d{6}$/.test(value) ? '邮编格式不正确' : null;
      default:
        return !value ? '此字段为必填项' : null;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证所有字段
    const errors = {};
    Object.entries(state.fields).forEach(([section, fields]) => {
      Object.entries(fields).forEach(([field, value]) => {
        const error = validateField(field, value);
        if (error) {
          errors[`${section}.${field}`] = error;
        }
      });
    });
    
    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return;
    }
    
    dispatch({ type: 'SUBMIT_START' });
    
    try {
      await submitForm(state.fields);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR', error: error.message });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <section>
        <h3>个人信息</h3>
        
        <div>
          <input
            value={state.fields.personal.firstName}
            onChange={handleFieldChange('personal', 'firstName')}
            onBlur={handleBlur('personal', 'firstName')}
            placeholder="名"
          />
          {state.validation.errors['personal.firstName'] && (
            <span className="error">
              {state.validation.errors['personal.firstName']}
            </span>
          )}
        </div>
        
        <div>
          <input
            value={state.fields.personal.lastName}
            onChange={handleFieldChange('personal', 'lastName')}
            onBlur={handleBlur('personal', 'lastName')}
            placeholder="姓"
          />
          {state.validation.errors['personal.lastName'] && (
            <span className="error">
              {state.validation.errors['personal.lastName']}
            </span>
          )}
        </div>
        
        <div>
          <input
            type="email"
            value={state.fields.personal.email}
            onChange={handleFieldChange('personal', 'email')}
            onBlur={handleBlur('personal', 'email')}
            placeholder="邮箱"
          />
          {state.validation.errors['personal.email'] && (
            <span className="error">
              {state.validation.errors['personal.email']}
            </span>
          )}
        </div>
        
        <div>
          <input
            value={state.fields.personal.phone}
            onChange={handleFieldChange('personal', 'phone')}
            onBlur={handleBlur('personal', 'phone')}
            placeholder="电话"
          />
          {state.validation.errors['personal.phone'] && (
            <span className="error">
              {state.validation.errors['personal.phone']}
            </span>
          )}
        </div>
      </section>
      
      <section>
        <h3>地址信息</h3>
        
        <div>
          <input
            value={state.fields.address.street}
            onChange={handleFieldChange('address', 'street')}
            onBlur={handleBlur('address', 'street')}
            placeholder="街道"
          />
        </div>
        
        <div>
          <input
            value={state.fields.address.city}
            onChange={handleFieldChange('address', 'city')}
            onBlur={handleBlur('address', 'city')}
            placeholder="城市"
          />
        </div>
        
        <div>
          <input
            value={state.fields.address.state}
            onChange={handleFieldChange('address', 'state')}
            onBlur={handleBlur('address', 'state')}
            placeholder="省份"
          />
        </div>
        
        <div>
          <input
            value={state.fields.address.zipCode}
            onChange={handleFieldChange('address', 'zipCode')}
            onBlur={handleBlur('address', 'zipCode')}
            placeholder="邮编"
          />
          {state.validation.errors['address.zipCode'] && (
            <span className="error">
              {state.validation.errors['address.zipCode']}
            </span>
          )}
        </div>
      </section>
      
      <section>
        <h3>偏好设置</h3>
        
        <div>
          <label>
            <input
              type="checkbox"
              checked={state.fields.preferences.newsletter}
              onChange={handleFieldChange('preferences', 'newsletter')}
            />
            订阅新闻通讯
          </label>
        </div>
        
        <div>
          <label>
            <input
              type="checkbox"
              checked={state.fields.preferences.notifications}
              onChange={handleFieldChange('preferences', 'notifications')}
            />
            接收通知
          </label>
        </div>
      </section>
      
      <button type="submit" disabled={state.submission.loading}>
        {state.submission.loading ? '提交中...' : '提交'}
      </button>
      
      {state.submission.success && <p className="success">提交成功！</p>}
      {state.submission.error && <p className="error">{state.submission.error}</p>}
    </form>
  );
}

async function submitForm(data) {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('表单数据:', data);
      resolve();
    }, 1000);
  });
}
```

### 2.2 多步骤表单

实现向导式多步骤表单。

```jsx
function MultiStepForm() {
  const initialState = {
    currentStep: 0,
    data: {
      step1: { username: '', email: '' },
      step2: { address: '', city: '' },
      step3: { cardNumber: '', cvv: '' }
    },
    validation: {
      errors: {},
      canProceed: false
    },
    submission: {
      loading: false,
      success: false,
      error: null
    }
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_STEP_DATA':
        return {
          ...state,
          data: {
            ...state.data,
            [action.step]: {
              ...state.data[action.step],
              ...action.data
            }
          }
        };
      
      case 'NEXT_STEP':
        return {
          ...state,
          currentStep: Math.min(state.currentStep + 1, 2)
        };
      
      case 'PREV_STEP':
        return {
          ...state,
          currentStep: Math.max(state.currentStep - 1, 0)
        };
      
      case 'GO_TO_STEP':
        return {
          ...state,
          currentStep: action.step
        };
      
      case 'SET_VALIDATION':
        return {
          ...state,
          validation: {
            ...state.validation,
            ...action.validation
          }
        };
      
      case 'SUBMIT_START':
        return {
          ...state,
          submission: {
            loading: true,
            success: false,
            error: null
          }
        };
      
      case 'SUBMIT_SUCCESS':
        return {
          ...initialState,
          submission: {
            loading: false,
            success: true,
            error: null
          }
        };
      
      case 'SUBMIT_ERROR':
        return {
          ...state,
          submission: {
            loading: false,
            success: false,
            error: action.error
          }
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const steps = [
    { title: '账户信息', component: Step1 },
    { title: '地址信息', component: Step2 },
    { title: '支付信息', component: Step3 }
  ];
  
  const CurrentStepComponent = steps[state.currentStep].component;
  
  const handleNext = () => {
    dispatch({ type: 'NEXT_STEP' });
  };
  
  const handlePrev = () => {
    dispatch({ type: 'PREV_STEP' });
  };
  
  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT_START' });
    
    try {
      await submitMultiStepForm(state.data);
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'SUBMIT_ERROR', error: error.message });
    }
  };
  
  return (
    <div className="multi-step-form">
      <div className="steps-indicator">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step ${index === state.currentStep ? 'active' : ''} ${
              index < state.currentStep ? 'completed' : ''
            }`}
            onClick={() => dispatch({ type: 'GO_TO_STEP', step: index })}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>
      
      <div className="step-content">
        <CurrentStepComponent
          data={state.data[`step${state.currentStep + 1}`]}
          onChange={(data) => dispatch({
            type: 'UPDATE_STEP_DATA',
            step: `step${state.currentStep + 1}`,
            data
          })}
        />
      </div>
      
      <div className="navigation">
        {state.currentStep > 0 && (
          <button onClick={handlePrev}>上一步</button>
        )}
        
        {state.currentStep < steps.length - 1 ? (
          <button onClick={handleNext}>下一步</button>
        ) : (
          <button onClick={handleSubmit} disabled={state.submission.loading}>
            {state.submission.loading ? '提交中...' : '提交'}
          </button>
        )}
      </div>
      
      {state.submission.success && <p className="success">提交成功！</p>}
      {state.submission.error && <p className="error">{state.submission.error}</p>}
    </div>
  );
}

function Step1({ data, onChange }) {
  return (
    <div>
      <h3>账户信息</h3>
      <input
        value={data.username}
        onChange={(e) => onChange({ username: e.target.value })}
        placeholder="用户名"
      />
      <input
        type="email"
        value={data.email}
        onChange={(e) => onChange({ email: e.target.value })}
        placeholder="邮箱"
      />
    </div>
  );
}

function Step2({ data, onChange }) {
  return (
    <div>
      <h3>地址信息</h3>
      <input
        value={data.address}
        onChange={(e) => onChange({ address: e.target.value })}
        placeholder="地址"
      />
      <input
        value={data.city}
        onChange={(e) => onChange({ city: e.target.value })}
        placeholder="城市"
      />
    </div>
  );
}

function Step3({ data, onChange }) {
  return (
    <div>
      <h3>支付信息</h3>
      <input
        value={data.cardNumber}
        onChange={(e) => onChange({ cardNumber: e.target.value })}
        placeholder="卡号"
      />
      <input
        value={data.cvv}
        onChange={(e) => onChange({ cvv: e.target.value })}
        placeholder="CVV"
      />
    </div>
  );
}

async function submitMultiStepForm(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('多步骤表单数据:', data);
      resolve();
    }, 1000);
  });
}
```

## 第三部分：数据获取与缓存

### 3.1 基础数据获取

```jsx
function DataFetchingWithReducer({ url }) {
  const initialState = {
    data: null,
    loading: false,
    error: null,
    refetchIndex: 0
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_START':
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case 'FETCH_SUCCESS':
        return {
          ...state,
          loading: false,
          data: action.payload,
          error: null
        };
      
      case 'FETCH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.error
        };
      
      case 'REFETCH':
        return {
          ...state,
          refetchIndex: state.refetchIndex + 1
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    let cancelled = false;
    
    dispatch({ type: 'FETCH_START' });
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!cancelled) {
          dispatch({ type: 'FETCH_SUCCESS', payload: data });
        }
      })
      .catch(error => {
        if (!cancelled) {
          dispatch({ type: 'FETCH_ERROR', error: error.message });
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, [url, state.refetchIndex]);
  
  if (state.loading) return <div>加载中...</div>;
  if (state.error) return (
    <div>
      <p>错误: {state.error}</p>
      <button onClick={() => dispatch({ type: 'REFETCH' })}>重试</button>
    </div>
  );
  if (!state.data) return null;
  
  return (
    <div>
      <pre>{JSON.stringify(state.data, null, 2)}</pre>
      <button onClick={() => dispatch({ type: 'REFETCH' })}>
        刷新数据
      </button>
    </div>
  );
}
```

### 3.2 高级数据获取（带缓存、分页、过滤）

```jsx
function AdvancedDataFetching() {
  const initialState = {
    data: [],
    cache: {},
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      total: 0
    },
    filters: {
      search: '',
      category: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    }
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'FETCH_START':
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case 'FETCH_SUCCESS': {
        const cacheKey = `${action.page}_${action.filters}`;
        return {
          ...state,
          loading: false,
          data: action.payload.data,
          cache: {
            ...state.cache,
            [cacheKey]: action.payload.data
          },
          pagination: {
            ...state.pagination,
            total: action.payload.total
          }
        };
      }
      
      case 'FETCH_ERROR':
        return {
          ...state,
          loading: false,
          error: action.error
        };
      
      case 'SET_PAGE':
        return {
          ...state,
          pagination: {
            ...state.pagination,
            page: action.page
          }
        };
      
      case 'SET_FILTER':
        return {
          ...state,
          filters: {
            ...state.filters,
            [action.key]: action.value
          },
          pagination: {
            ...state.pagination,
            page: 1 // 重置到第一页
          }
        };
      
      case 'CLEAR_CACHE':
        return {
          ...state,
          cache: {}
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    const cacheKey = `${state.pagination.page}_${JSON.stringify(state.filters)}`;
    
    // 检查缓存
    if (state.cache[cacheKey]) {
      return;
    }
    
    let cancelled = false;
    
    dispatch({ type: 'FETCH_START' });
    
    const fetchData = async () => {
      try {
        const params = new URLSearchParams({
          page: state.pagination.page,
          pageSize: state.pagination.pageSize,
          ...state.filters
        });
        
        const response = await fetch(`/api/data?${params}`);
        const result = await response.json();
        
        if (!cancelled) {
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: result,
            page: state.pagination.page,
            filters: JSON.stringify(state.filters)
          });
        }
      } catch (error) {
        if (!cancelled) {
          dispatch({ type: 'FETCH_ERROR', error: error.message });
        }
      }
    };
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, [state.pagination.page, state.filters]);
  
  return (
    <div>
      <div className="filters">
        <input
          type="search"
          value={state.filters.search}
          onChange={(e) => dispatch({
            type: 'SET_FILTER',
            key: 'search',
            value: e.target.value
          })}
          placeholder="搜索..."
        />
        
        <select
          value={state.filters.category}
          onChange={(e) => dispatch({
            type: 'SET_FILTER',
            key: 'category',
            value: e.target.value
          })}
        >
          <option value="all">全部分类</option>
          <option value="tech">技术</option>
          <option value="design">设计</option>
        </select>
        
        <select
          value={state.filters.sortBy}
          onChange={(e) => dispatch({
            type: 'SET_FILTER',
            key: 'sortBy',
            value: e.target.value
          })}
        >
          <option value="name">名称</option>
          <option value="date">日期</option>
          <option value="price">价格</option>
        </select>
        
        <button onClick={() => dispatch({ type: 'CLEAR_CACHE' })}>
          清除缓存
        </button>
      </div>
      
      {state.loading && <div>加载中...</div>}
      {state.error && <div>错误: {state.error}</div>}
      
      {state.data.length > 0 && (
        <>
          <div className="data-list">
            {state.data.map(item => (
              <div key={item.id} className="data-item">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
          
          <div className="pagination">
            <button
              disabled={state.pagination.page === 1}
              onClick={() => dispatch({
                type: 'SET_PAGE',
                page: state.pagination.page - 1
              })}
            >
              上一页
            </button>
            
            <span>
              第 {state.pagination.page} 页，共 {Math.ceil(state.pagination.total / state.pagination.pageSize)} 页
            </span>
            
            <button
              disabled={state.pagination.page >= Math.ceil(state.pagination.total / state.pagination.pageSize)}
              onClick={() => dispatch({
                type: 'SET_PAGE',
                page: state.pagination.page + 1
              })}
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

## 第四部分：游戏状态管理

### 4.1 井字棋游戏

```jsx
function TicTacToeGame() {
  const initialState = {
    board: Array(9).fill(null),
    xIsNext: true,
    winner: null,
    winningLine: null,
    history: [],
    currentMove: 0
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'MAKE_MOVE': {
        const { index } = action;
        
        if (state.board[index] || state.winner) {
          return state;
        }
        
        const newBoard = [...state.board];
        newBoard[index] = state.xIsNext ? 'X' : 'O';
        
        const winner = calculateWinner(newBoard);
        
        return {
          ...state,
          board: newBoard,
          xIsNext: !state.xIsNext,
          winner: winner?.player || null,
          winningLine: winner?.line || null,
          history: [
            ...state.history.slice(0, state.currentMove + 1),
            { board: newBoard, move: index }
          ],
          currentMove: state.currentMove + 1
        };
      }
      
      case 'JUMP_TO_MOVE':
        const move = state.history[action.move];
        return {
          ...state,
          board: move.board,
          xIsNext: action.move % 2 === 0,
          currentMove: action.move,
          winner: calculateWinner(move.board)?.player || null
        };
      
      case 'RESET':
        return initialState;
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const status = state.winner
    ? `获胜者: ${state.winner}`
    : `下一位: ${state.xIsNext ? 'X' : 'O'}`;
  
  return (
    <div className="game">
      <div className="game-board">
        <div className="status">{status}</div>
        <div className="board">
          {state.board.map((cell, i) => (
            <button
              key={i}
              className={`cell ${state.winningLine?.includes(i) ? 'winning' : ''}`}
              onClick={() => dispatch({ type: 'MAKE_MOVE', index: i })}
            >
              {cell}
            </button>
          ))}
        </div>
        <button onClick={() => dispatch({ type: 'RESET' })}>
          重新开始
        </button>
      </div>
      
      <div className="game-history">
        <h3>历史记录</h3>
        <ol>
          {state.history.map((_, index) => (
            <li key={index}>
              <button onClick={() => dispatch({ type: 'JUMP_TO_MOVE', move: index })}>
                {index === 0 ? '游戏开始' : `移动 #${index}`}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function calculateWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { player: board[a], line };
    }
  }
  
  return null;
}
```

### 4.2 俄罗斯方块游戏

```jsx
function TetrisGame() {
  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  
  const createEmptyBoard = () => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  
  const initialState = {
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: null,
    position: { x: 0, y: 0 },
    score: 0,
    level: 1,
    lines: 0,
    gameOver: false,
    isPaused: false
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'START_GAME':
        return {
          ...initialState,
          currentPiece: getRandomPiece(),
          nextPiece: getRandomPiece(),
          position: { x: BOARD_WIDTH / 2 - 1, y: 0 }
        };
      
      case 'MOVE_LEFT': {
        if (state.gameOver || state.isPaused) return state;
        
        const newPosition = { ...state.position, x: state.position.x - 1 };
        
        if (canMove(state.board, state.currentPiece, newPosition)) {
          return {
            ...state,
            position: newPosition
          };
        }
        
        return state;
      }
      
      case 'MOVE_RIGHT': {
        if (state.gameOver || state.isPaused) return state;
        
        const newPosition = { ...state.position, x: state.position.x + 1 };
        
        if (canMove(state.board, state.currentPiece, newPosition)) {
          return {
            ...state,
            position: newPosition
          };
        }
        
        return state;
      }
      
      case 'MOVE_DOWN': {
        if (state.gameOver || state.isPaused) return state;
        
        const newPosition = { ...state.position, y: state.position.y + 1 };
        
        if (canMove(state.board, state.currentPiece, newPosition)) {
          return {
            ...state,
            position: newPosition
          };
        }
        
        // 不能移动，放置方块
        const newBoard = placePiece(
          state.board,
          state.currentPiece,
          state.position
        );
        
        const { board: clearedBoard, linesCleared } = clearLines(newBoard);
        
        const newScore = state.score + calculateScore(linesCleared, state.level);
        const newLines = state.lines + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        
        // 检查游戏是否结束
        const gameOver = state.position.y <= 0;
        
        return {
          ...state,
          board: clearedBoard,
          currentPiece: state.nextPiece,
          nextPiece: getRandomPiece(),
          position: { x: BOARD_WIDTH / 2 - 1, y: 0 },
          score: newScore,
          lines: newLines,
          level: newLevel,
          gameOver
        };
      }
      
      case 'ROTATE': {
        if (state.gameOver || state.isPaused) return state;
        
        const rotatedPiece = rotatePiece(state.currentPiece);
        
        if (canMove(state.board, rotatedPiece, state.position)) {
          return {
            ...state,
            currentPiece: rotatedPiece
          };
        }
        
        return state;
      }
      
      case 'HARD_DROP': {
        if (state.gameOver || state.isPaused) return state;
        
        let newPosition = { ...state.position };
        
        while (canMove(state.board, state.currentPiece, { ...newPosition, y: newPosition.y + 1 })) {
          newPosition.y++;
        }
        
        return reducer(
          { ...state, position: newPosition },
          { type: 'MOVE_DOWN' }
        );
      }
      
      case 'TOGGLE_PAUSE':
        return {
          ...state,
          isPaused: !state.isPaused
        };
      
      case 'RESET':
        return initialState;
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    if (!state.currentPiece || state.gameOver || state.isPaused) {
      return;
    }
    
    const interval = setInterval(() => {
      dispatch({ type: 'MOVE_DOWN' });
    }, 1000 - (state.level - 1) * 100);
    
    return () => clearInterval(interval);
  }, [state.currentPiece, state.gameOver, state.isPaused, state.level]);
  
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (state.gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          dispatch({ type: 'MOVE_LEFT' });
          break;
        case 'ArrowRight':
          dispatch({ type: 'MOVE_RIGHT' });
          break;
        case 'ArrowDown':
          dispatch({ type: 'MOVE_DOWN' });
          break;
        case 'ArrowUp':
          dispatch({ type: 'ROTATE' });
          break;
        case ' ':
          dispatch({ type: 'HARD_DROP' });
          break;
        case 'p':
          dispatch({ type: 'TOGGLE_PAUSE' });
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.gameOver]);
  
  return (
    <div className="tetris">
      <div className="game-info">
        <div>分数: {state.score}</div>
        <div>等级: {state.level}</div>
        <div>行数: {state.lines}</div>
        
        {state.gameOver && <div className="game-over">游戏结束</div>}
        {state.isPaused && <div className="paused">暂停</div>}
      </div>
      
      <div className="game-board">
        {renderBoard(state.board, state.currentPiece, state.position)}
      </div>
      
      <div className="controls">
        <button onClick={() => dispatch({ type: 'START_GAME' })}>
          开始游戏
        </button>
        <button onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}>
          {state.isPaused ? '继续' : '暂停'}
        </button>
        <button onClick={() => dispatch({ type: 'RESET' })}>
          重置
        </button>
      </div>
      
      <div className="next-piece">
        <h3>下一个</h3>
        {state.nextPiece && renderPiece(state.nextPiece)}
      </div>
    </div>
  );
}

// 辅助函数
function getRandomPiece() {
  const pieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return pieces[Math.floor(Math.random() * pieces.length)];
}

function canMove(board, piece, position) {
  // 实现碰撞检测逻辑
  return true; // 简化示例
}

function placePiece(board, piece, position) {
  // 实现放置方块逻辑
  return board; // 简化示例
}

function clearLines(board) {
  // 实现清除完整行逻辑
  return { board, linesCleared: 0 }; // 简化示例
}

function calculateScore(lines, level) {
  const scores = [0, 100, 300, 500, 800];
  return scores[lines] * level;
}

function rotatePiece(piece) {
  // 实现方块旋转逻辑
  return piece; // 简化示例
}

function renderBoard(board, currentPiece, position) {
  // 实现渲染逻辑
  return <div className="board">Board</div>; // 简化示例
}

function renderPiece(piece) {
  // 实现渲染方块逻辑
  return <div className="piece">Piece</div>; // 简化示例
}
```

## 第五部分：结合Context全局状态

### 5.1 应用级状态管理

```jsx
const AppContext = createContext(null);

function AppProvider({ children }) {
  const initialState = {
    user: null,
    theme: 'light',
    language: 'zh-CN',
    notifications: [],
    settings: {
      autoSave: true,
      soundEnabled: true
    }
  };
  
  const reducer = (state, action) => {
    switch (action.type) {
      case 'LOGIN':
        return {
          ...state,
          user: action.user
        };
      
      case 'LOGOUT':
        return {
          ...state,
          user: null
        };
      
      case 'SET_THEME':
        return {
          ...state,
          theme: action.theme
        };
      
      case 'SET_LANGUAGE':
        return {
          ...state,
          language: action.language
        };
      
      case 'ADD_NOTIFICATION':
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { id: Date.now(), ...action.notification }
          ]
        };
      
      case 'REMOVE_NOTIFICATION':
        return {
          ...state,
          notifications: state.notifications.filter(n => n.id !== action.id)
        };
      
      case 'UPDATE_SETTINGS':
        return {
          ...state,
          settings: {
            ...state.settings,
            ...action.settings
          }
        };
      
      default:
        return state;
    }
  };
  
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp必须在AppProvider内使用');
  }
  return context;
}

// 在任何组件中使用
function UserMenu() {
  const { state, dispatch } = useApp();
  
  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  return (
    <div>
      {state.user ? (
        <>
          <span>欢迎, {state.user.name}</span>
          <button onClick={handleLogout}>退出</button>
        </>
      ) : (
        <button onClick={() => {/* ... */}}>登录</button>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { state, dispatch } = useApp();
  
  const toggleTheme = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', theme: newTheme });
  };
  
  return (
    <button onClick={toggleTheme}>
      切换到{state.theme === 'light' ? '深色' : '浅色'}模式
    </button>
  );
}

function NotificationCenter() {
  const { state, dispatch } = useApp();
  
  useEffect(() => {
    // 自动清除过期通知
    const interval = setInterval(() => {
      const now = Date.now();
      state.notifications.forEach(notification => {
        if (notification.expiresAt && notification.expiresAt < now) {
          dispatch({ type: 'REMOVE_NOTIFICATION', id: notification.id });
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [state.notifications, dispatch]);
  
  return (
    <div className="notification-center">
      {state.notifications.map(notification => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => dispatch({
            type: 'REMOVE_NOTIFICATION',
            id: notification.id
          })}>
            关闭
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 第六部分：TypeScript集成

### 6.1 类型安全的Reducer

```typescript
type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  coupon: {
    code: string;
    discount: number;
  } | null;
};

type CartAction =
  | { type: 'ADD_ITEM'; product: CartItem }
  | { type: 'REMOVE_ITEM'; id: number }
  | { type: 'UPDATE_QUANTITY'; id: number; quantity: number }
  | { type: 'APPLY_COUPON'; coupon: CartState['coupon'] }
  | { type: 'REMOVE_COUPON' }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  coupon: null
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(item => item.id === action.product.id);
      
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.product, quantity: 1 }]
      };
    }
    
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.id)
      };
    
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.id)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.id
            ? { ...item, quantity: action.quantity }
            : item
        )
      };
    
    case 'APPLY_COUPON':
      return {
        ...state,
        coupon: action.coupon
      };
    
    case 'REMOVE_COUPON':
      return {
        ...state,
        coupon: null
      };
    
    case 'CLEAR_CART':
      return initialState;
    
    default:
      return state;
  }
}

function TypedShoppingCart() {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  const handleAddItem = (product: CartItem) => {
    dispatch({ type: 'ADD_ITEM', product });
  };
  
  return (
    <div>
      {/* UI 组件 */}
    </div>
  );
}
```

### 6.2 复杂状态类型

```typescript
type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type AppState = {
  user: AsyncState<User>;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: number;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }>;
};

type AppAction =
  | { type: 'FETCH_USER_START' }
  | { type: 'FETCH_USER_SUCCESS'; user: User }
  | { type: 'FETCH_USER_ERROR'; error: string }
  | { type: 'SET_THEME'; theme: AppState['theme'] }
  | { type: 'ADD_NOTIFICATION'; notification: Omit<AppState['notifications'][0], 'id'> }
  | { type: 'REMOVE_NOTIFICATION'; id: number };

const initialAppState: AppState = {
  user: {
    data: null,
    loading: false,
    error: null
  },
  theme: 'light',
  notifications: []
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'FETCH_USER_START':
      return {
        ...state,
        user: {
          ...state.user,
          loading: true,
          error: null
        }
      };
    
    case 'FETCH_USER_SUCCESS':
      return {
        ...state,
        user: {
          data: action.user,
          loading: false,
          error: null
        }
      };
    
    case 'FETCH_USER_ERROR':
      return {
        ...state,
        user: {
          ...state.user,
          loading: false,
          error: action.error
        }
      };
    
    case 'SET_THEME':
      return {
        ...state,
        theme: action.theme
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id: Date.now(), ...action.notification }
        ]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id)
      };
    
    default:
      return state;
  }
}
```

## 第七部分：性能优化

### 7.1 避免不必要的重渲染

```jsx
const AppContext = createContext(null);

function OptimizedAppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // 使用useMemo避免每次渲染创建新对象
  const value = useMemo(() => ({ state, dispatch }), [state]);
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// 使用选择器获取特定状态
function useAppSelector(selector) {
  const { state } = useContext(AppContext);
  return selector(state);
}

// 只订阅需要的状态
function UserDisplay() {
  // 只会在user变化时重渲染
  const user = useAppSelector(state => state.user);
  
  return <div>User: {user?.name}</div>;
}

// 使用React.memo避免不必要的重渲染
const MemoizedComponent = React.memo(function Component({ item, onUpdate }) {
  return (
    <div>
      <h3>{item.name}</h3>
      <button onClick={onUpdate}>更新</button>
    </div>
  );
});

function ParentComponent() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // 使用useCallback缓存回调函数
  const handleUpdate = useCallback((id) => {
    dispatch({ type: 'UPDATE_ITEM', id });
  }, []);
  
  return (
    <div>
      {state.items.map(item => (
        <MemoizedComponent
          key={item.id}
          item={item}
          onUpdate={() => handleUpdate(item.id)}
        />
      ))}
    </div>
  );
}
```

### 7.2 拆分大型Reducer

```jsx
// 将大型reducer拆分为多个小型reducer
function combineReducers(reducers) {
  return (state = {}, action) => {
    const newState = {};
    
    for (const key in reducers) {
      newState[key] = reducers[key](state[key], action);
    }
    
    return newState;
  };
}

function userReducer(state = { data: null }, action) {
  switch (action.type) {
    case 'LOGIN':
      return { data: action.user };
    case 'LOGOUT':
      return { data: null };
    default:
      return state;
  }
}

function settingsReducer(state = { theme: 'light' }, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  user: userReducer,
  settings: settingsReducer
});

function App() {
  const [state, dispatch] = useReducer(rootReducer, {});
  
  return (
    <div>
      {/* 组件 */}
    </div>
  );
}
```

## 第八部分：React 19新特性

### 8.1 使用Server Actions

```jsx
'use server';

async function updateCartAction(formData) {
  const productId = formData.get('productId');
  const quantity = parseInt(formData.get('quantity'));
  
  // 服务器端逻辑
  await updateDatabase(productId, quantity);
  
  return { success: true };
}

'use client';

function ShoppingCartWithServerActions() {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [isPending, startTransition] = useTransition();
  
  const handleUpdateQuantity = async (id, quantity) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('productId', id);
      formData.set('quantity', quantity);
      
      const result = await updateCartAction(formData);
      
      if (result.success) {
        dispatch({ type: 'UPDATE_QUANTITY', id, quantity });
      }
    });
  };
  
  return (
    <div>
      {state.items.map(item => (
        <div key={item.id}>
          <h3>{item.name}</h3>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value))}
            disabled={isPending}
          />
        </div>
      ))}
      
      {isPending && <div>更新中...</div>}
    </div>
  );
}
```

### 8.2 使用useActionState

```jsx
import { useActionState } from 'react';

async function submitFormAction(prevState, formData) {
  const data = {
    name: formData.get('name'),
    email: formData.get('email')
  };
  
  try {
    await submitToServer(data);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function FormWithActionState() {
  const [formState, submitAction, isPending] = useActionState(
    submitFormAction,
    { success: false, error: null }
  );
  
  return (
    <form action={submitAction}>
      <input name="name" placeholder="姓名" required />
      <input name="email" type="email" placeholder="邮箱" required />
      
      <button type="submit" disabled={isPending}>
        {isPending ? '提交中...' : '提交'}
      </button>
      
      {formState.success && <p className="success">提交成功！</p>}
      {formState.error && <p className="error">{formState.error}</p>}
    </form>
  );
}
```

## 注意事项

### 1. Reducer纯函数原则

reducer必须是纯函数，不能包含：

```jsx
// 错误示例
function badReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      // 直接修改state
      state.items.push(action.item); // ❌
      return state;
    
    case 'FETCH_DATA':
      // 在reducer中进行异步操作
      fetch('/api/data').then(/* ... */); // ❌
      return state;
    
    case 'UPDATE_TIME':
      // 使用非确定性函数
      return { ...state, time: Date.now() }; // ❌
    
    default:
      return state;
  }
}

// 正确示例
function goodReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      // 返回新对象
      return {
        ...state,
        items: [...state.items, action.item]
      };
    
    case 'SET_DATA':
      // 只处理同步逻辑
      return {
        ...state,
        data: action.payload
      };
    
    case 'SET_TIME':
      // 时间从action中获取
      return {
        ...state,
        time: action.timestamp
      };
    
    default:
      return state;
  }
}
```

### 2. 状态不可变性

始终返回新对象，不要修改原有state：

```jsx
// 错误
case 'UPDATE_USER':
  state.user.name = action.name; // ❌
  return state;

// 正确
case 'UPDATE_USER':
  return {
    ...state,
    user: {
      ...state.user,
      name: action.name
    }
  };
```

### 3. Action类型命名

使用统一的命名规范：

```jsx
// 推荐：动词_名词格式
const ActionTypes = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  FETCH_START: 'FETCH_START',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERROR: 'FETCH_ERROR'
};
```

### 4. 避免过度使用

不是所有状态都需要useReducer：

```jsx
// 简单状态用useState
const [count, setCount] = useState(0);

// 复杂状态用useReducer
const [complexState, dispatch] = useReducer(complexReducer, initialState);
```

### 5. 性能考虑

大型应用中需要注意性能：

```jsx
// 使用useMemo缓存计算结果
const total = useMemo(() => {
  return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}, [state.items]);

// 使用useCallback缓存dispatch函数
const handleAdd = useCallback((item) => {
  dispatch({ type: 'ADD_ITEM', item });
}, []);

// 使用React.memo避免不必要的重渲染
const MemoizedItem = React.memo(CartItem);
```

## 常见问题

### 1. 为什么dispatch后状态没有立即更新？

dispatch和setState一样是异步的：

```jsx
function Component() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const handleClick = () => {
    dispatch({ type: 'INCREMENT' });
    console.log(state.count); // ❌ 仍然是旧值
    
    // 在下次渲染时才能获取新值
  };
  
  useEffect(() => {
    console.log(state.count); // ✅ 新值
  }, [state.count]);
  
  return <button onClick={handleClick}>+1</button>;
}
```

### 2. 如何在reducer中处理异步操作？

异步操作应该在组件中处理，不在reducer中：

```jsx
function Component() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const fetchData = async () => {
    dispatch({ type: 'FETCH_START' });
    
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', error: error.message });
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return <div>{/* UI */}</div>;
}
```

### 3. 如何在多个组件间共享useReducer状态？

使用Context：

```jsx
const StateContext = createContext(null);

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
}

function useSharedState() {
  return useContext(StateContext);
}
```

### 4. 如何调试复杂的reducer？

使用reducer中间件：

```jsx
function reducerWithLogger(reducer) {
  return (state, action) => {
    console.group(action.type);
    console.log('Previous State:', state);
    console.log('Action:', action);
    const nextState = reducer(state, action);
    console.log('Next State:', nextState);
    console.groupEnd();
    return nextState;
  };
}

const [state, dispatch] = useReducer(
  reducerWithLogger(myReducer),
  initialState
);
```

### 5. reducer太大怎么办？

拆分成多个小reducer：

```jsx
function userReducer(state, action) {
  // 处理用户相关action
}

function cartReducer(state, action) {
  // 处理购物车相关action
}

function rootReducer(state, action) {
  return {
    user: userReducer(state.user, action),
    cart: cartReducer(state.cart, action)
  };
}
```

### 6. 如何实现撤销/重做功能？

保存历史状态：

```jsx
function historyReducer(reducer) {
  const initialHistoryState = {
    past: [],
    present: null,
    future: []
  };
  
  return (state = initialHistoryState, action) => {
    const { past, present, future } = state;
    
    switch (action.type) {
      case 'UNDO':
        if (past.length === 0) return state;
        
        return {
          past: past.slice(0, past.length - 1),
          present: past[past.length - 1],
          future: [present, ...future]
        };
      
      case 'REDO':
        if (future.length === 0) return state;
        
        return {
          past: [...past, present],
          present: future[0],
          future: future.slice(1)
        };
      
      default:
        const newPresent = reducer(present, action);
        
        if (present === newPresent) return state;
        
        return {
          past: [...past, present],
          present: newPresent,
          future: []
        };
    }
  };
}
```

## 总结

### useReducer实战要点

1. **适用场景**
   - 复杂的状态逻辑
   - 多个相关状态
   - 状态更新依赖当前状态
   - 需要在多个组件间共享状态

2. **最佳实践**
   - reducer必须是纯函数
   - 保持状态不可变性
   - 使用统一的action命名
   - 合理拆分reducer
   - 结合TypeScript使用

3. **性能优化**
   - 使用useMemo缓存计算
   - 使用useCallback缓存回调
   - 使用React.memo避免重渲染
   - 拆分Context避免过度渲染

4. **常见模式**
   - 购物车系统
   - 表单管理
   - 数据获取
   - 游戏状态
   - 全局状态管理

5. **与其他方案对比**
   - useState: 简单状态
   - useReducer: 复杂状态
   - Redux: 大型应用全局状态
   - Context + useReducer: 中型应用全局状态

6. **React 19增强**
   - Server Actions集成
   - useActionState简化表单
   - 更好的异步支持
   - 自动批处理优化

通过本章的实战案例，你已经掌握了useReducer在各种真实场景中的应用。记住，选择合适的工具很重要，不要过度使用useReducer，但当需要管理复杂状态时，它是最好的选择！
