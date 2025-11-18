# Web App Manifest - 完整PWA配置指南

## 1. Manifest基础

### 1.1 什么是Web App Manifest

Web App Manifest是一个JSON文件,为PWA提供应用元数据,控制应用的外观和行为。

```json
{
  "name": "我的PWA应用",
  "short_name": "PWA",
  "description": "这是一个渐进式Web应用",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 1.2 引入Manifest

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 引入manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- iOS特殊处理 -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="PWA">
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
  
  <!-- 主题颜色 -->
  <meta name="theme-color" content="#2196F3">
  
  <title>PWA应用</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

## 2. Manifest属性详解

### 2.1 基本信息

```json
{
  "name": "完整应用名称",
  "short_name": "短名称",
  "description": "应用描述文字",
  "lang": "zh-CN",
  "dir": "ltr",
  
  "scope": "/app/",
  "start_url": "/?source=pwa",
  
  "display": "standalone",
  "orientation": "any",
  
  "theme_color": "#2196F3",
  "background_color": "#ffffff"
}
```

#### name和short_name

```json
{
  "name": "我的超级应用 - 最好的PWA体验",
  "short_name": "超级应用",
  
  "name_translations": {
    "en": "My Super App - Best PWA Experience",
    "ja": "マイスーパーアプリ"
  }
}
```

#### scope和start_url

```json
{
  "scope": "/app/",
  "start_url": "/app/?utm_source=homescreen",
  
  "start_url": "/?utm_source=pwa&utm_medium=homescreen&utm_campaign=install"
}
```

### 2.2 显示模式

```json
{
  "display": "standalone",
  
  "display_override": [
    "window-controls-overlay",
    "minimal-ui",
    "standalone",
    "browser"
  ]
}
```

```typescript
const displayModes = {
  fullscreen: {
    description: '全屏模式',
    ui: '隐藏所有浏览器UI',
    usage: '游戏、视频应用'
  },
  
  standalone: {
    description: '独立应用模式',
    ui: '隐藏浏览器UI,保留状态栏',
    usage: '大多数PWA推荐'
  },
  
  'minimal-ui': {
    description: '最小UI模式',
    ui: '保留最小浏览器控制',
    usage: '需要导航控制的应用'
  },
  
  browser: {
    description: '浏览器模式',
    ui: '完整浏览器界面',
    usage: '降级选项'
  }
};

// 检测显示模式
function getDisplayMode() {
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen';
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone';
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui';
  }
  return 'browser';
}
```

### 2.3 方向设置

```json
{
  "orientation": "portrait",
  
  "orientations": [
    "any",
    "natural",
    "landscape",
    "landscape-primary",
    "landscape-secondary",
    "portrait",
    "portrait-primary",
    "portrait-secondary"
  ]
}
```

### 2.4 颜色主题

```json
{
  "theme_color": "#2196F3",
  "background_color": "#ffffff",
  
  "theme_color_media_queries": [
    {
      "media": "(prefers-color-scheme: dark)",
      "color": "#1a1a1a"
    },
    {
      "media": "(prefers-color-scheme: light)",
      "color": "#ffffff"
    }
  ]
}
```

## 3. 图标配置

### 3.1 基础图标

```json
{
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3.2 可遮罩图标

```json
{
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

```typescript
const iconPurposes = {
  any: {
    description: '任何场景',
    requirement: '普通图标'
  },
  
  maskable: {
    description: '可遮罩图标',
    requirement: '图标内容在安全区域内',
    safeZone: '80%中心区域',
    tools: ['maskable.app生成器']
  },
  
  monochrome: {
    description: '单色图标',
    usage: '通知、快捷方式'
  }
};
```

### 3.3 多格式图标

```json
{
  "icons": [
    {
      "src": "/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    },
    {
      "src": "/icons/icon.webp",
      "sizes": "512x512",
      "type": "image/webp"
    },
    {
      "src": "/icons/icon.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 4. 启动画面

### 4.1 启动画面配置

```json
{
  "name": "我的应用",
  "background_color": "#ffffff",
  "theme_color": "#2196F3",
  "icons": [
    {
      "src": "/icons/splash-640x1136.png",
      "sizes": "640x1136",
      "type": "image/png"
    }
  ]
}
```

### 4.2 生成启动画面

```typescript
// 自动生成启动画面配置
function generateSplashScreens() {
  const devices = [
    { name: 'iPhone SE', width: 640, height: 1136 },
    { name: 'iPhone 8', width: 750, height: 1334 },
    { name: 'iPhone 11', width: 828, height: 1792 },
    { name: 'iPhone 11 Pro Max', width: 1242, height: 2688 },
    { name: 'iPad', width: 1536, height: 2048 },
    { name: 'iPad Pro 12.9"', width: 2048, height: 2732 }
  ];
  
  return devices.map(device => ({
    src: `/splash/splash-${device.width}x${device.height}.png`,
    sizes: `${device.width}x${device.height}`,
    type: 'image/png',
    device: device.name
  }));
}

// iOS启动画面meta标签
const iosSplashScreens = `
<link rel="apple-touch-startup-image" 
      href="/splash/splash-640x1136.png" 
      media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)">
<link rel="apple-touch-startup-image" 
      href="/splash/splash-750x1334.png" 
      media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)">
`;
```

## 5. 快捷方式

### 5.1 应用快捷方式

```json
{
  "shortcuts": [
    {
      "name": "新建文档",
      "short_name": "新建",
      "description": "创建新文档",
      "url": "/new?source=shortcut",
      "icons": [
        {
          "src": "/icons/new-doc.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "最近文档",
      "short_name": "最近",
      "description": "查看最近编辑的文档",
      "url": "/recent?source=shortcut",
      "icons": [
        {
          "src": "/icons/recent.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    },
    {
      "name": "搜索",
      "short_name": "搜索",
      "description": "搜索文档",
      "url": "/search?source=shortcut",
      "icons": [
        {
          "src": "/icons/search.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ]
}
```

### 5.2 动态快捷方式

```typescript
// 更新快捷方式(需要后端支持)
async function updateShortcuts() {
  const manifest = {
    ...existingManifest,
    shortcuts: [
      {
        name: '继续编辑',
        url: '/edit/' + lastDocumentId,
        icons: [{ src: '/icons/edit.png', sizes: '96x96' }]
      },
      ...otherShortcuts
    ]
  };
  
  // 生成新的manifest
  const manifestBlob = new Blob([JSON.stringify(manifest)], {
    type: 'application/json'
  });
  
  const manifestURL = URL.createObjectURL(manifestBlob);
  
  // 更新manifest引用
  document.querySelector('link[rel="manifest"]')?.setAttribute('href', manifestURL);
}
```

## 6. 分享目标

### 6.1 接收分享

```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "video/*"]
        }
      ]
    }
  }
}
```

### 6.2 处理分享

```typescript
// 处理分享数据
app.post('/share', async (req, res) => {
  const { title, text, url } = req.body;
  const files = req.files;
  
  // 处理分享内容
  console.log('接收到分享:', { title, text, url });
  
  if (files) {
    for (const file of files) {
      await saveFile(file);
    }
  }
  
  // 重定向到应用
  res.redirect('/');
});

// React处理分享
export function ShareHandler() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedTitle = urlParams.get('title');
    const sharedText = urlParams.get('text');
    const sharedUrl = urlParams.get('url');
    
    if (sharedTitle || sharedText || sharedUrl) {
      handleSharedContent({
        title: sharedTitle,
        text: sharedText,
        url: sharedUrl
      });
    }
  }, []);
  
  return null;
}
```

## 7. 协议处理

### 7.1 URL协议处理

```json
{
  "protocol_handlers": [
    {
      "protocol": "web+music",
      "url": "/play?track=%s"
    },
    {
      "protocol": "mailto",
      "url": "/compose?to=%s"
    }
  ]
}
```

### 7.2 文件处理

```json
{
  "file_handlers": [
    {
      "action": "/open-file",
      "accept": {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
        "application/pdf": [".pdf"]
      }
    }
  ]
}
```

## 8. 相关应用

### 8.1 关联原生应用

```json
{
  "related_applications": [
    {
      "platform": "play",
      "id": "com.example.app",
      "url": "https://play.google.com/store/apps/details?id=com.example.app"
    },
    {
      "platform": "itunes",
      "url": "https://apps.apple.com/app/id123456789"
    }
  ],
  "prefer_related_applications": false
}
```

### 8.2 优先原生应用

```json
{
  "related_applications": [
    {
      "platform": "play",
      "id": "com.example.app"
    }
  ],
  "prefer_related_applications": true
}
```

## 9. 类别和IARC评级

### 9.1 应用类别

```json
{
  "categories": [
    "productivity",
    "business",
    "utilities"
  ],
  
  "available_categories": [
    "books",
    "business",
    "education",
    "entertainment",
    "finance",
    "fitness",
    "food",
    "games",
    "government",
    "health",
    "kids",
    "lifestyle",
    "magazines",
    "medical",
    "music",
    "navigation",
    "news",
    "personalization",
    "photo",
    "politics",
    "productivity",
    "security",
    "shopping",
    "social",
    "sports",
    "travel",
    "utilities",
    "weather"
  ]
}
```

### 9.2 IARC评级

```json
{
  "iarc_rating_id": "e84b072d-71b3-4d3e-86ae-31a8ce4e53b7"
}
```

## 10. React中的Manifest管理

### 10.1 动态生成Manifest

```tsx
// manifest-generator.ts
export function generateManifest(options: {
  name: string;
  shortName: string;
  themeColor: string;
  backgroundColor: string;
}) {
  return {
    name: options.name,
    short_name: options.shortName,
    start_url: '/',
    display: 'standalone',
    theme_color: options.themeColor,
    background_color: options.backgroundColor,
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };
}

// ManifestProvider.tsx
export function ManifestProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const manifest = generateManifest({
      name: '我的应用',
      shortName: 'App',
      themeColor: '#2196F3',
      backgroundColor: '#ffffff'
    });
    
    const manifestBlob = new Blob([JSON.stringify(manifest)], {
      type: 'application/json'
    });
    const manifestURL = URL.createObjectURL(manifestBlob);
    
    let link = document.querySelector('link[rel="manifest"]');
    
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'manifest');
      document.head.appendChild(link);
    }
    
    link.setAttribute('href', manifestURL);
    
    return () => {
      URL.revokeObjectURL(manifestURL);
    };
  }, []);
  
  return <>{children}</>;
}
```

### 10.2 主题颜色切换

```tsx
// useThemeColor.ts
export function useThemeColor(color: string) {
  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', color);
  }, [color]);
}

// App.tsx
function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  useThemeColor(darkMode ? '#1a1a1a' : '#2196F3');
  
  return <div>...</div>;
}
```

## 11. 验证和调试

### 11.1 Manifest验证

```typescript
// 验证manifest
async function validateManifest(manifestUrl: string) {
  const response = await fetch(manifestUrl);
  const manifest = await response.json();
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 必需字段检查
  if (!manifest.name) {
    errors.push('缺少name字段');
  }
  
  if (!manifest.icons || manifest.icons.length === 0) {
    errors.push('缺少icons字段');
  }
  
  if (!manifest.start_url) {
    warnings.push('建议设置start_url');
  }
  
  // 图标尺寸检查
  const requiredSizes = ['192x192', '512x512'];
  const iconSizes = manifest.icons?.map((icon: any) => icon.sizes) || [];
  
  requiredSizes.forEach(size => {
    if (!iconSizes.includes(size)) {
      warnings.push(`建议包含${size}尺寸图标`);
    }
  });
  
  // display模式检查
  if (!['fullscreen', 'standalone', 'minimal-ui', 'browser'].includes(manifest.display)) {
    warnings.push('display值无效');
  }
  
  return { errors, warnings, valid: errors.length === 0 };
}
```

### 11.2 Chrome DevTools

```typescript
const debugManifest = {
  steps: [
    '打开Chrome DevTools',
    '切换到Application面板',
    '选择Manifest',
    '查看解析的manifest内容',
    '检查错误和警告',
    '测试添加到主屏幕'
  ],
  
  checks: [
    'manifest文件可访问',
    '所有图标可加载',
    'start_url有效',
    '显示模式正确',
    '主题颜色显示'
  ]
};
```

## 12. 最佳实践

```typescript
const manifestBestPractices = {
  naming: [
    'name: 完整应用名称(最多45字符)',
    'short_name: 主屏幕显示(最多12字符)',
    '提供描述性名称',
    '避免使用通用词汇',
    '考虑多语言支持'
  ],
  
  icons: [
    '提供192x192和512x512图标',
    '使用maskable图标',
    '支持多种格式',
    '优化图标大小',
    '安全区域内设计'
  ],
  
  display: [
    '大多数应用使用standalone',
    '游戏使用fullscreen',
    '提供display_override降级',
    '测试不同显示模式',
    '考虑用户体验'
  ],
  
  colors: [
    'theme_color与品牌一致',
    'background_color避免闪烁',
    '支持深色模式',
    '确保对比度',
    '测试不同主题'
  ],
  
  urls: [
    'start_url包含跟踪参数',
    'scope限制应用范围',
    '确保URL有效',
    '测试离线访问',
    '处理深层链接'
  ]
};
```

## 13. 总结

Web App Manifest的核心要点:

1. **基本配置**: name, icons, start_url, display
2. **图标**: 多尺寸, maskable, 多格式
3. **显示**: standalone模式最常用
4. **颜色**: theme_color和background_color
5. **快捷方式**: 提供常用功能入口
6. **分享**: 接收系统分享内容
7. **验证**: 使用工具检查配置

正确配置Manifest是PWA体验的关键。

