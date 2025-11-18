# Service Worker离线缓存 - 完整离线策略指南

## 1. Service Worker基础

### 1.1 什么是Service Worker

Service Worker是运行在浏览器后台的脚本,独立于网页,提供离线缓存、推送通知、后台同步等功能。

```typescript
const serviceWorkerConcepts = {
  definition: '独立于主线程的JavaScript工作线程',
  
  characteristics: [
    '无法直接访问DOM',
    '完全异步,不能使用同步API',
    '必须在HTTPS环境下运行(localhost除外)',
    '可以拦截和处理网络请求',
    '具有自己的生命周期'
  ],
  
  capabilities: [
    '离线缓存',
    '网络请求拦截',
    '后台同步',
    '推送通知',
    '资源预取'
  ],
  
  lifecycle: {
    register: '注册',
    install: '安装',
    activate: '激活',
    fetch: '拦截请求',
    message: '消息通信'
  }
};
```

### 1.2 Service Worker生命周期

```javascript
// Service Worker生命周期
self.addEventListener('install', (event) => {
  console.log('Service Worker安装中...');
  
  // 跳过等待,立即激活
  self.skipWaiting();
  
  event.waitUntil(
    // 预缓存资源
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/app.js',
        '/app.css'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker激活中...');
  
  event.waitUntil(
    // 清理旧缓存
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== 'v1')
          .map(name => caches.delete(name))
      );
    }).then(() => {
      // 立即控制所有客户端
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('拦截请求:', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
```

## 2. Service Worker注册

### 2.1 基础注册

```javascript
// 注册Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker注册成功:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker注册失败:', error);
      });
  });
}

// 指定作用域
navigator.serviceWorker.register('/sw.js', {
  scope: '/app/'
}).then(registration => {
  console.log('作用域:', registration.scope);
});

// 注册检查
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('已注册的Service Worker:', registrations);
});

// 注销Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  for (const registration of registrations) {
    registration.unregister();
  }
});
```

### 2.2 React中的注册

```tsx
// registerServiceWorker.ts
export function register(config?: {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
}) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // 新内容可用
                    console.log('新内容可用,请刷新页面');
                    
                    if (config?.onUpdate) {
                      config.onUpdate(registration);
                    }
                  } else {
                    // 内容已缓存
                    console.log('内容已缓存,离线可用');
                    
                    if (config?.onSuccess) {
                      config.onSuccess(registration);
                    }
                  }
                }
              };
            }
          };
        })
        .catch(error => {
          console.error('Service Worker注册失败:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

// App.tsx
import { useEffect } from 'react';
import * as serviceWorker from './serviceWorker';

function App() {
  useEffect(() => {
    serviceWorker.register({
      onSuccess: () => {
        console.log('应用已离线缓存');
      },
      onUpdate: (registration) => {
        console.log('发现新版本');
        // 提示用户更新
      }
    });
  }, []);
  
  return <div>App</div>;
}
```

## 3. 缓存策略

### 3.1 Cache First(缓存优先)

```javascript
// 优先使用缓存,缓存不存在时请求网络
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // 返回缓存
        }
        
        return fetch(event.request).then(response => {
          // 克隆响应,因为响应流只能使用一次
          const responseToCache = response.clone();
          
          caches.open('v1').then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});

// 适用场景: 静态资源(CSS、JS、图片)
```

### 3.2 Network First(网络优先)

```javascript
// 优先请求网络,失败时使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 更新缓存
        const responseToCache = response.clone();
        caches.open('v1').then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // 网络失败,使用缓存
        return caches.match(event.request);
      })
  );
});

// 适用场景: API数据、动态内容
```

### 3.3 Stale While Revalidate(后台更新)

```javascript
// 立即返回缓存,同时后台更新
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('v1').then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // 更新缓存
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        
        // 立即返回缓存(如果有),同时后台更新
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// 适用场景: 头像、背景图等不紧急更新的资源
```

### 3.4 Network Only(仅网络)

```javascript
// 始终请求网络
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// 适用场景: 实时数据、支付接口
```

### 3.5 Cache Only(仅缓存)

```javascript
// 仅使用缓存
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request));
});

// 适用场景: 已预缓存的静态资源
```

### 3.6 组合策略

```javascript
// 根据请求类型选择策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // API请求 - 网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
  }
  // 静态资源 - 缓存优先
  else if (request.destination === 'image' || 
           request.destination === 'script' || 
           request.destination === 'style') {
    event.respondWith(cacheFirst(request));
  }
  // HTML - 网络优先
  else if (request.destination === 'document') {
    event.respondWith(networkFirst(request));
  }
  // 其他 - 后台更新
  else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  const response = await fetch(request);
  const cache = await caches.open('v1');
  cache.put(request, response.clone());
  
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open('v1');
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open('v1');
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });
  
  return cached || fetchPromise;
}
```

## 4. Workbox工具库

### 4.1 Workbox简介

```bash
# 安装Workbox
npm install workbox-webpack-plugin --save-dev
# 或
npm install workbox-cli -g
```

### 4.2 Workbox配置

```javascript
// webpack.config.js
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  plugins: [
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\.example\.com/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 5 * 60 // 5分钟
            }
          }
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 30 * 24 * 60 * 60 // 30天
            }
          }
        }
      ]
    })
  ]
};

// Vite中使用
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache'
            }
          }
        ]
      }
    })
  ]
};
```

### 4.3 Workbox策略使用

```javascript
// sw.js - 使用Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = workbox.strategies;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { ExpirationPlugin } = workbox.expiration;

// 缓存图片
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30天
      })
    ]
  })
);

// API请求
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5分钟
      })
    ]
  })
);

// 静态资源
registerRoute(
  ({ request }) => 
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
);
```

## 5. 高级缓存技术

### 5.1 预缓存

```javascript
// 安装时预缓存
const CACHE_NAME = 'v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/app.css',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Workbox预缓存
workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: 'abcd1234' },
  { url: '/app.js', revision: 'efgh5678' },
  { url: '/app.css', revision: 'ijkl9012' }
]);
```

### 5.2 缓存版本控制

```javascript
const CACHE_VERSION = 'v2';
const CACHE_NAME = `app-${CACHE_VERSION}`;

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('app-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
```

### 5.3 缓存过期策略

```javascript
// 手动实现缓存过期
async function cacheWithExpiration(request, maxAge) {
  const cache = await caches.open('v1');
  const cached = await cache.match(request);
  
  if (cached) {
    const cachedTime = new Date(cached.headers.get('sw-cached-time'));
    const now = new Date();
    
    if (now - cachedTime < maxAge) {
      return cached;
    }
  }
  
  const response = await fetch(request);
  const clonedResponse = response.clone();
  
  // 添加缓存时间戳
  const headers = new Headers(clonedResponse.headers);
  headers.set('sw-cached-time', new Date().toISOString());
  
  const responseWithTime = new Response(clonedResponse.body, {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers
  });
  
  cache.put(request, responseWithTime);
  return response;
}

// Workbox过期插件
import { ExpirationPlugin } from 'workbox-expiration';

new CacheFirst({
  cacheName: 'images',
  plugins: [
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
      purgeOnQuotaError: true
    })
  ]
});
```

### 5.4 范围请求支持

```javascript
// 支持视频等大文件的范围请求
self.addEventListener('fetch', (event) => {
  if (event.request.headers.has('range')) {
    event.respondWith(
      caches.open('v1').then(cache => {
        return cache.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

## 6. 离线页面处理

### 6.1 离线回退页面

```javascript
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.add(OFFLINE_URL);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
```

### 6.2 离线内容展示

```javascript
// 离线时展示缓存的内容列表
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(async () => {
          const cache = await caches.open('v1');
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // 返回离线页面
          return cache.match('/offline.html');
        })
    );
  }
});
```

## 7. 通信机制

### 7.1 页面与Service Worker通信

```javascript
// 页面发送消息
if (navigator.serviceWorker.controller) {
  navigator.serviceWorker.controller.postMessage({
    type: 'CACHE_URLS',
    urls: ['/page1.html', '/page2.html']
  });
}

// Service Worker接收消息
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open('v1').then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  // 发送响应
  event.ports[0].postMessage({ success: true });
});

// 页面接收响应
navigator.serviceWorker.controller.postMessage(
  { type: 'GET_VERSION' },
  [new MessageChannel().port2]
).then(response => {
  console.log('版本:', response.version);
});
```

### 7.2 广播更新

```javascript
// Service Worker广播消息给所有客户端
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_ACTIVATED',
          version: 'v2'
        });
      });
    })
  );
});

// 页面接收广播
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'SW_ACTIVATED') {
    console.log('Service Worker已激活,版本:', event.data.version);
    // 提示用户刷新
  }
});
```

## 8. 调试与测试

### 8.1 Chrome DevTools

```typescript
const debuggingTools = {
  application: [
    'Service Workers面板',
    '查看已注册的SW',
    '更新/注销SW',
    '离线模式模拟',
    'Update on reload'
  ],
  
  cache: [
    'Cache Storage查看',
    '查看缓存内容',
    '删除缓存',
    '刷新缓存'
  ],
  
  network: [
    '查看SW拦截的请求',
    '区分from SW的请求',
    '模拟慢速网络',
    '离线测试'
  ]
};

// 查看当前Service Worker状态
navigator.serviceWorker.getRegistration().then(registration => {
  if (registration) {
    console.log('状态:', registration.active?.state);
    console.log('作用域:', registration.scope);
  }
});
```

### 8.2 测试用例

```typescript
// sw.test.ts
describe('Service Worker', () => {
  beforeEach(async () => {
    // 清理缓存
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  });
  
  it('should cache resources', async () => {
    const cache = await caches.open('v1');
    await cache.add('/test.html');
    
    const cached = await cache.match('/test.html');
    expect(cached).toBeDefined();
  });
  
  it('should serve from cache when offline', async () => {
    const cache = await caches.open('v1');
    await cache.put('/api/data', new Response(JSON.stringify({ data: 'cached' })));
    
    // 模拟离线
    const response = await caches.match('/api/data');
    const data = await response?.json();
    
    expect(data).toEqual({ data: 'cached' });
  });
});
```

## 9. 性能优化

### 9.1 缓存大小限制

```javascript
// 检查存储配额
if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate().then(estimate => {
    console.log('已使用:', estimate.usage);
    console.log('配额:', estimate.quota);
    console.log('使用率:', (estimate.usage / estimate.quota * 100).toFixed(2) + '%');
  });
}

// 限制缓存大小
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return limitCacheSize(cacheName, maxItems);
  }
}
```

### 9.2 选择性缓存

```javascript
// 只缓存成功的响应
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then(response => {
      // 只缓存2xx响应
      if (response.status === 200) {
        const clone = response.clone();
        caches.open('v1').then(cache => {
          cache.put(event.request, clone);
        });
      }
      
      return response;
    })
  );
});

// 排除某些请求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 不缓存API请求
  if (url.pathname.startsWith('/api/auth')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // 不缓存POST请求
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // 正常缓存策略
  event.respondWith(cacheFirst(event.request));
});
```

## 10. 最佳实践

```typescript
const serviceWorkerBestPractices = {
  strategy: [
    '根据内容类型选择合适的缓存策略',
    '静态资源使用Cache First',
    'API数据使用Network First',
    '图片使用Stale While Revalidate',
    '实时数据不缓存'
  ],
  
  caching: [
    '合理设置缓存过期时间',
    '限制缓存大小',
    '版本化缓存',
    '及时清理旧缓存',
    '预缓存关键资源'
  ],
  
  updates: [
    '提供更新提示',
    '支持跳过等待',
    '优雅的更新流程',
    '避免破坏性更新',
    '版本回滚机制'
  ],
  
  performance: [
    '避免缓存大文件',
    '使用压缩响应',
    '选择性缓存',
    '监控缓存性能',
    '定期清理'
  ],
  
  security: [
    '仅在HTTPS下运行',
    '验证缓存内容',
    '避免缓存敏感信息',
    '设置合适的作用域',
    '定期更新'
  ]
};
```

## 11. 总结

Service Worker离线缓存的核心要点:

1. **生命周期**: install, activate, fetch
2. **缓存策略**: Cache First, Network First, Stale While Revalidate
3. **Workbox**: 简化Service Worker开发
4. **版本管理**: 缓存版本控制和清理
5. **离线体验**: 离线页面和内容展示
6. **通信机制**: 页面与SW双向通信
7. **性能优化**: 缓存大小限制和选择性缓存

通过正确实施Service Worker,可以提供流畅的离线体验。

