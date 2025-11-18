# TypeScript基础语法

## 概述

TypeScript是JavaScript的超集,添加了静态类型系统和其他特性。它能够在编译时捕获错误,提供更好的IDE支持,使大型项目更易维护。本文将全面介绍TypeScript的基础语法和核心概念。

## TypeScript简介

### 什么是TypeScript

```
JavaScript + 类型系统 + ES6+特性 = TypeScript
```

### TypeScript的优势

```typescript
// JavaScript - 运行时才发现错误
function add(a, b) {
  return a + b;
}
add('1', '2'); // '12' (字符串拼接,可能不是预期结果)

// TypeScript - 编译时就能发现错误
function add(a: number, b: number): number {
  return a + b;
}
add('1', '2'); // ❌ 编译错误: Argument of type 'string' is not assignable to parameter of type 'number'
```

## 环境配置

### 安装TypeScript

```bash
# 全局安装
npm install -g typescript

# 项目安装
npm install --save-dev typescript

# 检查版本
tsc --version
```

### tsconfig.json配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## 基本类型

### 原始类型

```typescript
// 布尔值
let isDone: boolean = false;

// 数字
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;
let big: bigint = 100n;

// 字符串
let color: string = 'blue';
let fullName: string = `Bob Bobbington`;
let sentence: string = `Hello, my name is ${fullName}`;

// undefined和null
let u: undefined = undefined;
let n: null = null;

// symbol
let sym: symbol = Symbol('key');
```

### 数组

```typescript
// 方式1: 类型[]
let list: number[] = [1, 2, 3];
let names: string[] = ['Alice', 'Bob'];

// 方式2: Array<类型>
let list2: Array<number> = [1, 2, 3];
let names2: Array<string> = ['Alice', 'Bob'];

// 多维数组
let matrix: number[][] = [
  [1, 2, 3],
  [4, 5, 6],
];

// 只读数组
let readonlyArr: readonly number[] = [1, 2, 3];
let readonlyArr2: ReadonlyArray<number> = [1, 2, 3];
// readonlyArr.push(4); // ❌ 错误: Property 'push' does not exist
```

### 元组(Tuple)

```typescript
// 固定长度和类型的数组
let tuple: [string, number] = ['hello', 10];

// 访问元素
console.log(tuple[0]); // 'hello'
console.log(tuple[1]); // 10

// 解构
let [name, age] = tuple;

// 可选元素
let optionalTuple: [string, number?] = ['hello'];

// 剩余元素
let restTuple: [string, ...number[]] = ['hello', 1, 2, 3];

// 命名元组
type Point = [x: number, y: number];
let point: Point = [10, 20];

// 只读元组
let readonlyTuple: readonly [string, number] = ['hello', 10];
```

### 枚举(Enum)

```typescript
// 数字枚举
enum Direction {
  Up,    // 0
  Down,  // 1
  Left,  // 2
  Right, // 3
}

let dir: Direction = Direction.Up;

// 指定初始值
enum Direction2 {
  Up = 1,
  Down, // 2
  Left, // 3
  Right, // 4
}

// 字符串枚举
enum Color {
  Red = 'RED',
  Green = 'GREEN',
  Blue = 'BLUE',
}

let c: Color = Color.Red; // 'RED'

// 异构枚举(不推荐)
enum Mixed {
  No = 0,
  Yes = 'YES',
}

// 常量枚举(编译时内联)
const enum Status {
  Success = 200,
  NotFound = 404,
}

let status: Status = Status.Success; // 编译后: let status = 200;

// 枚举成员作为类型
enum ShapeKind {
  Circle,
  Square,
}

interface Circle {
  kind: ShapeKind.Circle;
  radius: number;
}

interface Square {
  kind: ShapeKind.Square;
  sideLength: number;
}
```

### any和unknown

```typescript
// any - 绕过类型检查
let notSure: any = 4;
notSure = 'maybe a string';
notSure = false;
notSure.toFixed(); // 可以调用任何方法

// unknown - 类型安全的any
let value: unknown = 4;
value = 'string';

// 使用前需要类型检查
if (typeof value === 'string') {
  console.log(value.toUpperCase()); // ✅
}

// value.toFixed(); // ❌ 错误: Object is of type 'unknown'
```

### void、never和undefined

```typescript
// void - 没有返回值
function warnUser(): void {
  console.log('Warning!');
}

// never - 永远不会返回
function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}

// undefined
function doSomething(): undefined {
  console.log('Done');
  return undefined;
}
```

## 对象类型

### Object、object和{}

```typescript
// Object - 所有对象的基类(不推荐)
let obj1: Object = { name: 'Alice' };
obj1 = 1; // ✅
obj1 = 'string'; // ✅

// object - 非原始类型
let obj2: object = { name: 'Alice' };
// obj2 = 1; // ❌ 错误
// obj2 = 'string'; // ❌ 错误

// {} - 空对象类型(不推荐)
let obj3: {} = { name: 'Alice' };
obj3 = 1; // ✅
obj3 = 'string'; // ✅
```

### 对象字面量类型

```typescript
// 基本用法
let person: { name: string; age: number } = {
  name: 'Alice',
  age: 30,
};

// 可选属性
let person2: { name: string; age?: number } = {
  name: 'Bob',
};

// 只读属性
let person3: { readonly name: string; age: number } = {
  name: 'Charlie',
  age: 25,
};
// person3.name = 'Dave'; // ❌ 错误: Cannot assign to 'name'

// 索引签名
let obj: { [key: string]: any } = {
  name: 'Alice',
  age: 30,
  city: 'New York',
};

// 混合使用
let person4: {
  name: string;
  age: number;
  [key: string]: any;
} = {
  name: 'Alice',
  age: 30,
  city: 'New York',
  country: 'USA',
};
```

## 函数类型

### 函数声明

```typescript
// 基本函数
function add(a: number, b: number): number {
  return a + b;
}

// 可选参数
function buildName(firstName: string, lastName?: string): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}

// 默认参数
function buildName2(firstName: string, lastName: string = 'Smith'): string {
  return `${firstName} ${lastName}`;
}

// 剩余参数
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

// 函数重载
function reverse(x: string): string;
function reverse(x: number): number;
function reverse(x: string | number): string | number {
  if (typeof x === 'string') {
    return x.split('').reverse().join('');
  }
  return Number(x.toString().split('').reverse().join(''));
}
```

### 函数表达式

```typescript
// 匿名函数
let myAdd = function (x: number, y: number): number {
  return x + y;
};

// 箭头函数
let myAdd2 = (x: number, y: number): number => x + y;

// 函数类型
let myAdd3: (x: number, y: number) => number = (x, y) => x + y;

// 完整函数类型
let myAdd4: (baseValue: number, increment: number) => number = function (x, y) {
  return x + y;
};
```

### this参数

```typescript
interface Card {
  suit: string;
  card: number;
}

interface Deck {
  suits: string[];
  cards: number[];
  createCardPicker(this: Deck): () => Card;
}

let deck: Deck = {
  suits: ['hearts', 'spades', 'clubs', 'diamonds'],
  cards: Array(52),
  createCardPicker: function (this: Deck) {
    return () => {
      let pickedCard = Math.floor(Math.random() * 52);
      let pickedSuit = Math.floor(pickedCard / 13);

      return { suit: this.suits[pickedSuit], card: pickedCard % 13 };
    };
  },
};
```

## 联合类型和交叉类型

### 联合类型(Union Types)

```typescript
// 基本联合类型
let value: string | number;
value = 'hello'; // ✅
value = 123; // ✅
// value = true; // ❌ 错误

// 函数参数
function format(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

// 字面量联合类型
type Direction = 'North' | 'South' | 'East' | 'West';
let dir: Direction = 'North'; // ✅
// let dir2: Direction = 'Up'; // ❌ 错误

// 联合类型数组
let arr: (string | number)[] = ['hello', 123, 'world'];
```

### 交叉类型(Intersection Types)

```typescript
// 基本交叉类型
interface Person {
  name: string;
}

interface Employee {
  employeeId: number;
}

type Worker = Person & Employee;

let worker: Worker = {
  name: 'Alice',
  employeeId: 123,
};

// 混入(Mixin)
interface Loggable {
  log(message: string): void;
}

interface Serializable {
  serialize(): string;
}

type LoggableSerializable = Loggable & Serializable;

class MyClass implements LoggableSerializable {
  log(message: string): void {
    console.log(message);
  }
  
  serialize(): string {
    return JSON.stringify(this);
  }
}
```

## 类型别名和接口

### 类型别名(Type Alias)

```typescript
// 基本类型别名
type Name = string;
type Age = number;
type User = { name: Name; age: Age };

// 联合类型别名
type ID = string | number;

// 元组类型别名
type Point = [number, number];

// 函数类型别名
type Callback = (data: string) => void;

// 泛型类型别名
type Container<T> = { value: T };
```

### 接口(Interface)

```typescript
// 基本接口
interface User {
  name: string;
  age: number;
}

// 可选属性
interface Config {
  host: string;
  port?: number;
}

// 只读属性
interface Point {
  readonly x: number;
  readonly y: number;
}

// 函数接口
interface SearchFunc {
  (source: string, subString: string): boolean;
}

// 索引签名
interface StringArray {
  [index: number]: string;
}

interface StringDictionary {
  [key: string]: string;
}

// 类接口
interface ClockInterface {
  currentTime: Date;
  setTime(d: Date): void;
}

class Clock implements ClockInterface {
  currentTime: Date = new Date();
  setTime(d: Date) {
    this.currentTime = d;
  }
}

// 接口继承
interface Shape {
  color: string;
}

interface Square extends Shape {
  sideLength: number;
}

let square: Square = {
  color: 'blue',
  sideLength: 10,
};

// 接口合并
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

// 合并后的Box
let box: Box = {
  height: 5,
  width: 6,
  scale: 10,
};
```

### Type vs Interface

```typescript
// 相同点

// 1. 都可以描述对象
type UserType = { name: string };
interface UserInterface { name: string }

// 2. 都可以扩展
type AnimalType = { name: string };
type DogType = AnimalType & { breed: string };

interface AnimalInterface { name: string }
interface DogInterface extends AnimalInterface { breed: string }

// 不同点

// 1. Type可以表示任何类型
type StringOrNumber = string | number;
type Tuple = [string, number];
type Callback = (data: string) => void;

// 2. Interface只能表示对象类型
// interface StringOrNumber = string | number; // ❌ 错误

// 3. Interface可以声明合并
interface Window {
  title: string;
}
interface Window {
  content: string;
}
// 合并后的Window有title和content

// 4. Type不能声明合并
type Window2 = { title: string };
// type Window2 = { content: string }; // ❌ 错误: Duplicate identifier
```

## 字面量类型

### 字符串字面量类型

```typescript
type Easing = 'ease-in' | 'ease-out' | 'ease-in-out';

function animate(easing: Easing) {
  if (easing === 'ease-in') {
    // ...
  }
}

animate('ease-in'); // ✅
// animate('linear'); // ❌ 错误
```

### 数字字面量类型

```typescript
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;

function rollDice(): DiceRoll {
  return (Math.floor(Math.random() * 6) + 1) as DiceRoll;
}

// HTTP状态码
type HttpStatus = 200 | 404 | 500;
```

### 布尔字面量类型

```typescript
type Success = true;
type Failure = false;

function process(): Success | Failure {
  // ...
  return true;
}
```

### 模板字面量类型

```typescript
type World = 'world';
type Greeting = `hello ${World}`; // 'hello world'

type EmailLocaleIDs = 'welcome_email' | 'email_heading';
type FooterLocaleIDs = 'footer_title' | 'footer_sendoff';
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// 'welcome_email_id' | 'email_heading_id' | 'footer_title_id' | 'footer_sendoff_id'
```

## 类型断言

### as断言

```typescript
// 基本用法
let someValue: unknown = 'this is a string';
let strLength: number = (someValue as string).length;

// DOM操作
let input = document.getElementById('myInput') as HTMLInputElement;
input.value = 'hello';

// 非空断言
function liveDangerously(x?: number | null) {
  console.log(x!.toFixed()); // 断言x不为null/undefined
}
```

### 尖括号断言

```typescript
let someValue: unknown = 'this is a string';
let strLength: number = (<string>someValue).length;

// 注意: 在JSX中不能使用尖括号断言,必须使用as
```

### const断言

```typescript
// 基本用法
let x = 'hello' as const; // type: 'hello'

// 对象
let obj = {
  name: 'Alice',
  age: 30,
} as const;
// type: { readonly name: 'Alice'; readonly age: 30 }

// 数组
let arr = [1, 2, 3] as const;
// type: readonly [1, 2, 3]

// 实际应用
const routes = [
  { path: '/', component: 'Home' },
  { path: '/about', component: 'About' },
] as const;

type Route = typeof routes[number];
// type: { readonly path: '/' | '/about'; readonly component: 'Home' | 'About' }
```

## 类型守卫

### typeof守卫

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === 'number') {
    return Array(padding + 1).join(' ') + value;
  }
  if (typeof padding === 'string') {
    return padding + value;
  }
  throw new Error(`Expected string or number, got '${padding}'.`);
}
```

### instanceof守卫

```typescript
class Bird {
  fly() {
    console.log('flying');
  }
}

class Fish {
  swim() {
    console.log('swimming');
  }
}

function move(animal: Bird | Fish) {
  if (animal instanceof Bird) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

### in守卫

```typescript
interface Bird {
  fly(): void;
}

interface Fish {
  swim(): void;
}

function move(animal: Bird | Fish) {
  if ('fly' in animal) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

### 自定义类型守卫

```typescript
interface Cat {
  meow(): void;
}

interface Dog {
  bark(): void;
}

function isCat(animal: Cat | Dog): animal is Cat {
  return (animal as Cat).meow !== undefined;
}

function makeSound(animal: Cat | Dog) {
  if (isCat(animal)) {
    animal.meow();
  } else {
    animal.bark();
  }
}
```

## 类型推断

### 基础推断

```typescript
// 变量推断
let x = 3; // number
let y = 'hello'; // string
let z = true; // boolean

// 数组推断
let arr = [1, 2, 3]; // number[]
let arr2 = ['a', 'b', 'c']; // string[]
let arr3 = [1, 'a', true]; // (string | number | boolean)[]

// 对象推断
let obj = {
  name: 'Alice',
  age: 30,
};
// type: { name: string; age: number }

// 函数返回值推断
function add(a: number, b: number) {
  return a + b; // 推断返回类型为number
}
```

### 最佳通用类型

```typescript
let arr = [0, 1, null]; // (number | null)[]

class Animal {}
class Cat extends Animal {}
class Dog extends Animal {}

let zoo = [new Cat(), new Dog()]; // (Cat | Dog)[]
let zoo2: Animal[] = [new Cat(), new Dog()]; // Animal[]
```

### 上下文类型推断

```typescript
window.onmousedown = function (mouseEvent) {
  // mouseEvent自动推断为MouseEvent类型
  console.log(mouseEvent.button);
};

// 数组方法
[1, 2, 3].forEach((item) => {
  // item自动推断为number类型
  console.log(item.toFixed());
});
```

## 类型兼容性

### 结构类型系统

```typescript
interface Named {
  name: string;
}

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

let p: Named;
p = new Person('Alice'); // ✅ 兼容,因为结构相同
```

### 函数兼容性

```typescript
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x; // ✅ 参数少的可以赋值给参数多的
// x = y; // ❌ 错误

// 返回值兼容性
let x2 = () => ({ name: 'Alice' });
let y2 = () => ({ name: 'Alice', location: 'Seattle' });

x2 = y2; // ✅
// y2 = x2; // ❌ 错误
```

TypeScript的类型系统功能强大,掌握这些基础语法是使用TypeScript的基础。在实际项目中,合理使用类型系统可以大大提升代码质量和开发效率。

