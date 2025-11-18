# React Native组件 - 完整组件库与实战指南

## 1. 输入组件

### 1.1 TextInput

```tsx
import { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

// TextInput - 文本输入框
export function TextInputExample() {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [multiline, setMultiline] = useState('');
  
  return (
    <View style={styles.container}>
      {/* 基础输入 */}
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="请输入文本"
        placeholderTextColor="#999"
      />
      
      {/* 密码输入 */}
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="请输入密码"
        secureTextEntry={true}
        autoCapitalize="none"
      />
      
      {/* 多行输入 */}
      <TextInput
        style={[styles.input, styles.multiline]}
        value={multiline}
        onChangeText={setMultiline}
        placeholder="多行文本"
        multiline={true}
        numberOfLines={4}
        textAlignVertical="top"
      />
      
      {/* 数字输入 */}
      <TextInput
        style={styles.input}
        placeholder="请输入数字"
        keyboardType="numeric"
      />
      
      {/* 邮箱输入 */}
      <TextInput
        style={styles.input}
        placeholder="请输入邮箱"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16
  },
  multiline: {
    height: 100,
    paddingTop: 15
  }
});
```

### 1.2 自定义输入组件

```tsx
// FormInput.tsx
interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType
}: FormInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={formStyles.container}>
      <Text style={formStyles.label}>{label}</Text>
      <TextInput
        style={[
          formStyles.input,
          isFocused && formStyles.inputFocused,
          error && formStyles.inputError
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && (
        <Text style={formStyles.error}>{error}</Text>
      )}
    </View>
  );
}

const formStyles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16
  },
  inputFocused: {
    borderColor: '#2196F3',
    borderWidth: 2
  },
  inputError: {
    borderColor: '#f44336'
  },
  error: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 5
  }
});
```

### 1.3 Switch开关

```tsx
import { Switch, View, Text, StyleSheet } from 'react-native';

// Switch - 开关组件
export function SwitchExample() {
  const [isEnabled, setIsEnabled] = useState(false);
  
  return (
    <View style={switchStyles.row}>
      <Text>启用通知</Text>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={isEnabled ? '#2196F3' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={setIsEnabled}
        value={isEnabled}
      />
    </View>
  );
}

const switchStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15
  }
});
```

### 1.4 Slider滑块

```tsx
import Slider from '@react-native-community/slider';

// Slider - 滑块组件
export function SliderExample() {
  const [value, setValue] = useState(50);
  
  return (
    <View style={sliderStyles.container}>
      <Text>音量: {value.toFixed(0)}</Text>
      <Slider
        style={sliderStyles.slider}
        minimumValue={0}
        maximumValue={100}
        value={value}
        onValueChange={setValue}
        minimumTrackTintColor="#2196F3"
        maximumTrackTintColor="#ddd"
        thumbTintColor="#2196F3"
      />
    </View>
  );
}

const sliderStyles = StyleSheet.create({
  container: {
    padding: 20
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 10
  }
});
```

## 2. 选择器组件

### 2.1 Picker

```tsx
import { Picker } from '@react-native-picker/picker';

// Picker - 选择器
export function PickerExample() {
  const [selectedValue, setSelectedValue] = useState('java');
  
  return (
    <Picker
      selectedValue={selectedValue}
      onValueChange={setSelectedValue}
      style={pickerStyles.picker}
    >
      <Picker.Item label="Java" value="java" />
      <Picker.Item label="JavaScript" value="js" />
      <Picker.Item label="Python" value="python" />
      <Picker.Item label="TypeScript" value="ts" />
    </Picker>
  );
}

const pickerStyles = StyleSheet.create({
  picker: {
    height: 50,
    width: '100%'
  }
});
```

### 2.2 DateTimePicker

```tsx
import DateTimePicker from '@react-native-community/datetimepicker';

// DateTimePicker - 日期时间选择器
export function DatePickerExample() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  
  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  return (
    <View>
      <TouchableOpacity onPress={() => setShow(true)}>
        <Text>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}
```

## 3. 显示组件

### 3.1 Modal模态框

```tsx
import { Modal, View, Text, Button, StyleSheet } from 'react-native';

// Modal - 模态框
export function ModalExample() {
  const [modalVisible, setModalVisible] = useState(false);
  
  return (
    <View style={modalStyles.container}>
      <Button title="打开模态框" onPress={() => setModalVisible(true)} />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
            <Text style={modalStyles.title}>模态框标题</Text>
            <Text style={modalStyles.text}>这是模态框内容</Text>
            <Button
              title="关闭"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  text: {
    marginBottom: 15,
    textAlign: 'center'
  }
});
```

### 3.2 自定义Modal组件

```tsx
// CustomModal.tsx
interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function CustomModal({
  visible,
  onClose,
  title,
  children
}: CustomModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={customModalStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={customModalStyles.content}>
            <View style={customModalStyles.header}>
              <Text style={customModalStyles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={customModalStyles.close}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={customModalStyles.body}>
              {children}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
}

const customModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '80%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  close: {
    fontSize: 24,
    color: '#999'
  },
  body: {
    padding: 20
  }
});
```

### 3.3 ActivityIndicator加载指示器

```tsx
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

// ActivityIndicator - 加载指示器
export function LoadingExample() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={loadingStyles.text}>加载中...</Text>
    </View>
  );
}

// 全屏加载
export function FullScreenLoading({ visible }: { visible: boolean }) {
  if (!visible) return null;
  
  return (
    <View style={loadingStyles.overlay}>
      <View style={loadingStyles.loadingBox}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={loadingStyles.loadingText}>加载中...</Text>
      </View>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    marginTop: 10,
    color: '#666'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16
  }
});
```

### 3.4 RefreshControl下拉刷新

```tsx
import { ScrollView, RefreshControl, View, Text } from 'react-native';

// RefreshControl - 下拉刷新
export function RefreshExample() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<string[]>([]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setData(Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`));
    setRefreshing(false);
  };
  
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2196F3']}
          tintColor="#2196F3"
        />
      }
    >
      {data.map((item, index) => (
        <View key={index} style={refreshStyles.item}>
          <Text>{item}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const refreshStyles = StyleSheet.create({
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  }
});
```

## 4. 动画组件

### 4.1 Animated API

```tsx
import { Animated, View, Button, StyleSheet } from 'react-native';

// Animated - 动画
export function AnimatedExample() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  };
  
  const slideIn = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      useNativeDriver: true
    }).start();
  };
  
  return (
    <View style={animStyles.container}>
      <Animated.View
        style={[
          animStyles.box,
          { opacity: fadeAnim }
        ]}
      >
        <Text>淡入动画</Text>
      </Animated.View>
      
      <Animated.View
        style={[
          animStyles.box,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text>滑入动画</Text>
      </Animated.View>
      
      <Button title="淡入" onPress={fadeIn} />
      <Button title="滑入" onPress={slideIn} />
    </View>
  );
}

const animStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  }
});
```

### 4.2 组合动画

```tsx
// 组合动画
export function ComposedAnimation() {
  const anim = useRef(new Animated.Value(0)).current;
  
  const startAnimation = () => {
    // 顺序动画
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.delay(1000),
      Animated.timing(anim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  };
  
  // 并行动画
  const parallelAnimation = () => {
    const opacity = new Animated.Value(0);
    const scale = new Animated.Value(0);
    
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true
      })
    ]).start();
  };
  
  return (
    <View>
      <Animated.View
        style={{
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1]
              })
            }
          ]
        }}
      >
        <Text>组合动画</Text>
      </Animated.View>
      <Button title="开始" onPress={startAnimation} />
    </View>
  );
}
```

## 5. 手势处理

### 5.1 Gesture Handler

```bash
npm install react-native-gesture-handler
```

```tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

// 手势处理
export function GestureExample() {
  const offset = useSharedValue({ x: 0, y: 0 });
  
  const pan = Gesture.Pan()
    .onChange((e) => {
      offset.value = {
        x: offset.value.x + e.changeX,
        y: offset.value.y + e.changeY
      };
    })
    .onEnd(() => {
      offset.value = withSpring({ x: 0, y: 0 });
    });
  
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y }
    ]
  }));
  
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[gestureStyles.box, animatedStyles]}>
        <Text>拖动我</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const gestureStyles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
```

### 5.2 Swipeable滑动删除

```tsx
import Swipeable from 'react-native-gesture-handler/Swipeable';

// 滑动删除
export function SwipeableExample() {
  const renderRightActions = () => (
    <View style={swipeStyles.deleteAction}>
      <Text style={swipeStyles.deleteText}>删除</Text>
    </View>
  );
  
  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={swipeStyles.item}>
        <Text>向左滑动删除</Text>
      </View>
    </Swipeable>
  );
}

const swipeStyles = StyleSheet.create({
  item: {
    padding: 20,
    backgroundColor: 'white'
  },
  deleteAction: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
```

## 6. 第三方UI库

### 6.1 React Native Paper

```bash
npm install react-native-paper
```

```tsx
import { Button, Card, Title, Paragraph } from 'react-native-paper';

// React Native Paper
export function PaperExample() {
  return (
    <Card>
      <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
      <Card.Content>
        <Title>卡片标题</Title>
        <Paragraph>卡片内容文本</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button>取消</Button>
        <Button>确定</Button>
      </Card.Actions>
    </Card>
  );
}
```

### 6.2 React Native Elements

```bash
npm install @rneui/themed @rneui/base
```

```tsx
import { Button, Card, Input } from '@rneui/themed';

// React Native Elements
export function ElementsExample() {
  return (
    <Card>
      <Card.Title>登录</Card.Title>
      <Card.Divider />
      <Input
        placeholder="用户名"
        leftIcon={{ type: 'font-awesome', name: 'user' }}
      />
      <Input
        placeholder="密码"
        secureTextEntry
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
      />
      <Button
        title="登录"
        buttonStyle={{ borderRadius: 8 }}
      />
    </Card>
  );
}
```

### 6.3 NativeBase

```bash
npm install native-base
```

```tsx
import { Box, Button, Center, Heading, VStack } from 'native-base';

// NativeBase
export function NativeBaseExample() {
  return (
    <Center flex={1}>
      <VStack space={4} alignItems="center">
        <Heading>Welcome</Heading>
        <Box bg="primary.500" p={4} rounded="lg">
          <Button>Click Me</Button>
        </Box>
      </VStack>
    </Center>
  );
}
```

## 7. 平台特定组件

### 7.1 StatusBar

```tsx
import { StatusBar, View } from 'react-native';

// StatusBar - 状态栏
export function StatusBarExample() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#2196F3"
        hidden={false}
      />
      {/* 内容 */}
    </View>
  );
}

// 动态改变
export function DynamicStatusBar() {
  const [dark, setDark] = useState(false);
  
  return (
    <>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={dark ? '#333' : '#fff'}
      />
      <Button
        title="切换主题"
        onPress={() => setDark(!dark)}
      />
    </>
  );
}
```

### 7.2 SafeAreaView

```tsx
import { SafeAreaView, View, Text } from 'react-native';

// SafeAreaView - 安全区域
export function SafeAreaExample() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text>内容会自动避开刘海和底部指示器</Text>
      </View>
    </SafeAreaView>
  );
}

// react-native-safe-area-context (推荐)
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

export function SafeAreaContextExample() {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }}
    >
      <Text>使用Safe Area Context</Text>
    </View>
  );
}
```

### 7.3 KeyboardAvoidingView

```tsx
import { KeyboardAvoidingView, Platform, TextInput } from 'react-native';

// KeyboardAvoidingView - 键盘避让
export function KeyboardAvoidingExample() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TextInput
          placeholder="输入消息"
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 15,
            margin: 10
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
```

## 8. 自定义组件最佳实践

### 8.1 可复用按钮组件

```tsx
// CustomButton.tsx
interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
}

export function CustomButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false
}: CustomButtonProps) {
  const buttonStyle = [
    buttonStyles.base,
    buttonStyles[variant],
    buttonStyles[size],
    disabled && buttonStyles.disabled
  ];
  
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={buttonStyles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  primary: {
    backgroundColor: '#2196F3'
  },
  secondary: {
    backgroundColor: '#757575'
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3'
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32
  },
  disabled: {
    backgroundColor: '#ccc'
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }
});
```

### 8.2 卡片组件

```tsx
// Card.tsx
interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

export function Card({
  title,
  subtitle,
  image,
  children,
  onPress
}: CardProps) {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container style={cardStyles.container} onPress={onPress}>
      {image && (
        <Image source={{ uri: image }} style={cardStyles.image} />
      )}
      {title && (
        <Text style={cardStyles.title}>{title}</Text>
      )}
      {subtitle && (
        <Text style={cardStyles.subtitle}>{subtitle}</Text>
      )}
      {children && (
        <View style={cardStyles.content}>{children}</View>
      )}
    </Container>
  );
}

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 16,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 16
  },
  content: {
    padding: 16
  }
});
```

## 9. 性能优化组件

### 9.1 VirtualizedList

```tsx
import { VirtualizedList, View, Text } from 'react-native';

// VirtualizedList - 虚拟化列表
export function VirtualizedListExample() {
  const DATA = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    title: `Item ${i}`
  }));
  
  const getItem = (data: any[], index: number) => data[index];
  const getItemCount = (data: any[]) => data.length;
  
  const renderItem = ({ item }: any) => (
    <View style={{ padding: 20, borderBottomWidth: 1, borderColor: '#eee' }}>
      <Text>{item.title}</Text>
    </View>
  );
  
  return (
    <VirtualizedList
      data={DATA}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      getItem={getItem}
      getItemCount={getItemCount}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
}
```

### 9.2 SectionList

```tsx
import { SectionList, View, Text } from 'react-native';

// SectionList - 分组列表
export function SectionListExample() {
  const DATA = [
    {
      title: 'A',
      data: ['Alice', 'Amy', 'Anna']
    },
    {
      title: 'B',
      data: ['Bob', 'Ben', 'Betty']
    }
  ];
  
  const renderItem = ({ item }: { item: string }) => (
    <View style={{ padding: 15 }}>
      <Text>{item}</Text>
    </View>
  );
  
  const renderSectionHeader = ({ section }: any) => (
    <View style={{ padding: 10, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontWeight: 'bold' }}>{section.title}</Text>
    </View>
  );
  
  return (
    <SectionList
      sections={DATA}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={(item, index) => item + index}
    />
  );
}
```

## 10. 总结

React Native组件的核心要点:

1. **输入组件**: TextInput, Switch, Slider, Picker
2. **显示组件**: Modal, ActivityIndicator, RefreshControl
3. **动画**: Animated API, 手势处理
4. **第三方库**: Paper, Elements, NativeBase
5. **平台特定**: StatusBar, SafeAreaView, KeyboardAvoidingView
6. **性能组件**: VirtualizedList, SectionList
7. **自定义组件**: 按钮, 卡片等可复用组件

掌握这些组件可以构建完整的React Native应用界面。

