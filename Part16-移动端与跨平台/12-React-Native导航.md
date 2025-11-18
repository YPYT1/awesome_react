# React Native导航 - 完整导航系统指南

## 1. React Navigation基础

### 1.1 导航库对比

```typescript
const navigationLibraries = {
  reactNavigation: {
    description: 'JavaScript实现,社区首选',
    pros: ['跨平台一致', '丰富的文档', '活跃的社区', '灵活可定制'],
    cons: ['性能略低于原生', 'bundle size较大'],
    install: 'npm install @react-navigation/native'
  },
  
  reactNativeNavigation: {
    description: '原生导航实现',
    pros: ['原生性能', '更流畅的动画', '原生感觉'],
    cons: ['配置复杂', '平台差异', '学习曲线陡'],
    install: 'npm install react-native-navigation'
  },
  
  expo Router: {
    description: 'Expo基于文件系统的路由',
    pros: ['文件系统路由', '自动类型安全', 'Next.js风格'],
    cons: ['仅Expo', '较新的库'],
    install: 'npx create-expo-app --template'
  }
};
```

### 1.2 安装React Navigation

```bash
# 核心库
npm install @react-navigation/native

# 依赖
npm install react-native-screens react-native-safe-area-context

# iOS额外步骤
cd ios && pod install && cd ..

# Stack Navigator
npm install @react-navigation/native-stack

# Bottom Tabs
npm install @react-navigation/bottom-tabs

# Drawer
npm install @react-navigation/drawer

# Material Top Tabs
npm install @react-navigation/material-top-tabs react-native-tab-view
npm install react-native-pager-view
```

## 2. Stack Navigator栈导航

### 2.1 基础Stack导航

```tsx
// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Details: { id: number; title: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' }
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: '首页' }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen}
          options={({ route }) => ({ title: route.params.title })}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 2.2 类型安全导航

```tsx
// types/navigation.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Details: { id: number; title: string };
  Profile: { userId: string };
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

// 在组件中使用
import { HomeScreenProps } from '../types/navigation';

function HomeScreen({ navigation, route }: HomeScreenProps) {
  return (
    <View>
      <Button
        title="Go to Details"
        onPress={() => 
          navigation.navigate('Details', { 
            id: 1, 
            title: 'Item Details' 
          })
        }
      />
    </View>
  );
}
```

### 2.3 导航方法

```tsx
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function NavigationExample() {
  const navigation = useNavigation<NavigationProp>();
  
  // 导航到新页面
  const goToDetails = () => {
    navigation.navigate('Details', { id: 1, title: 'Item' });
  };
  
  // 返回上一页
  const goBack = () => {
    navigation.goBack();
  };
  
  // 替换当前页面
  const replace = () => {
    navigation.replace('Settings');
  };
  
  // 弹出到栈顶
  const popToTop = () => {
    navigation.popToTop();
  };
  
  // 重置导航栈
  const reset = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
    });
  };
  
  // Push（总是添加新页面）
  const push = () => {
    navigation.push('Details', { id: 2, title: 'New Item' });
  };
  
  return (
    <View>
      <Button title="Go to Details" onPress={goToDetails} />
      <Button title="Go Back" onPress={goBack} />
      <Button title="Replace" onPress={replace} />
      <Button title="Pop to Top" onPress={popToTop} />
      <Button title="Reset" onPress={reset} />
      <Button title="Push" onPress={push} />
    </View>
  );
}
```

### 2.4 自定义Header

```tsx
// 自定义Header
<Stack.Screen
  name="Details"
  component={DetailsScreen}
  options={({ navigation, route }) => ({
    title: route.params.title,
    headerRight: () => (
      <TouchableOpacity onPress={() => alert('Share')}>
        <Text style={{ color: '#fff', marginRight: 15 }}>Share</Text>
      </TouchableOpacity>
    ),
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: '#fff', marginLeft: 15 }}>Back</Text>
      </TouchableOpacity>
    ),
    headerStyle: {
      backgroundColor: '#2196F3'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold'
    }
  })}
/>

// 隐藏Header
<Stack.Screen
  name="NoHeader"
  component={NoHeaderScreen}
  options={{ headerShown: false }}
/>

// 透明Header
<Stack.Screen
  name="Transparent"
  component={TransparentScreen}
  options={{
    headerTransparent: true,
    headerTitle: '',
    headerTintColor: '#fff'
  }}
/>
```

## 3. Tab Navigator标签导航

### 3.1 Bottom Tab Navigator

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

type TabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarBadge: 3 }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

### 3.2 Material Top Tabs

```tsx
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const TopTab = createMaterialTopTabNavigator();

function TopTabNavigator() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIndicatorStyle: { backgroundColor: '#2196F3' },
        tabBarScrollEnabled: true
      }}
    >
      <TopTab.Screen name="Tab1" component={Tab1Screen} />
      <TopTab.Screen name="Tab2" component={Tab2Screen} />
      <TopTab.Screen name="Tab3" component={Tab3Screen} />
      <TopTab.Screen name="Tab4" component={Tab4Screen} />
    </TopTab.Navigator>
  );
}
```

### 3.3 自定义Tab Bar

```tsx
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={customTabStyles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={customTabStyles.tab}
          >
            <Text style={{ color: isFocused ? '#2196F3' : '#gray' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const customTabStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15
  }
});

// 使用自定义TabBar
<Tab.Navigator tabBar={props => <CustomTabBar {...props} />}>
  {/* ... */}
</Tab.Navigator>
```

## 4. Drawer Navigator抽屉导航

### 4.1 基础Drawer

```tsx
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280
        },
        drawerActiveTintColor: '#2196F3',
        drawerInactiveTintColor: 'gray',
        headerShown: true
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
}
```

### 4.2 自定义Drawer内容

```tsx
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      {/* 自定义头部 */}
      <View style={drawerStyles.header}>
        <Image
          source={{ uri: 'https://example.com/avatar.jpg' }}
          style={drawerStyles.avatar}
        />
        <Text style={drawerStyles.username}>John Doe</Text>
        <Text style={drawerStyles.email}>john@example.com</Text>
      </View>
      
      {/* 默认菜单项 */}
      <DrawerItemList {...props} />
      
      {/* 自定义菜单项 */}
      <DrawerItem
        label="Help"
        onPress={() => alert('Help')}
        icon={({ color, size }) => (
          <Ionicons name="help-circle-outline" size={size} color={color} />
        )}
      />
      
      {/* 退出登录 */}
      <DrawerItem
        label="Logout"
        onPress={() => {/* 处理登出 */}}
        icon={({ color, size }) => (
          <Ionicons name="log-out-outline" size={size} color={color} />
        )}
      />
    </DrawerContentScrollView>
  );
}

const drawerStyles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#2196F3',
    marginBottom: 10
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  email: {
    color: '#fff',
    fontSize: 14
  }
});

// 使用
<Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
  {/* screens */}
</Drawer.Navigator>
```

## 5. 嵌套导航

### 5.1 Stack中嵌套Tabs

```tsx
// App.tsx
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Main" 
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// TabNavigator.tsx
function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

### 5.2 Drawer中嵌套Stack和Tabs

```tsx
function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={HomeStackNavigator} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeTabs" component={TabNavigator} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
}
```

### 5.3 跨导航器导航

```tsx
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

function NestedNavigationExample() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  
  // 打开Drawer
  const openDrawer = () => {
    navigation.openDrawer();
  };
  
  // 导航到其他Stack
  const navigateToDetails = () => {
    // 从嵌套的Tab导航到Stack页面
    navigation.getParent()?.navigate('Details', { id: 1 });
  };
  
  return (
    <View>
      <Button title="Open Drawer" onPress={openDrawer} />
      <Button title="Go to Details" onPress={navigateToDetails} />
    </View>
  );
}
```

## 6. 导航生命周期

### 6.1 监听导航事件

```tsx
import { useFocusEffect } from '@react-navigation/native';

function ScreenWithListeners({ navigation }) {
  // 页面聚焦时执行
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused');
      
      // 页面离开时清理
      return () => {
        console.log('Screen unfocused');
      };
    }, [])
  );
  
  useEffect(() => {
    // 监听focus事件
    const unsubscribeFocus = navigation.addListener('focus', () => {
      console.log('Screen is focused');
    });
    
    // 监听blur事件
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('Screen is blurred');
    });
    
    // 监听beforeRemove事件
    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', (e) => {
      // 阻止默认行为
      e.preventDefault();
      
      // 显示确认对话框
      Alert.alert(
        '确认离开?',
        '您有未保存的更改',
        [
          { text: '取消', style: 'cancel' },
          { text: '离开', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) }
        ]
      );
    });
    
    return () => {
      unsubscribeFocus();
      unsubscribeBlur();
      unsubscribeBeforeRemove();
    };
  }, [navigation]);
  
  return <View>{/* content */}</View>;
}
```

### 6.2 useIsFocused Hook

```tsx
import { useIsFocused } from '@react-navigation/native';

function FocusAwareComponent() {
  const isFocused = useIsFocused();
  
  useEffect(() => {
    if (isFocused) {
      // 页面聚焦时刷新数据
      fetchData();
    }
  }, [isFocused]);
  
  return (
    <View>
      <Text>{isFocused ? '页面活跃' : '页面不活跃'}</Text>
    </View>
  );
}
```

## 7. 深度链接

### 7.1 配置深度链接

```tsx
// App.tsx
const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: '',
      Details: 'details/:id',
      Profile: 'user/:userId',
      Settings: 'settings'
    }
  }
};

function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {/* screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// URL示例:
// myapp://details/123 -> Details screen with id=123
// https://myapp.com/user/456 -> Profile screen with userId=456
```

### 7.2 处理深度链接

```tsx
import { Linking } from 'react-native';

// 监听URL
useEffect(() => {
  const handleUrl = (event: { url: string }) => {
    console.log('URL received:', event.url);
    // 处理URL
  };
  
  // 监听URL事件
  const subscription = Linking.addEventListener('url', handleUrl);
  
  // 获取初始URL
  Linking.getInitialURL().then(url => {
    if (url) {
      console.log('Initial URL:', url);
    }
  });
  
  return () => {
    subscription.remove();
  };
}, []);

// 打开外部URL
const openURL = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('无法打开链接');
  }
};
```

### 7.3 Universal Links (iOS) 和 App Links (Android)

```typescript
// iOS - Associated Domains
// 在Xcode中配置:
// Signing & Capabilities -> Associated Domains
// 添加: applinks:myapp.com

// Android - android/app/src/main/AndroidManifest.xml
/*
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="myapp.com" />
</intent-filter>
*/

// 服务器配置
// iOS: https://myapp.com/.well-known/apple-app-site-association
// Android: https://myapp.com/.well-known/assetlinks.json
```

## 8. 导航持久化

### 8.1 保存和恢复导航状态

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE_KEY = 'NAVIGATION_STATE';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;
        
        if (state !== undefined) {
          setInitialState(state);
        }
      } finally {
        setIsReady(true);
      }
    };
    
    if (!isReady) {
      restoreState();
    }
  }, [isReady]);
  
  if (!isReady) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) => {
        AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
      }}
    >
      <Stack.Navigator>{/* screens */}</Stack.Navigator>
    </NavigationContainer>
  );
}
```

## 9. 导航性能优化

### 9.1 懒加载屏幕

```tsx
import { lazy, Suspense } from 'react';

// 懒加载屏幕
const DetailsScreen = lazy(() => import('./screens/DetailsScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details">
          {() => (
            <Suspense fallback={<LoadingScreen />}>
              <DetailsScreen />
            </Suspense>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 9.2 优化Stack导航

```tsx
<Stack.Navigator
  screenOptions={{
    // 禁用手势（如果不需要）
    gestureEnabled: false,
    // 使用更快的动画
    animation: 'fade',
    // 预加载相邻屏幕
    detachPreviousScreen: false
  }}
>
  {/* screens */}
</Stack.Navigator>
```

## 10. 最佳实践

```typescript
const navigationBestPractices = {
  structure: [
    '合理的导航层级结构',
    '避免过深的嵌套',
    '使用TypeScript类型',
    '统一的导航配置',
    '清晰的命名规范'
  ],
  
  performance: [
    '懒加载非关键屏幕',
    '优化导航动画',
    '避免不必要的重渲染',
    '使用React.memo',
    '合理使用导航持久化'
  ],
  
  userExperience: [
    '提供返回按钮',
    '处理硬件返回键',
    '加载状态提示',
    '错误边界处理',
    '流畅的动画过渡'
  ],
  
  state: [
    '避免在导航参数中传递大对象',
    '使用全局状态管理',
    '正确处理导航状态',
    '持久化关键数据',
    '深度链接支持'
  ],
  
  testing: [
    '测试导航流程',
    '测试深度链接',
    '测试返回行为',
    'E2E导航测试',
    '性能测试'
  ]
};
```

## 11. 总结

React Native导航的核心要点:

1. **Stack Navigator**: 页面栈管理
2. **Tab Navigator**: 底部标签导航
3. **Drawer Navigator**: 抽屉式导航
4. **嵌套导航**: 组合不同导航器
5. **类型安全**: TypeScript支持
6. **生命周期**: 导航事件监听
7. **深度链接**: URL路由支持
8. **性能优化**: 懒加载和动画优化

掌握这些导航技术可以构建完整的应用导航系统。

