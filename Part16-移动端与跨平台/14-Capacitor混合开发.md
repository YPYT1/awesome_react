# Capacitor混合开发 - 现代跨平台应用开发

## 1. Capacitor简介

### 1.1 什么是Capacitor

```typescript
const capacitorOverview = {
  definition: 'Ionic团队开发的跨平台运行时',
  
  features: {
    webNative: '将Web应用打包为原生应用',
    plugins: '统一的原生功能API',
    codesharing: '与Web应用共享代码',
    customNative: '支持自定义原生代码',
    liveReload: '热更新支持'
  },
  
  advantages: [
    '现代化的API设计',
    '优秀的TypeScript支持',
    '活跃的社区',
    '灵活的插件系统',
    '与Web技术无缝集成'
  ],
  
  vsOthers: {
    cordova: '更现代,API更简洁,性能更好',
    reactNative: '基于Web,学习成本低,代码复用率高',
    flutter: '使用熟悉的Web技术栈'
  }
};
```

### 1.2 核心概念

```typescript
// Capacitor架构
const capacitorArchitecture = {
  layers: {
    webLayer: {
      description: 'Web应用层',
      tech: ['React', 'Vue', 'Angular', '原生JS'],
      build: 'Vite/Webpack等构建工具'
    },
    
    bridgeLayer: {
      description: '桥接层',
      role: 'Web与Native通信',
      api: 'Capacitor Core API'
    },
    
    nativeLayer: {
      description: '原生层',
      platforms: ['iOS (Swift)', 'Android (Kotlin/Java)'],
      access: '通过插件访问原生功能'
    }
  },
  
  plugins: {
    official: [
      'Camera', 'Filesystem', 'Geolocation', 
      'Storage', 'Network', 'Device'
    ],
    community: [
      '@capacitor-community/*',
      '第三方插件',
      '自定义插件'
    ]
  }
};
```

## 2. 项目初始化

### 2.1 安装和配置

```bash
# 创建React应用
npm create vite@latest my-app -- --template react-ts
cd my-app

# 安装Capacitor
npm install @capacitor/core @capacitor/cli

# 初始化Capacitor
npx cap init

# 添加平台
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android

# 安装常用插件
npm install @capacitor/camera @capacitor/filesystem @capacitor/storage
```

### 2.2 配置文件

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'My App',
  webDir: 'dist',
  
  server: {
    // 开发环境配置
    url: process.env.DEV_SERVER_URL,
    cleartext: true
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: true,
      spinnerColor: '#2196F3'
    },
    
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    
    StatusBar: {
      style: 'light',
      backgroundColor: '#2196F3'
    }
  },
  
  ios: {
    contentInset: 'always'
  },
  
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
```

### 2.3 构建配置

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    
    "cap:sync": "cap sync",
    "cap:open:ios": "cap open ios",
    "cap:open:android": "cap open android",
    
    "ios:dev": "npm run build && cap sync ios && cap open ios",
    "android:dev": "npm run build && cap sync android && cap open android",
    
    "ios:build": "npm run build && cap sync ios && cap build ios",
    "android:build": "npm run build && cap sync android && cap build android"
  }
}
```

## 3. 核心插件使用

### 3.1 Camera相机插件

```typescript
// src/hooks/useCamera.ts
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';

export function useCamera() {
  const [image, setImage] = useState<string>();
  const [loading, setLoading] = useState(false);
  
  const takePicture = async () => {
    setLoading(true);
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
        allowEditing: true,
        width: 1024,
        height: 1024
      });
      
      setImage(photo.webPath);
      return photo;
    } catch (error) {
      console.error('Camera error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const pickFromGallery = async () => {
    setLoading(true);
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 90
      });
      
      setImage(photo.webPath);
      return photo;
    } catch (error) {
      console.error('Gallery error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    image,
    loading,
    takePicture,
    pickFromGallery
  };
}

// 使用
function CameraExample() {
  const { image, loading, takePicture, pickFromGallery } = useCamera();
  
  return (
    <div>
      {image && <img src={image} alt="Captured" />}
      
      <button onClick={takePicture} disabled={loading}>
        {loading ? '处理中...' : '拍照'}
      </button>
      
      <button onClick={pickFromGallery} disabled={loading}>
        从相册选择
      </button>
    </div>
  );
}
```

### 3.2 Filesystem文件系统

```typescript
// src/services/fileService.ts
import { 
  Filesystem, 
  Directory, 
  Encoding 
} from '@capacitor/filesystem';

export class FileService {
  // 写入文件
  async writeFile(
    filename: string, 
    data: string,
    directory: Directory = Directory.Documents
  ) {
    try {
      await Filesystem.writeFile({
        path: filename,
        data,
        directory,
        encoding: Encoding.UTF8
      });
      
      return { success: true };
    } catch (error) {
      console.error('Write file error:', error);
      throw error;
    }
  }
  
  // 读取文件
  async readFile(
    filename: string,
    directory: Directory = Directory.Documents
  ) {
    try {
      const result = await Filesystem.readFile({
        path: filename,
        directory,
        encoding: Encoding.UTF8
      });
      
      return result.data;
    } catch (error) {
      console.error('Read file error:', error);
      throw error;
    }
  }
  
  // 删除文件
  async deleteFile(
    filename: string,
    directory: Directory = Directory.Documents
  ) {
    try {
      await Filesystem.deleteFile({
        path: filename,
        directory
      });
      
      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }
  
  // 列出目录文件
  async listFiles(directory: Directory = Directory.Documents) {
    try {
      const result = await Filesystem.readdir({
        path: '',
        directory
      });
      
      return result.files;
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }
  
  // 下载文件
  async downloadFile(url: string, filename: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          
          await Filesystem.writeFile({
            path: filename,
            data: base64data,
            directory: Directory.Documents
          });
          
          resolve({ success: true, path: filename });
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Download file error:', error);
      throw error;
    }
  }
}
```

### 3.3 Storage本地存储

```typescript
// src/hooks/useCapacitorStorage.ts
import { Storage } from '@capacitor/storage';
import { useState, useEffect } from 'react';

export function useCapacitorStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  
  // 加载存储的值
  useEffect(() => {
    const loadValue = async () => {
      try {
        const { value } = await Storage.get({ key });
        if (value) {
          setStoredValue(JSON.parse(value));
        }
      } catch (error) {
        console.error('Storage get error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadValue();
  }, [key]);
  
  // 保存值
  const setValue = async (value: T) => {
    try {
      setStoredValue(value);
      await Storage.set({
        key,
        value: JSON.stringify(value)
      });
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  };
  
  // 删除值
  const removeValue = async () => {
    try {
      setStoredValue(initialValue);
      await Storage.remove({ key });
    } catch (error) {
      console.error('Storage remove error:', error);
      throw error;
    }
  };
  
  // 清空所有存储
  const clearAll = async () => {
    try {
      await Storage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  };
  
  return {
    value: storedValue,
    setValue,
    removeValue,
    clearAll,
    loading
  };
}

// 使用
function StorageExample() {
  const { value, setValue, removeValue } = useCapacitorStorage('user', null);
  
  return (
    <div>
      <p>User: {value?.name}</p>
      <button onClick={() => setValue({ name: 'John' })}>
        Save User
      </button>
      <button onClick={removeValue}>
        Remove User
      </button>
    </div>
  );
}
```

### 3.4 Geolocation地理位置

```typescript
// src/hooks/useGeolocation.ts
import { Geolocation, Position } from '@capacitor/geolocation';
import { useState, useEffect } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 获取当前位置
  const getCurrentPosition = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      
      setPosition(position);
      return position;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 监听位置变化
  const watchPosition = () => {
    const watchId = Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      },
      (position, err) => {
        if (err) {
          setError(err.message);
        } else if (position) {
          setPosition(position);
        }
      }
    );
    
    return () => {
      Geolocation.clearWatch({ id: watchId });
    };
  };
  
  return {
    position,
    error,
    loading,
    getCurrentPosition,
    watchPosition
  };
}

// 使用
function GeolocationExample() {
  const { position, error, loading, getCurrentPosition } = useGeolocation();
  
  return (
    <div>
      <button onClick={getCurrentPosition} disabled={loading}>
        {loading ? '获取中...' : '获取位置'}
      </button>
      
      {error && <p>Error: {error}</p>}
      
      {position && (
        <div>
          <p>纬度: {position.coords.latitude}</p>
          <p>经度: {position.coords.longitude}</p>
          <p>精度: {position.coords.accuracy}m</p>
        </div>
      )}
    </div>
  );
}
```

### 3.5 Network网络状态

```typescript
// src/hooks/useNetwork.ts
import { Network } from '@capacitor/network';
import { useState, useEffect } from 'react';

export function useNetwork() {
  const [status, setStatus] = useState<{
    connected: boolean;
    connectionType: string;
  }>({
    connected: true,
    connectionType: 'unknown'
  });
  
  useEffect(() => {
    // 获取当前状态
    Network.getStatus().then(setStatus);
    
    // 监听状态变化
    const handler = Network.addListener('networkStatusChange', setStatus);
    
    return () => {
      handler.remove();
    };
  }, []);
  
  return status;
}

// 使用
function NetworkExample() {
  const { connected, connectionType } = useNetwork();
  
  return (
    <div>
      <p>状态: {connected ? '已连接' : '未连接'}</p>
      <p>类型: {connectionType}</p>
      
      {!connected && (
        <div className="offline-banner">
          您当前处于离线状态
        </div>
      )}
    </div>
  );
}
```

### 3.6 Device设备信息

```typescript
// src/hooks/useDevice.ts
import { Device, DeviceInfo } from '@capacitor/device';
import { useState, useEffect } from 'react';

export function useDevice() {
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  
  useEffect(() => {
    const getInfo = async () => {
      const deviceInfo = await Device.getInfo();
      setInfo(deviceInfo);
    };
    
    getInfo();
  }, []);
  
  return info;
}

// 获取设备ID
export async function getDeviceId() {
  const { identifier } = await Device.getId();
  return identifier;
}

// 获取电池信息
export async function getBatteryInfo() {
  const batteryInfo = await Device.getBatteryInfo();
  return {
    level: batteryInfo.batteryLevel,
    isCharging: batteryInfo.isCharging
  };
}

// 使用
function DeviceExample() {
  const device = useDevice();
  
  if (!device) return <div>Loading...</div>;
  
  return (
    <div>
      <p>平台: {device.platform}</p>
      <p>操作系统: {device.operatingSystem}</p>
      <p>版本: {device.osVersion}</p>
      <p>型号: {device.model}</p>
      <p>制造商: {device.manufacturer}</p>
    </div>
  );
}
```

## 4. 社区插件

### 4.1 安装社区插件

```bash
# HTTP插件
npm install @capacitor-community/http

# SQLite数据库
npm install @capacitor-community/sqlite

# Admob广告
npm install @capacitor-community/admob

# Stripe支付
npm install @capacitor-community/stripe

# FCM推送
npm install @capacitor-community/fcm
```

### 4.2 HTTP插件使用

```typescript
// src/services/httpService.ts
import { Http } from '@capacitor-community/http';

export class CapacitorHttpService {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await Http.get({
      url: `${this.baseURL}${url}`,
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  }
  
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await Http.post({
      url: `${this.baseURL}${url}`,
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  }
  
  // 下载文件
  async downloadFile(url: string, filePath: string) {
    const response = await Http.downloadFile({
      url,
      filePath,
      method: 'GET'
    });
    
    return response.path;
  }
  
  // 上传文件
  async uploadFile(url: string, filePath: string, name: string) {
    const response = await Http.uploadFile({
      url,
      name,
      filePath,
      method: 'POST'
    });
    
    return response.data;
  }
}
```

### 4.3 SQLite数据库

```typescript
// src/services/databaseService.ts
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';

export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: any;
  
  async init() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    
    this.db = await this.sqlite.createConnection(
      'mydb',
      false,
      'no-encryption',
      1
    );
    
    await this.db.open();
    await this.createTables();
  }
  
  private async createTables() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.db.execute(createTableSQL);
  }
  
  async getUsers() {
    const result = await this.db.query('SELECT * FROM users');
    return result.values;
  }
  
  async createUser(name: string, email: string) {
    const result = await this.db.run(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    
    return result.changes?.lastId;
  }
  
  async updateUser(id: number, name: string, email: string) {
    await this.db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
  }
  
  async deleteUser(id: number) {
    await this.db.run('DELETE FROM users WHERE id = ?', [id]);
  }
  
  async close() {
    await this.db.close();
  }
}
```

## 5. 自定义插件开发

### 5.1 创建插件

```bash
# 创建插件
npm init @capacitor/plugin my-plugin

# 进入插件目录
cd my-plugin

# 安装依赖
npm install
```

### 5.2 定义插件接口

```typescript
// src/definitions.ts
export interface MyPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
  
  showToast(options: { 
    text: string; 
    duration?: 'short' | 'long' 
  }): Promise<void>;
  
  vibrate(options: { duration?: number }): Promise<void>;
}
```

### 5.3 Web实现

```typescript
// src/web.ts
import { WebPlugin } from '@capacitor/core';
import type { MyPluginPlugin } from './definitions';

export class MyPluginWeb extends WebPlugin implements MyPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
  
  async showToast(options: { text: string; duration?: 'short' | 'long' }): Promise<void> {
    // Web实现
    const toast = document.createElement('div');
    toast.textContent = options.text;
    toast.className = 'toast';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, options.duration === 'long' ? 3000 : 2000);
  }
  
  async vibrate(options: { duration?: number }): Promise<void> {
    if ('vibrate' in navigator) {
      navigator.vibrate(options.duration || 200);
    }
  }
}
```

### 5.4 iOS实现

```swift
// ios/Plugin/MyPlugin.swift
import Foundation
import Capacitor

@objc(MyPlugin)
public class MyPlugin: CAPPlugin {
    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve(["value": value])
    }
    
    @objc func showToast(_ call: CAPPluginCall) {
        let text = call.getString("text") ?? ""
        let duration = call.getString("duration") ?? "short"
        
        DispatchQueue.main.async {
            // 显示Toast的实现
        }
        
        call.resolve()
    }
    
    @objc func vibrate(_ call: CAPPluginCall) {
        let duration = call.getInt("duration") ?? 200
        
        // 震动实现
        AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
        
        call.resolve()
    }
}
```

### 5.5 Android实现

```java
// android/src/main/java/com/example/myplugin/MyPlugin.java
package com.example.myplugin;

import android.os.Vibrator;
import android.widget.Toast;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MyPlugin")
public class MyPlugin extends Plugin {
    
    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");
        
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }
    
    @PluginMethod
    public void showToast(PluginCall call) {
        String text = call.getString("text");
        String duration = call.getString("duration", "short");
        
        int toastDuration = duration.equals("long") 
            ? Toast.LENGTH_LONG 
            : Toast.LENGTH_SHORT;
        
        Toast.makeText(
            getContext(), 
            text, 
            toastDuration
        ).show();
        
        call.resolve();
    }
    
    @PluginMethod
    public void vibrate(PluginCall call) {
        int duration = call.getInt("duration", 200);
        
        Vibrator vibrator = (Vibrator) getContext()
            .getSystemService(Context.VIBRATOR_SERVICE);
        
        if (vibrator != null) {
            vibrator.vibrate(duration);
        }
        
        call.resolve();
    }
}
```

## 6. 平台特定代码

### 6.1 iOS配置

```xml
<!-- ios/App/App/Info.plist -->
<dict>
  <!-- 相机权限 -->
  <key>NSCameraUsageDescription</key>
  <string>需要访问相机以拍照</string>
  
  <!-- 相册权限 -->
  <key>NSPhotoLibraryUsageDescription</key>
  <string>需要访问相册以选择照片</string>
  
  <!-- 位置权限 -->
  <key>NSLocationWhenInUseUsageDescription</key>
  <string>需要访问您的位置</string>
  
  <!-- 麦克风权限 -->
  <key>NSMicrophoneUsageDescription</key>
  <string>需要访问麦克风以录音</string>
</dict>
```

### 6.2 Android配置

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
  <!-- 权限 -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  <uses-permission android:name="android.permission.VIBRATE" />
  
  <application>
    <!-- 文件访问权限 -->
    <provider
      android:name="androidx.core.content.FileProvider"
      android:authorities="${applicationId}.fileprovider"
      android:exported="false"
      android:grantUriPermissions="true">
      <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
    </provider>
  </application>
</manifest>
```

## 7. 调试和测试

### 7.1 Web调试

```bash
# 启动开发服务器
npm run dev

# 在浏览器中测试
# http://localhost:5173
```

### 7.2 iOS调试

```bash
# 构建并打开Xcode
npm run build
npx cap sync ios
npx cap open ios

# 在Xcode中运行
# Product -> Run
```

### 7.3 Android调试

```bash
# 构建并打开Android Studio
npm run build
npx cap sync android
npx cap open android

# 在Android Studio中运行
# Run -> Run 'app'
```

### 7.4 Live Reload

```typescript
// capacitor.config.ts - 开发配置
const config: CapacitorConfig = {
  server: {
    url: 'http://192.168.1.100:5173', // 你的开发服务器地址
    cleartext: true
  }
};

// 然后运行
// npm run dev
// npx cap sync
// 在设备上运行应用
```

## 8. 最佳实践

```typescript
const capacitorBestPractices = {
  development: [
    '使用TypeScript',
    '模块化插件封装',
    '统一错误处理',
    '添加Loading状态',
    '权限检查'
  ],
  
  performance: [
    '按需加载插件',
    '优化Web资源',
    '使用原生导航',
    '缓存策略',
    '减少桥接调用'
  ],
  
  platform: [
    '平台特定优化',
    '统一的UI/UX',
    '处理平台差异',
    '测试所有平台',
    '遵循平台规范'
  ],
  
  security: [
    '安全存储敏感数据',
    'HTTPS通信',
    '代码混淆',
    '权限最小化',
    '输入验证'
  ]
};
```

## 9. 总结

Capacitor混合开发的核心要点:

1. **核心插件**: Camera, Filesystem, Storage等
2. **社区插件**: HTTP, SQLite等扩展
3. **自定义插件**: 满足特殊需求
4. **平台配置**: iOS和Android特定设置
5. **调试方法**: Web, iOS, Android调试
6. **性能优化**: 减少桥接,优化资源
7. **最佳实践**: 模块化,类型安全,错误处理

掌握Capacitor可以高效构建跨平台应用。

