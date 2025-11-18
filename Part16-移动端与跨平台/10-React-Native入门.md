# React Native入门 - 完整跨平台移动开发指南

## 1. React Native简介

### 1.1 什么是React Native

React Native是Facebook开发的跨平台移动应用开发框架，使用JavaScript和React构建原生移动应用。

```typescript
const reactNativeConcepts = {
  definition: '使用React构建原生移动应用的框架',
  
  advantages: [
    '跨平台开发(iOS和Android)',
    '接近原生性能',
    '热重载快速开发',
    '庞大的社区生态',
    'JavaScript/TypeScript开发',
    '代码复用率高',
    '原生模块扩展'
  ],
  
  architecture: {
    javascript: 'JavaScript线程运行业务逻辑',
    native: '原生线程渲染UI',
    bridge: '桥接通信(旧架构)',
    jsi: 'JavaScript Interface(新架构)',
    fabric: '新渲染系统',
    turboModules: '新原生模块系统'
  },
  
  workFlow: [
    '编写React组件',
    '通过Bridge/JSI调用原生API',
    '原生端渲染UI',
    '事件回传到JS层',
    'JS更新状态',
    '重新渲染'
  ]
};
```

### 1.2 React Native vs React Web

```typescript
const differences = {
  components: {
    web: 'div, span, h1, p, button',
    rn: 'View, Text, ScrollView, TouchableOpacity'
  },
  
  styling: {
    web: 'CSS, CSS-in-JS',
    rn: 'StyleSheet API, 受限的CSS属性'
  },
  
  navigation: {
    web: 'React Router',
    rn: 'React Navigation, Native Navigation'
  },
  
  platform: {
    web: '浏览器',
    rn: 'iOS, Android原生应用'
  },
  
  apis: {
    web: 'DOM API, Web API',
    rn: '原生API封装'
  }
};
```

## 2. 环境搭建

### 2.1 开发环境要求

```bash
# macOS开发环境
# 1. Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js (推荐使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts

# 3. Watchman
brew install watchman

# 4. React Native CLI
npm install -g react-native-cli

# 5. CocoaPods (iOS)
sudo gem install cocoapods

# 6. Xcode (iOS开发)
# 从App Store安装

# 7. Android Studio (Android开发)
# 下载并安装
# 配置环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Windows开发环境
# 1. Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 2. Node.js
choco install -y nodejs-lts

# 3. Python
choco install -y python2

# 4. JDK
choco install -y microsoft-openjdk11

# 5. Android Studio
# 手动安装并配置环境变量
```

### 2.2 创建新项目

```bash
# 使用React Native CLI
npx react-native@latest init MyApp

# 使用TypeScript模板
npx react-native@latest init MyApp --template react-native-template-typescript

# 使用Expo (推荐初学者)
npx create-expo-app MyApp
cd MyApp

# Expo with TypeScript
npx create-expo-app MyApp --template

# 项目结构
MyApp/
├── android/          # Android原生代码
├── ios/             # iOS原生代码
├── src/             # 应用代码
│   ├── components/  # 组件
│   ├── screens/     # 页面
│   ├── navigation/  # 导航
│   └── utils/       # 工具
├── App.tsx          # 应用入口
├── package.json
└── tsconfig.json
```

### 2.3 运行项目

```bash
# iOS
npx react-native run-ios
# 指定设备
npx react-native run-ios --simulator="iPhone 14 Pro"

# Android
npx react-native run-android
# 指定设备
adb devices
npx react-native run-android --deviceId=<device-id>

# Expo
npx expo start
# 扫描二维码在真机上运行

# Metro Bundler
npx react-native start
# 或
npm start
```

## 3. 核心组件

### 3.1 View组件

```tsx
import { View, StyleSheet } from 'react-native';

// View - 容器组件(类似div)
export function ContainerExample() {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <View style={styles.innerBox} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerBox: {
    width: 50,
    height: 50,
    backgroundColor: '#fff'
  }
});
```

### 3.2 Text组件

```tsx
import { Text, StyleSheet } from 'react-native';

// Text - 文本组件
export function TextExample() {
  return (
    <>
      <Text style={styles.heading}>标题文本</Text>
      <Text style={styles.paragraph}>
        这是一段普通文本。
        <Text style={styles.bold}>加粗文本</Text>
        <Text style={styles.link}>链接文本</Text>
      </Text>
      <Text numberOfLines={2} ellipsizeMode="tail">
        这是一段很长的文本,会被截断并显示省略号...
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333'
  },
  bold: {
    fontWeight: 'bold'
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline'
  }
});
```

### 3.3 Image组件

```tsx
import { Image, StyleSheet } from 'react-native';

// Image - 图片组件
export function ImageExample() {
  return (
    <>
      {/* 本地图片 */}
      <Image 
        source={require('./assets/logo.png')}
        style={styles.logo}
      />
      
      {/* 网络图片 */}
      <Image
        source={{ uri: 'https://example.com/image.jpg' }}
        style={styles.networkImage}
        resizeMode="cover"
      />
      
      {/* 背景图片 */}
      <ImageBackground
        source={require('./assets/background.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <Text style={styles.text}>背景图片上的文本</Text>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100
  },
  networkImage: {
    width: '100%',
    height: 200
  },
  background: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  }
});
```

### 3.4 ScrollView组件

```tsx
import { ScrollView, View, Text, StyleSheet } from 'react-native';

// ScrollView - 滚动视图
export function ScrollViewExample() {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      bounces={true}
      onScroll={(event) => {
        console.log('滚动位置:', event.nativeEvent.contentOffset.y);
      }}
      scrollEventThrottle={16}
    >
      {Array.from({ length: 20 }).map((_, index) => (
        <View key={index} style={styles.item}>
          <Text>项目 {index + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// 水平滚动
export function HorizontalScrollExample() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {Array.from({ length: 10 }).map((_, index) => (
        <View key={index} style={styles.card}>
          <Text>卡片 {index + 1}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  card: {
    width: 150,
    height: 200,
    margin: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
```

### 3.5 FlatList组件

```tsx
import { FlatList, View, Text, StyleSheet } from 'react-native';

interface Item {
  id: string;
  title: string;
}

const DATA: Item[] = Array.from({ length: 100 }).map((_, i) => ({
  id: String(i),
  title: `项目 ${i + 1}`
}));

// FlatList - 高性能列表
export function FlatListExample() {
  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );
  
  return (
    <FlatList
      data={DATA}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      // 性能优化
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      // 分隔符
      ItemSeparatorComponent={() => (
        <View style={styles.separator} />
      )}
      // 空状态
      ListEmptyComponent={() => (
        <View style={styles.empty}>
          <Text>暂无数据</Text>
        </View>
      )}
      // 头部和尾部
      ListHeaderComponent={() => (
        <Text style={styles.header}>列表头部</Text>
      )}
      ListFooterComponent={() => (
        <Text style={styles.footer}>列表尾部</Text>
      )}
      // 下拉刷新
      refreshing={false}
      onRefresh={() => {
        console.log('刷新');
      }}
      // 加载更多
      onEndReached={() => {
        console.log('加载更多');
      }}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 16
  },
  separator: {
    height: 1,
    backgroundColor: '#eee'
  },
  empty: {
    padding: 40,
    alignItems: 'center'
  },
  header: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold'
  },
  footer: {
    padding: 10,
    textAlign: 'center',
    color: '#999'
  }
});
```

### 3.6 触摸组件

```tsx
import { 
  TouchableOpacity, 
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  Text,
  StyleSheet 
} from 'react-native';

// 各种触摸组件
export function TouchableExamples() {
  return (
    <>
      {/* TouchableOpacity - 点击时降低透明度 */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.7}
        onPress={() => console.log('点击')}
        onLongPress={() => console.log('长按')}
      >
        <Text style={styles.buttonText}>TouchableOpacity</Text>
      </TouchableOpacity>
      
      {/* TouchableHighlight - 点击时显示高亮 */}
      <TouchableHighlight
        style={styles.button}
        underlayColor="#1976D2"
        onPress={() => console.log('点击')}
      >
        <Text style={styles.buttonText}>TouchableHighlight</Text>
      </TouchableHighlight>
      
      {/* Pressable - 更灵活的按压组件 */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed
        ]}
        onPress={() => console.log('点击')}
      >
        {({ pressed }) => (
          <Text style={styles.buttonText}>
            {pressed ? '按下中...' : 'Pressable'}
          </Text>
        )}
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    marginVertical: 10
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  pressed: {
    backgroundColor: '#1976D2'
  }
});
```

## 4. 样式系统

### 4.1 StyleSheet API

```tsx
import { View, Text, StyleSheet } from 'react-native';

// StyleSheet - 样式表
export function StyleSheetExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>样式文本</Text>
      <View style={[styles.box, styles.shadow]}>
        <Text>组合样式</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  text: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600'
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5 // Android阴影
  }
});
```

### 4.2 Flexbox布局

```tsx
// Flexbox - 弹性布局
export function FlexboxExample() {
  return (
    <View style={flexStyles.container}>
      {/* 主轴方向 */}
      <View style={flexStyles.row}>
        <View style={flexStyles.item} />
        <View style={flexStyles.item} />
      </View>
      
      {/* 对齐 */}
      <View style={flexStyles.centered}>
        <Text>居中内容</Text>
      </View>
      
      {/* Flex属性 */}
      <View style={flexStyles.flexContainer}>
        <View style={[flexStyles.flexItem, { flex: 1 }]} />
        <View style={[flexStyles.flexItem, { flex: 2 }]} />
        <View style={[flexStyles.flexItem, { flex: 1 }]} />
      </View>
    </View>
  );
}

const flexStyles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  item: {
    width: 50,
    height: 50,
    backgroundColor: '#2196F3'
  },
  centered: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  flexContainer: {
    flexDirection: 'row',
    height: 100
  },
  flexItem: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 5
  }
});
```

### 4.3 响应式设计

```tsx
import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');

// 响应式样式
export function ResponsiveExample() {
  return (
    <View style={responsiveStyles.container}>
      <View style={responsiveStyles.box} />
    </View>
  );
}

const responsiveStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05 // 5% of screen width
  },
  box: {
    width: width * 0.9,
    height: height * 0.3,
    backgroundColor: '#2196F3'
  }
});

// 平台特定样式
const platformStyles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        paddingTop: 20
      },
      android: {
        paddingTop: 0
      }
    })
  },
  text: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto'
    })
  }
});
```

## 5. 状态管理

### 5.1 useState Hook

```tsx
import { useState } from 'react';
import { View, Text, Button } from 'react-native';

// useState - 状态管理
export function CounterExample() {
  const [count, setCount] = useState(0);
  
  return (
    <View>
      <Text>计数: {count}</Text>
      <Button title="增加" onPress={() => setCount(count + 1)} />
      <Button title="减少" onPress={() => setCount(count - 1)} />
    </View>
  );
}

// 复杂状态
export function FormExample() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: 0
  });
  
  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <View>
      <TextInput
        value={form.name}
        onChangeText={(text) => updateField('name', text)}
        placeholder="姓名"
      />
      <TextInput
        value={form.email}
        onChangeText={(text) => updateField('email', text)}
        placeholder="邮箱"
      />
    </View>
  );
}
```

### 5.2 useEffect Hook

```tsx
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

// useEffect - 副作用
export function DataFetchExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      const response = await fetch('https://api.example.com/data');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <ActivityIndicator size="large" />;
  }
  
  return (
    <View>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}
```

## 6. 导航基础

### 6.1 安装React Navigation

```bash
# 安装核心库
npm install @react-navigation/native

# 安装依赖
npm install react-native-screens react-native-safe-area-context

# iOS额外步骤
cd ios && pod install && cd ..

# Stack Navigator
npm install @react-navigation/native-stack

# Tab Navigator
npm install @react-navigation/bottom-tabs

# Drawer Navigator
npm install @react-navigation/drawer
```

### 6.2 基础导航设置

```tsx
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: '首页' }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen}
          options={{ title: '详情' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 页面组件
function HomeScreen({ navigation }) {
  return (
    <View>
      <Text>首页</Text>
      <Button
        title="去详情"
        onPress={() => navigation.navigate('Details', { id: 1 })}
      />
    </View>
  );
}

function DetailsScreen({ route, navigation }) {
  const { id } = route.params;
  
  return (
    <View>
      <Text>详情页 {id}</Text>
      <Button title="返回" onPress={() => navigation.goBack()} />
    </View>
  );
}
```

## 7. 原生模块

### 7.1 使用原生功能

```tsx
// 访问设备功能
import { 
  Platform,
  Alert,
  Linking,
  PermissionsAndroid 
} from 'react-native';

// Alert - 警告框
export function showAlert() {
  Alert.alert(
    '标题',
    '消息内容',
    [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => console.log('确定') }
    ]
  );
}

// Linking - 打开链接
export async function openURL(url: string) {
  const supported = await Linking.canOpenURL(url);
  
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('无法打开链接');
  }
}

// 权限请求 (Android)
export async function requestCameraPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: '相机权限',
        message: '应用需要访问相机',
        buttonPositive: '允许'
      }
    );
    
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  
  return true;
}
```

## 8. 调试工具

### 8.1 开发者菜单

```typescript
const debuggingTools = {
  devMenu: {
    ios: 'Cmd + D',
    android: 'Cmd + M (Mac) / Ctrl + M (Windows)',
    shake: '摇动设备'
  },
  
  features: [
    'Reload - 重新加载',
    'Debug - 远程调试',
    'Show Inspector - 元素检查器',
    'Show Perf Monitor - 性能监控',
    'Toggle Inspector - 切换检查器'
  ],
  
  remoteDebugging: [
    '打开开发者菜单',
    '选择Debug',
    '在Chrome中打开 http://localhost:8081/debugger-ui',
    '使用Chrome DevTools调试'
  ]
};
```

### 8.2 Reactotron调试

```bash
# 安装Reactotron
npm install reactotron-react-native --save-dev

# 下载Reactotron桌面应用
# https://github.com/infinitered/reactotron/releases
```

```tsx
// ReactotronConfig.ts
import Reactotron from 'reactotron-react-native';

if (__DEV__) {
  Reactotron
    .configure({ name: 'MyApp' })
    .useReactNative({
      networking: {
        ignoreUrls: /symbolicate/
      }
    })
    .connect();
}

// App.tsx
import './ReactotronConfig';

// 使用
console.tron.log('调试信息');
console.tron.display({
  name: '用户数据',
  value: userData
});
```

## 9. 性能优化

### 9.1 列表优化

```tsx
// FlatList优化
<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  // 关键优化属性
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  })}
/>

// 使用React.memo
const ListItem = React.memo(({ item }) => {
  return <View><Text>{item.title}</Text></View>;
});
```

### 9.2 图片优化

```tsx
import FastImage from 'react-native-fast-image';

// 使用FastImage
<FastImage
  source={{
    uri: 'https://example.com/image.jpg',
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable
  }}
  style={{ width: 200, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

## 10. 打包发布

### 10.1 iOS发布

```bash
# 1. 配置证书和描述文件
# 在Xcode中配置

# 2. 更新版本号
# ios/MyApp/Info.plist

# 3. Archive
# Xcode -> Product -> Archive

# 4. 上传到App Store Connect
# Xcode -> Window -> Organizer -> Upload to App Store
```

### 10.2 Android发布

```bash
# 1. 生成签名密钥
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 2. 配置gradle
# android/app/build.gradle
android {
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'xxxxx'
            keyAlias 'my-key-alias'
            keyPassword 'xxxxx'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}

# 3. 打包AAB
cd android
./gradlew bundleRelease

# 4. 生成的文件
# android/app/build/outputs/bundle/release/app-release.aab

# 5. 上传到Google Play Console
```

## 11. 最佳实践

```typescript
const reactNativeBestPractices = {
  architecture: [
    '使用函数组件和Hooks',
    '合理的文件夹结构',
    '组件解耦',
    '使用TypeScript',
    '状态管理方案(Redux/Zustand)'
  ],
  
  performance: [
    '使用FlatList而非ScrollView大列表',
    '图片优化',
    '避免匿名函数',
    '使用React.memo',
    '延迟加载'
  ],
  
  styling: [
    '使用StyleSheet.create',
    '提取公共样式',
    '响应式设计',
    '平台特定样式',
    '主题系统'
  ],
  
  navigation: [
    '类型安全的导航',
    '深层链接',
    '持久化导航状态',
    '合理的导航结构'
  ],
  
  testing: [
    'Jest单元测试',
    'Detox E2E测试',
    '快照测试',
    '持续集成'
  ]
};
```

## 12. 总结

React Native入门的核心要点:

1. **环境搭建**: Node.js, Xcode/Android Studio
2. **核心组件**: View, Text, Image, FlatList
3. **样式系统**: StyleSheet, Flexbox
4. **导航**: React Navigation
5. **状态管理**: Hooks
6. **原生模块**: 访问设备功能
7. **调试**: Chrome DevTools, Reactotron
8. **性能**: 列表优化, 图片优化
9. **发布**: iOS App Store, Google Play

掌握这些基础知识,就可以开始React Native应用开发。

