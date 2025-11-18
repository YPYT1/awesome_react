// Part 1: React核心基础 - 题库
const questionsPart1 = [
    // JSX基础 (1-10)
    {
        id: 1,
        type: 'single',
        question: '在JSX中，以下哪种方式可以正确地在元素中嵌入JavaScript表达式？',
        options: [
            '使用双花括号 {{ expression }}',
            '使用单花括号 { expression }',
            '使用百分号 <% expression %>',
            '直接写表达式，不需要任何标记'
        ],
        answer: [1],
        explanation: {
            correct: 'JSX使用单花括号 {} 来嵌入JavaScript表达式。这是React的核心语法之一，可以在花括号内放置任何有效的JavaScript表达式，包括变量、函数调用、三元运算符等。',
            wrong: {
                0: '双花括号在JSX中用于传递对象作为prop（如style={{color: "red"}}），外层花括号表示JavaScript表达式，内层花括号表示对象字面量。',
                2: '百分号是模板语言（如EJS、ERB）的语法，不是JSX的语法。',
                3: 'JSX不支持直接写JavaScript表达式，必须用花括号包裹，否则会被当作纯文本处理。'
            }
        },
        tags: ['JSX', '表达式', '基础语法']
    },
    {
        id: 2,
        type: 'multiple',
        question: 'JSX中哪些是合法的写法？（多选）',
        options: [
            '<div className="container">内容</div>',
            '<input type="text" />',
            '<Component>',
            '<div class="container">内容</div>'
        ],
        answer: [0, 1],
        explanation: {
            correct: '选项A使用className而非class（因为class是JavaScript保留字），这是正确的。选项B是自闭合标签的正确写法，JSX中所有标签都必须闭合。',
            wrong: {
                2: '组件标签必须闭合，可以使用自闭合<Component />或者<Component></Component>，单独的<Component>是不合法的。',
                3: '在JSX中应该使用className而不是class，因为class是JavaScript的保留关键字。'
            }
        },
        tags: ['JSX', '语法规则', 'className']
    },
    {
        id: 3,
        type: 'judge',
        question: 'JSX最终会被Babel编译成React.createElement()函数调用。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '这是正确的。JSX只是语法糖，Babel会将JSX编译成React.createElement()调用。例如：<div>Hello</div> 会被编译成 React.createElement("div", null, "Hello")。在React 17+中，使用了新的JSX转换，不再需要显式导入React，但原理类似。',
            wrong: {
                1: 'JSX确实会被编译，虽然React 17+引入了新的JSX转换（不需要导入React），但本质上仍然是转换为函数调用。'
            }
        },
        tags: ['JSX', '编译原理', 'Babel']
    },
    {
        id: 4,
        type: 'single',
        question: '以下哪个JSX代码片段是错误的？',
        options: [
            'const element = <div><h1>标题</h1><p>段落</p></div>',
            'const element = <h1>标题</h1><p>段落</p>',
            'const element = <><h1>标题</h1><p>段落</p></>',
            'const element = <div>{user.name}</div>'
        ],
        answer: [1],
        explanation: {
            correct: '选项B错误，因为JSX表达式必须有一个根元素。不能同时返回两个并列的元素<h1>和<p>，必须用一个父元素包裹，或使用Fragment（<>...</>）。',
            wrong: {
                0: '这是正确的写法，使用div作为根元素包裹所有子元素。',
                2: '这是正确的写法，使用Fragment（<>...</>）作为根元素，Fragment不会在DOM中创建额外节点。',
                3: '这是正确的写法，在花括号中访问对象属性是合法的。'
            }
        },
        tags: ['JSX', '根元素', 'Fragment', '常见错误']
    },
    {
        id: 5,
        type: 'single',
        question: '在JSX中，如何添加注释？',
        options: [
            '// 这是注释',
            '<!-- 这是注释 -->',
            '{/* 这是注释 */}',
            '/* 这是注释 */'
        ],
        answer: [2],
        explanation: {
            correct: 'JSX中的注释需要用花括号包裹JavaScript注释：{/* 注释内容 */}。因为JSX本质上是JavaScript，所以注释也要符合JavaScript语法，同时用花括号表示这是一个表达式。',
            wrong: {
                0: '单行注释//只能在JSX外部使用，在JSX内部需要用花括号包裹。',
                1: 'HTML注释<!-- -->在JSX中不起作用，JSX不是HTML。',
                3: '多行注释/* */在JSX内部必须用花括号包裹，即{/* */}。'
            }
        },
        tags: ['JSX', '注释', '语法']
    },
    {
        id: 6,
        type: 'single',
        question: '以下哪个style属性的写法是正确的？',
        options: [
            '<div style="color: red; font-size: 14px">文本</div>',
            '<div style={{color: "red", fontSize: "14px"}}>文本</div>',
            '<div style={color: "red", fontSize: "14px"}>文本</div>',
            '<div style={{color: red, font-size: 14px}}>文本</div>'
        ],
        answer: [1],
        explanation: {
            correct: 'JSX中的style属性接收一个JavaScript对象，而不是字符串。需要使用驼峰命名法（fontSize而非font-size），值为字符串要加引号。双层花括号：外层表示JavaScript表达式，内层表示对象字面量。',
            wrong: {
                0: '这是HTML的写法，JSX中style必须是对象，不是字符串。',
                2: '缺少外层花括号，这样会被解析为语法错误。style后的花括号表示JavaScript表达式。',
                3: '错误有两个：1) CSS属性名必须用驼峰命名法（fontSize）；2) 字符串值必须加引号；3) 数字可以不加引号但会默认为px单位。'
            }
        },
        tags: ['JSX', 'style', '内联样式', '对象']
    },
    {
        id: 7,
        type: 'judge',
        question: 'JSX中可以使用if-else语句进行条件渲染。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'JSX中不能直接使用if-else语句，因为if-else是语句而非表达式。JSX的花括号内只能放表达式。正确的做法是：1) 在JSX外部使用if-else；2) 使用三元运算符；3) 使用逻辑与(&&)运算符；4) 使用立即执行函数。',
            wrong: {
                0: 'if-else是语句不是表达式，不能直接在JSX的{}中使用。可以用三元运算符(condition ? true : false)或逻辑运算符(condition && element)代替。'
            }
        },
        tags: ['JSX', '条件渲染', '表达式vs语句']
    },
    {
        id: 8,
        type: 'multiple',
        question: '在JSX中进行条件渲染，以下哪些方式是正确的？（多选）',
        options: [
            '{isLoggedIn ? <UserPanel /> : <LoginPanel />}',
            '{isLoggedIn && <UserPanel />}',
            '{if (isLoggedIn) { <UserPanel /> }}',
            '{(() => { if (isLoggedIn) return <UserPanel />; return <LoginPanel />; })()}'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A使用三元运算符，这是最常用的条件渲染方式。选项B使用逻辑与运算符，适合只需要条件为真时渲染的场景。选项D使用立即执行函数(IIFE)，可以在其中使用if-else语句，这是处理复杂条件的一种方式。',
            wrong: {
                2: 'if语句不能直接在JSX的花括号中使用，因为它是语句而不是表达式。可以在JSX外部使用if语句，或者用IIFE包裹if语句。'
            }
        },
        tags: ['JSX', '条件渲染', '三元运算符', '逻辑运算符']
    },
    {
        id: 9,
        type: 'single',
        question: '以下关于JSX和HTML的区别，哪个是错误的？',
        options: [
            'JSX中使用className代替class',
            'JSX中使用htmlFor代替for',
            'JSX标签必须闭合，HTML标签可以不闭合',
            'JSX中onClick的O必须小写，HTML中可以是onclick'
        ],
        answer: [3],
        explanation: {
            correct: '选项D是错误的。在JSX中，事件处理器使用驼峰命名法，onClick中的C必须大写。HTML中使用小写onclick，但JSX中必须是onClick。这是JSX和HTML的重要区别之一。',
            wrong: {
                0: '这是正确的区别。因为class是JavaScript保留字，JSX使用className。',
                1: '这是正确的区别。for是JavaScript保留字（用于循环），JSX使用htmlFor表示label的for属性。',
                2: '这是正确的区别。JSX中所有标签必须闭合（如<img />），HTML5中某些标签可以不闭合（如<img>）。'
            }
        },
        tags: ['JSX', 'HTML对比', '事件命名', '区别']
    },
    {
        id: 10,
        type: 'single',
        question: 'JSX中列表渲染时，为什么需要key属性？',
        options: [
            '为了让列表看起来更美观',
            '为了帮助React识别哪些元素改变了，提高性能',
            '为了给元素添加唯一标识符方便CSS选择',
            '这是React的强制要求，但没有实际作用'
        ],
        answer: [1],
        explanation: {
            correct: 'key帮助React识别列表中哪些元素发生了变化、被添加或被删除。在Diff算法中，React通过key来判断元素是否可以复用，从而优化性能，避免不必要的DOM操作。没有key时，React会按顺序比较，可能导致不必要的重新渲染或状态错乱。',
            wrong: {
                0: 'key不影响样式，它是React内部使用的，不会渲染到DOM中。',
                2: 'key不会渲染到最终的DOM中，不能用作CSS选择器。如果需要唯一标识符，应该使用id属性。',
                3: 'key有重要的实际作用，是React Diff算法的核心部分，直接影响性能和正确性。'
            }
        },
        tags: ['JSX', 'key', '列表渲染', '性能优化']
    },

    // 组件基础 (11-20)
    {
        id: 11,
        type: 'single',
        question: '函数组件和类组件的主要区别是什么？',
        options: [
            '函数组件不能使用state，类组件可以',
            '函数组件性能更好，类组件性能较差',
            '函数组件是纯函数，类组件基于ES6 class',
            '函数组件只能用于简单组件，类组件用于复杂组件'
        ],
        answer: [2],
        explanation: {
            correct: '本质区别：函数组件是纯函数，接收props返回JSX；类组件基于ES6 class，有this和生命周期。在React Hooks出现后，函数组件也可以使用state和其他特性，但本质上仍然是函数。',
            wrong: {
                0: '在React 16.8引入Hooks后，函数组件可以通过useState等Hooks使用state。',
                1: '性能差异很小，不是主要区别。React团队推荐使用函数组件是因为代码更简洁、更易理解，而不是性能。',
                3: '引入Hooks后，函数组件可以处理任何复杂度的逻辑。选择哪种组件主要看团队规范和个人偏好。'
            }
        },
        tags: ['组件', '函数组件', '类组件', '区别']
    },
    {
        id: 12,
        type: 'judge',
        question: 'React组件名必须以大写字母开头。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '这是正确的。React通过首字母大小写区分组件和HTML标签：大写开头被视为组件（<MyComponent />），小写开头被视为HTML标签（<div>）。如果组件名小写开头，React会将其当作HTML标签处理，导致渲染错误。',
            wrong: {
                1: '组件名必须大写开头。这是React的约定，用于区分自定义组件和原生HTML标签。小写开头会被识别为DOM标签。'
            }
        },
        tags: ['组件', '命名规范', '约定']
    },
    {
        id: 13,
        type: 'multiple',
        question: '以下哪些是合法的组件定义？（多选）',
        options: [
            'function Welcome() { return <h1>Hello</h1>; }',
            'const Welcome = () => <h1>Hello</h1>;',
            'class Welcome extends React.Component { render() { return <h1>Hello</h1>; } }',
            'const welcome = () => <h1>Hello</h1>;'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A是函数声明的函数组件，选项B是箭头函数的函数组件，选项C是类组件。这三种都是合法的React组件定义方式，都遵循了组件名大写的约定。',
            wrong: {
                3: '组件名必须大写开头。welcome是小写的，会被React识别为HTML标签而不是组件，导致错误。应该改为Welcome。'
            }
        },
        tags: ['组件', '定义方式', '函数组件', '类组件']
    },
    {
        id: 14,
        type: 'single',
        question: 'Props是什么？',
        options: [
            'Props是组件的内部状态',
            'Props是父组件向子组件传递数据的方式',
            'Props是组件的生命周期方法',
            'Props是React的全局变量'
        ],
        answer: [1],
        explanation: {
            correct: 'Props（properties的缩写）是父组件向子组件传递数据的机制。Props是只读的，子组件不能修改接收到的props。这确保了数据流的单向性，使得应用的数据流向更可预测。',
            wrong: {
                0: '组件的内部状态是State，不是Props。State是组件自己管理的可变数据。',
                2: '生命周期方法（如componentDidMount）是类组件的特性，与Props无关。',
                3: 'Props不是全局变量，它是组件间传递数据的方式。如果需要全局状态，应该使用Context或状态管理库。'
            }
        },
        tags: ['Props', '数据传递', '父子组件']
    },
    {
        id: 15,
        type: 'judge',
        question: '子组件可以直接修改从父组件接收的props。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'Props是只读的，子组件不能直接修改props。这是React的核心原则之一：单向数据流。如果需要修改，应该：1) 在父组件中定义修改函数，通过props传给子组件；2) 子组件将props复制到自己的state中再修改。',
            wrong: {
                0: '直接修改props会违反React的单向数据流原则，可能导致数据不一致和难以调试的bug。Props应该被视为不可变数据。'
            }
        },
        tags: ['Props', '只读性', '单向数据流', '最佳实践']
    },
    {
        id: 16,
        type: 'single',
        question: '如何在函数组件中接收props？',
        options: [
            'function Welcome(props) { return <h1>Hello, {props.name}</h1>; }',
            'function Welcome() { return <h1>Hello, {this.props.name}</h1>; }',
            'function Welcome({ name }) { return <h1>Hello, {this.name}</h1>; }',
            'function Welcome() { const props = useProps(); return <h1>Hello, {props.name}</h1>; }'
        ],
        answer: [0],
        explanation: {
            correct: '函数组件通过函数参数接收props。可以直接使用props对象（如props.name），也可以使用解构（如function Welcome({ name })）。函数组件没有this，所以不能用this.props。',
            wrong: {
                1: '函数组件没有this，不能使用this.props。this.props是类组件的用法。',
                2: '函数组件没有this，即使使用了解构，也应该直接使用解构后的变量name，而不是this.name。',
                3: 'React没有useProps这个Hook。Props直接作为函数参数传入。'
            }
        },
        tags: ['Props', '函数组件', '接收方式']
    },
    {
        id: 17,
        type: 'single',
        question: 'Props的children属性有什么特殊之处？',
        options: [
            'children是保留字，不能作为prop名称',
            'children包含组件标签之间的内容',
            'children只能是字符串类型',
            'children必须在组件定义时显式声明'
        ],
        answer: [1],
        explanation: {
            correct: 'children是特殊的prop，包含组件标签之间的所有内容。例如<Card><div>内容</div></Card>，Card组件可以通过props.children访问<div>内容</div>。children可以是任何类型：字符串、元素、数组、甚至函数。',
            wrong: {
                0: 'children不是保留字，它是React约定的特殊prop名称，可以像其他props一样使用。',
                2: 'children可以是任何类型：字符串、数字、JSX元素、数组、null、undefined、函数等。',
                3: 'children是隐式传递的，不需要显式声明。当组件标签之间有内容时，React自动将其作为children传递。'
            }
        },
        tags: ['Props', 'children', '组件组合']
    },
    {
        id: 18,
        type: 'multiple',
        question: '以下关于Props默认值的说法，哪些是正确的？（多选）',
        options: [
            '可以使用函数参数默认值：function Button({ text = "点击" }) {}',
            '类组件可以使用static defaultProps = {}设置默认值',
            '函数组件必须使用defaultProps，不能用参数默认值',
            'Props默认值只在prop未传递或为undefined时生效'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：函数组件可以使用ES6参数默认值语法。选项B：类组件使用static defaultProps设置默认值。选项D：默认值只在prop为undefined时生效，null不会触发默认值。',
            wrong: {
                2: '函数组件有两种方式设置默认值：1) ES6参数默认值（推荐）；2) defaultProps。不是必须使用defaultProps。'
            }
        },
        tags: ['Props', '默认值', 'defaultProps']
    },
    {
        id: 19,
        type: 'single',
        question: 'PropTypes的主要作用是什么？',
        options: [
            '提升应用性能',
            '在运行时进行类型检查，帮助发现bug',
            '自动生成组件文档',
            '编译时进行类型检查'
        ],
        answer: [1],
        explanation: {
            correct: 'PropTypes在开发环境下进行运行时类型检查。当传入的prop类型不匹配时，会在控制台显示警告。这有助于及早发现类型错误。注意：PropTypes只在开发模式下工作，生产环境会被移除以提升性能。',
            wrong: {
                0: 'PropTypes不影响性能，实际上在生产环境中会被完全移除。它的作用是帮助开发，不是优化性能。',
                2: 'PropTypes主要用于类型检查，虽然可以作为文档参考，但不会自动生成文档。',
                3: 'PropTypes是运行时检查，不是编译时。如果需要编译时类型检查，应该使用TypeScript。'
            }
        },
        tags: ['Props', 'PropTypes', '类型检查']
    },
    {
        id: 20,
        type: 'judge',
        question: 'Props可以是任何JavaScript类型，包括函数。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'Props可以传递任何JavaScript值：原始类型（字符串、数字、布尔值）、对象、数组、函数、甚至React元素。传递函数特别常见，用于子组件向父组件通信（回调函数模式）。',
            wrong: {
                1: 'Props确实可以是任何类型。传递函数是常见模式，如onClick、onChange等事件处理器，或者自定义回调函数。'
            }
        },
        tags: ['Props', '数据类型', '函数传递']
    },

    // State (21-30)
    {
        id: 21,
        type: 'single',
        question: 'State和Props的主要区别是什么？',
        options: [
            'State由组件自己管理，Props由父组件传递',
            'State是只读的，Props是可变的',
            'State用于类组件，Props用于函数组件',
            'State是全局的，Props是局部的'
        ],
        answer: [0],
        explanation: {
            correct: 'State是组件的内部状态，由组件自己创建和管理，可以改变。Props是从父组件传递下来的，对于接收方来说是只读的。State改变会触发组件重新渲染，Props改变（父组件重新渲染）也会导致子组件重新渲染。',
            wrong: {
                1: '正好相反：State是可变的（通过setState或useState修改），Props是只读的（不能直接修改）。',
                2: 'State和Props都可以在类组件和函数组件中使用。类组件用this.state，函数组件用useState。',
                3: 'State和Props都是局部的，作用域限定在组件内。全局状态需要使用Context或状态管理库。'
            }
        },
        tags: ['State', 'Props', '区别', '概念']
    },
    {
        id: 22,
        type: 'single',
        question: '在函数组件中，如何正确使用useState？',
        options: [
            'const count = useState(0);',
            'const [count, setCount] = useState(0);',
            'const {count, setCount} = useState(0);',
            'const count = useState(0)[0]; const setCount = useState(0)[1];'
        ],
        answer: [1],
        explanation: {
            correct: 'useState返回一个数组，包含两个元素：[当前状态值, 更新状态的函数]。使用数组解构是最简洁的方式。约定命名：[xxx, setXxx]，如[count, setCount]。',
            wrong: {
                0: '必须使用数组解构才能同时获取state值和setter函数。不解构的话count会是整个数组。',
                2: 'useState返回数组不是对象，应该使用数组解构[]而不是对象解构{}。',
                3: '虽然技术上可行，但非常不推荐。每次调用useState都会创建新的state，这会导致两个独立的state，不是同一个。'
            }
        },
        tags: ['State', 'useState', 'Hooks', '函数组件']
    },
    {
        id: 23,
        type: 'judge',
        question: '直接修改state的值（如 count = 5），React会自动检测并重新渲染组件。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '直接修改state不会触发重新渲染。React通过setState（类组件）或setter函数（函数组件的useState）来跟踪state变化。只有通过这些方法修改，React才知道state改变了，才会重新渲染。直接赋值会导致数据和UI不同步。',
            wrong: {
                0: 'React不会自动检测state的直接修改。必须使用setState或useState返回的setter函数，React才能知道state改变并触发重新渲染。'
            }
        },
        tags: ['State', '更新规则', '常见错误', '不可变性']
    },
    {
        id: 24,
        type: 'single',
        question: '以下哪种方式可以正确更新对象类型的state？',
        options: [
            'user.name = "张三"; setUser(user);',
            'setUser(user.name = "张三");',
            'setUser({ ...user, name: "张三" });',
            'setUser(user => { user.name = "张三"; return user; });'
        ],
        answer: [2],
        explanation: {
            correct: '必须创建新对象来更新state，不能直接修改原对象。使用展开运算符{...user, name: "张三"}创建新对象，保留其他属性，只修改name。这保证了state的不可变性，React能正确检测变化。',
            wrong: {
                0: '直接修改user对象，然后传给setUser。虽然看起来调用了setUser，但传入的是修改后的同一个对象引用，React可能检测不到变化。',
                1: '赋值表达式返回值是"张三"（字符串），不是对象，会导致state类型错误。',
                3: '直接修改了参数user，返回的还是同一个对象引用。应该创建新对象：return {...user, name: "张三"}。'
            }
        },
        tags: ['State', '对象更新', '不可变性', 'useState']
    },
    {
        id: 25,
        type: 'multiple',
        question: '关于State的不可变性原则，以下说法正确的是？（多选）',
        options: [
            '不应该直接修改state对象，应该创建新对象',
            '数组应该使用concat、slice、扩展运算符等方法，避免使用push、splice',
            '不可变性有助于React的性能优化',
            '不可变性是可选的，直接修改state也能正常工作'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：保持不可变性，总是创建新的state对象。选项B：使用返回新数组的方法，避免直接修改原数组的方法。选项C：不可变性使得React可以用浅比较快速检测变化，React.memo、PureComponent等优化才能正常工作。',
            wrong: {
                3: '不可变性不是可选的，是必须遵守的原则。直接修改state可能导致：1) 组件不重新渲染；2) shouldComponentUpdate等优化失效；3) 时间旅行调试等高级功能无法使用。'
            }
        },
        tags: ['State', '不可变性', '最佳实践', '性能优化']
    },
    {
        id: 26,
        type: 'single',
        question: '批量更新多个state，以下哪种方式最高效？',
        options: [
            '分别调用多次setState',
            '合并所有state到一个对象中',
            'React 18会自动批处理所有更新',
            '使用useReducer代替useState'
        ],
        answer: [2],
        explanation: {
            correct: 'React 18引入了自动批处理（Automatic Batching），无论在何处（事件处理器、异步函数、setTimeout等），React都会自动将多个state更新合并为一次重新渲染，大幅提升性能。不需要手动优化。',
            wrong: {
                0: 'React 18之前，在某些情况下（如setTimeout、Promise）多次setState不会自动批处理。但React 18已经自动优化了这个问题。',
                1: '不必要地合并state会导致代码复杂，而且当state相互独立时，这样做是反模式。React 18的自动批处理已经解决了性能问题。',
                3: 'useReducer适合复杂的state逻辑，但不会比useState更高效。React 18的自动批处理对两者都有效。'
            }
        },
        tags: ['State', '批量更新', 'React 18', '性能优化']
    },
    {
        id: 27,
        type: 'single',
        question: 'useState的setter函数有两种形式，以下说法正确的是？',
        options: [
            '只能使用setCount(newValue)的形式',
            '只能使用setCount(prev => prev + 1)的形式',
            '可以使用直接值或函数，函数形式接收前一个state作为参数',
            '两种形式完全相同，没有区别'
        ],
        answer: [2],
        explanation: {
            correct: 'setter有两种形式：1) setCount(newValue) - 直接设置新值；2) setCount(prev => newValue) - 函数形式，接收前一个state。当新state依赖旧state时，必须使用函数形式，因为state更新可能是异步的，直接使用可能拿到过时的值。',
            wrong: {
                0: '还有函数形式：setCount(prev => prev + 1)，这在更新依赖前一个state时很重要。',
                1: '直接值形式也是合法的：setCount(5)。当新值不依赖旧值时，直接值形式更简洁。',
                3: '有重要区别：当连续多次更新或在异步操作中更新时，函数形式能保证拿到最新的state值，直接值形式可能造成闭包问题。'
            }
        },
        tags: ['State', 'useState', 'setter函数', '函数式更新']
    },
    {
        id: 28,
        type: 'judge',
        question: 'State更新后，组件会立即重新渲染。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'State更新是异步的。调用setState或setter函数后，组件不会立即重新渲染。React会将更新加入队列，在合适的时机批量处理。这意味着：1) setState之后立即读取state，可能还是旧值；2) 多次setState可能被合并；3) 可以使用useEffect监听state变化。',
            wrong: {
                0: 'State更新是异步的，不会立即重新渲染。React会优化性能，批量处理更新。在React 18中，所有更新都会自动批处理。'
            }
        },
        tags: ['State', '异步更新', '批处理', '更新机制']
    },
    {
        id: 29,
        type: 'single',
        question: '初始state创建比较耗时，应该如何优化？',
        options: [
            'const [state, setState] = useState(expensiveComputation());',
            'const [state, setState] = useState(() => expensiveComputation());',
            'const [state, setState] = useState(useMemo(() => expensiveComputation()));',
            '无需优化，React会自动处理'
        ],
        answer: [1],
        explanation: {
            correct: 'useState接收函数作为参数时，函数只在初始渲染时执行一次（惰性初始化）。这避免了每次渲染都执行耗时计算。注意：传递的是函数本身，不是函数调用结果。',
            wrong: {
                0: '每次组件渲染时都会执行expensiveComputation()，即使不使用返回值。应该传递函数而非函数调用结果。',
                2: 'useMemo不能在useState内部使用。正确做法是直接传递函数给useState。',
                3: 'React不会自动优化初始化函数。如果初始化耗时，每次渲染都会执行，严重影响性能。'
            }
        },
        tags: ['State', 'useState', '性能优化', '惰性初始化']
    },
    {
        id: 30,
        type: 'multiple',
        question: '以下哪些情况会导致组件重新渲染？（多选）',
        options: [
            '组件的state改变',
            '组件的props改变',
            '父组件重新渲染',
            '只是读取state的值，没有修改'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：State改变触发重新渲染。选项B：Props改变意味着父组件传了新值，触发重新渲染。选项C：默认情况下，父组件渲染会导致所有子组件渲染，无论props是否改变（可以用React.memo优化）。',
            wrong: {
                3: '仅读取state不会触发渲染。只有通过setState/setter函数修改state，React才会安排重新渲染。'
            }
        },
        tags: ['State', 'Props', '渲染机制', '组件更新']
    },

    // 事件处理 (31-40)
    {
        id: 31,
        type: 'single',
        question: 'React事件处理器的命名规范是什么？',
        options: [
            '使用小写：onclick',
            '使用驼峰命名法：onClick',
            '使用连字符：on-click',
            '使用下划线：on_click'
        ],
        answer: [1],
        explanation: {
            correct: 'React事件使用驼峰命名法（camelCase），如onClick、onMouseEnter、onSubmit。这是JSX的约定，与HTML的小写命名不同。这样做是为了与JavaScript事件处理的习惯一致。',
            wrong: {
                0: 'onclick是HTML的写法，JSX中必须使用驼峰命名法onClick。',
                2: '连字符on-click不是有效的JavaScript属性名（会被解析为减法运算），JSX不支持。',
                3: '下划线on_click不符合React的命名规范，应该使用驼峰命名法。'
            }
        },
        tags: ['事件处理', '命名规范', '语法']
    },
    {
        id: 32,
        type: 'single',
        question: '如何在事件处理器中传递参数？',
        options: [
            '<button onClick={handleClick(id)}>点击</button>',
            '<button onClick={() => handleClick(id)}>点击</button>',
            '<button onClick={handleClick.bind(this, id)}>点击</button>',
            '选项B和C都正确'
        ],
        answer: [3],
        explanation: {
            correct: '选项B和C都是正确的传参方式。选项B使用箭头函数包装，在点击时调用handleClick(id)。选项C使用bind方法预先绑定参数。两种方式都能正常工作，箭头函数更常用，更易读。',
            wrong: {
                0: '这样写会在渲染时立即执行handleClick(id)，而不是在点击时执行。应该传递函数引用，不是函数调用结果。',
                1: '这是正确的，但不是唯一正确答案。',
                2: '这也是正确的，但不是唯一正确答案。'
            }
        },
        tags: ['事件处理', '参数传递', '箭头函数', 'bind']
    },
    {
        id: 33,
        type: 'judge',
        question: 'React的合成事件(SyntheticEvent)与原生DOM事件完全相同。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'React的合成事件是对原生事件的跨浏览器封装，提供统一的API。主要区别：1) 合成事件使用事件池（React 17之前），事件对象会被重用；2) 阻止默认行为必须显式调用preventDefault()，return false无效；3) 某些事件名称和行为有差异（如onChange）。',
            wrong: {
                0: '合成事件是React的封装层，虽然API相似，但有重要区别。比如阻止默认行为、事件对象复用、某些事件的触发时机等都不完全相同。'
            }
        },
        tags: ['事件处理', '合成事件', 'SyntheticEvent']
    },
    {
        id: 34,
        type: 'single',
        question: '如何在React中阻止事件的默认行为？',
        options: [
            'return false',
            'event.preventDefault()',
            'event.stopDefault()',
            'event.preventBubble()'
        ],
        answer: [1],
        explanation: {
            correct: '必须显式调用event.preventDefault()。这是React合成事件的特点之一，与传统HTML不同（HTML中return false可以阻止默认行为）。常见场景：阻止表单提交、阻止链接跳转等。',
            wrong: {
                0: 'return false在React中不能阻止默认行为，只会阻止函数继续执行。必须使用preventDefault()。',
                2: 'stopDefault()不是有效的方法，正确的是preventDefault()。',
                3: 'preventBubble()不存在。阻止冒泡是stopPropagation()，阻止默认行为是preventDefault()。'
            }
        },
        tags: ['事件处理', '阻止默认行为', 'preventDefault']
    },
    {
        id: 35,
        type: 'multiple',
        question: '关于React事件处理，以下说法正确的是？（多选）',
        options: [
            'React使用事件委托，将事件绑定在根节点',
            '在React 17之前，事件委托在document上；React 17+在root节点',
            'React事件会自动绑定this',
            '可以通过event.nativeEvent访问原生事件对象'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：React使用事件委托优化性能。选项B：React 17改进了事件系统，从document移到root节点，更利于多React版本共存。选项D：可以通过nativeEvent访问底层原生事件。',
            wrong: {
                2: 'React不会自动绑定this。类组件中需要手动绑定（构造函数bind、箭头函数、类属性）。函数组件没有this问题。'
            }
        },
        tags: ['事件处理', '事件委托', '合成事件', 'React 17']
    },
    {
        id: 36,
        type: 'single',
        question: '类组件中，以下哪种方式绑定事件处理器的this是错误的？',
        options: [
            '在constructor中：this.handleClick = this.handleClick.bind(this)',
            '使用箭头函数：handleClick = () => {}',
            '在JSX中使用箭头函数：onClick={() => this.handleClick()}',
            '在JSX中直接引用：onClick={this.handleClick}'
        ],
        answer: [3],
        explanation: {
            correct: '选项D是错误的。直接传递this.handleClick，this在调用时会是undefined（严格模式）或window（非严格模式）。必须绑定this。前三个选项都能正确绑定this，但各有利弊：构造函数bind性能最好，箭头函数最简洁。',
            wrong: {
                0: '这是正确的绑定方式，性能最好，推荐用于频繁触发的事件。',
                1: '这是正确的类属性箭头函数写法，自动绑定this，代码最简洁。',
                2: '这是正确的JSX箭头函数写法，但每次渲染都会创建新函数，可能影响性能。'
            }
        },
        tags: ['事件处理', 'this绑定', '类组件']
    },
    {
        id: 37,
        type: 'judge',
        question: '事件对象event在异步回调中仍然可以正常使用。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '在React 17之前，事件对象会被重用（事件池），异步访问会得到null。解决方法：1) 调用event.persist()保留事件对象；2) 同步提取需要的值。React 17+移除了事件池，可以正常异步访问，但仍建议同步提取值以保证兼容性。',
            wrong: {
                0: 'React 17之前，异步访问事件对象会出错（事件池机制）。虽然React 17+已解决，但最佳实践仍是同步提取需要的值。'
            }
        },
        tags: ['事件处理', '事件对象', '异步', '事件池']
    },
    {
        id: 38,
        type: 'single',
        question: 'React中onChange事件与原生HTML有什么区别？',
        options: [
            '完全相同，没有区别',
            'React的onChange在每次输入时触发，更像原生的onInput',
            'React的onChange在失去焦点时触发',
            'React不支持onChange事件'
        ],
        answer: [1],
        explanation: {
            correct: 'React的onChange实际上更接近原生的onInput，每次输入都会触发。原生HTML的onchange在失去焦点时触发。React这样做是为了实现受控组件，使得输入实时反映到state中。这是React对原生事件的语义化改进。',
            wrong: {
                0: 'React的onChange触发时机与原生HTML不同，更符合直觉和受控组件的需求。',
                2: '这是原生HTML的onchange行为，React的onChange是实时触发的。',
                3: 'React支持onChange，而且是表单处理的核心事件，用于实现受控组件。'
            }
        },
        tags: ['事件处理', 'onChange', '受控组件', '区别']
    },
    {
        id: 39,
        type: 'single',
        question: '如何阻止React事件冒泡？',
        options: [
            'event.stopPropagation()',
            'event.stopBubbling()',
            'return false',
            'event.cancelBubble = true'
        ],
        answer: [0],
        explanation: {
            correct: '使用event.stopPropagation()阻止事件冒泡。这对React合成事件和原生事件都有效。注意：阻止合成事件冒泡不会阻止原生事件冒泡（因为原生事件早已冒泡到root节点）。如需阻止原生事件，使用event.nativeEvent.stopImmediatePropagation()。',
            wrong: {
                1: 'stopBubbling()不是有效的方法，正确的是stopPropagation()。',
                2: 'return false在React中不能阻止冒泡，只会阻止函数执行。',
                3: 'cancelBubble是IE旧API，虽然现代浏览器也支持，但React推荐使用标准的stopPropagation()。'
            }
        },
        tags: ['事件处理', '事件冒泡', 'stopPropagation']
    },
    {
        id: 40,
        type: 'multiple',
        question: '以下哪些是React支持的事件类型？（多选）',
        options: [
            '鼠标事件：onClick、onDoubleClick、onMouseEnter',
            '键盘事件：onKeyDown、onKeyPress、onKeyUp',
            '表单事件：onChange、onSubmit、onFocus',
            '触摸事件：onTouchStart、onTouchMove、onTouchEnd'
        ],
        answer: [0, 1, 2, 3],
        explanation: {
            correct: 'React支持几乎所有的DOM事件类型，包括：鼠标事件、键盘事件、表单事件、触摸事件、拖拽事件、滚轮事件、焦点事件、UI事件等。所有这些事件都被封装为合成事件，提供一致的跨浏览器API。',
            wrong: {}
        },
        tags: ['事件处理', '事件类型', '合成事件']
    },

    // 条件渲染和列表渲染 (41-50)
    {
        id: 41,
        type: 'single',
        question: '以下条件渲染写法中，可能出现错误的是哪个？',
        options: [
            '{isLoggedIn && <Dashboard />}',
            '{count && <p>数量：{count}</p>}',
            '{isLoggedIn ? <Dashboard /> : <Login />}',
            '{Boolean(count) && <p>数量：{count}</p>}'
        ],
        answer: [1],
        explanation: {
            correct: '选项B可能出错。当count为0时，会渲染0而不是什么都不渲染（因为0是falsy但可渲染）。正确做法：count > 0 && ...或Boolean(count) && ...。这是逻辑与渲染的常见陷阱。',
            wrong: {
                0: '这是正确的。isLoggedIn是布尔值，false && <Dashboard />结果是false，React不渲染false。',
                2: '三元运算符始终安全，明确返回一个值或另一个值。',
                3: '这是正确的修复方式，Boolean(count)将0转为false，避免渲染0。'
            }
        },
        tags: ['条件渲染', '逻辑运算符', '常见陷阱']
    },
    {
        id: 42,
        type: 'judge',
        question: 'React会渲染null、undefined、false，但不渲染true。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'React不会渲染null、undefined、false和true（所有布尔值）。这些值会被忽略，不会出现在DOM中。但是会渲染0、空字符串""、NaN。特别注意：0会被渲染为文本"0"，这常导致条件渲染bug。',
            wrong: {
                0: 'null、undefined、false、true都不会被渲染。但0和空字符串会被渲染。'
            }
        },
        tags: ['条件渲染', '渲染行为', 'React机制']
    },
    {
        id: 43,
        type: 'multiple',
        question: 'React中实现条件渲染，以下哪些方式是推荐的？（多选）',
        options: [
            '三元运算符：{condition ? <A /> : <B />}',
            '逻辑与：{condition && <Component />}',
            '立即执行函数：{(() => { if (condition) return <A />; return <B />; })()}',
            '使用if语句（在JSX外部）然后返回不同的JSX'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A、B、D都是推荐的方式。三元运算符适合二选一，逻辑与适合有或无，if语句适合复杂条件。选择哪种取决于具体场景和代码可读性。',
            wrong: {
                2: '虽然技术上可行，但IIFE使代码难以阅读，不推荐。应该使用更清晰的方式，或将逻辑提取到组件外部。'
            }
        },
        tags: ['条件渲染', '最佳实践', '代码可读性']
    },
    {
        id: 44,
        type: 'single',
        question: '列表渲染时，key应该如何选择？',
        options: [
            '使用数组索引index',
            '使用Math.random()生成随机数',
            '使用数据的唯一标识id',
            'key不重要，可以省略'
        ],
        answer: [2],
        explanation: {
            correct: 'key应该使用数据的稳定唯一标识（如id）。好的key特征：1) 唯一性；2) 稳定性（不随渲染改变）；3) 可预测性。这样React才能正确跟踪元素，优化性能，避免bug。',
            wrong: {
                0: '使用index作为key是反模式。当列表可能重排序、过滤或增删元素时，会导致性能问题和状态错乱。只有静态列表且不会改变时才勉强可用。',
                1: '随机数每次渲染都不同，会导致React认为是全新元素，完全破坏了key的作用，严重影响性能。',
                3: 'key很重要。不提供key会有警告，React会使用index作为key，可能导致问题。'
            }
        },
        tags: ['列表渲染', 'key', '最佳实践']
    },
    {
        id: 45,
        type: 'judge',
        question: 'key只需要在兄弟元素中唯一，不需要全局唯一。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'key只需要在兄弟元素（同一个父组件下的同一层级）中唯一即可，不需要全局唯一。不同父组件或不同层级的元素可以有相同的key。React用key来区分同一层级的元素。',
            wrong: {
                1: 'key确实只需要兄弟元素中唯一。要求全局唯一会增加不必要的复杂度。'
            }
        },
        tags: ['列表渲染', 'key', '作用域']
    },
    {
        id: 46,
        type: 'single',
        question: '在map中使用key，以下哪种写法是错误的？',
        options: [
            'items.map(item => <li key={item.id}>{item.name}</li>)',
            'items.map((item, index) => <li key={index}>{item.name}</li>)',
            '<ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>',
            'items.map(item => <Item key={item.id} data={item} />)'
        ],
        answer: [1],
        explanation: {
            correct: '选项B使用index作为key，这是不推荐的做法（虽然技术上不会报错）。当列表顺序改变、元素增删时，会导致性能问题和潜在的状态bug。应该使用数据的唯一标识。',
            wrong: {
                0: '这是正确且推荐的写法，使用数据的唯一id作为key。',
                2: '这是正确的写法，key放在map直接返回的元素上。',
                3: '这是正确的写法，即使是自定义组件，key也要放在map直接返回的组件上。'
            }
        },
        tags: ['列表渲染', 'key', 'map', '常见错误']
    },
    {
        id: 47,
        type: 'single',
        question: 'key属性会传递给组件吗？',
        options: [
            'key会作为props.key传递',
            'key不会传递给组件，是React内部使用的',
            'key会作为props._key传递',
            'key只在开发环境传递，生产环境不传递'
        ],
        answer: [1],
        explanation: {
            correct: 'key是React的特殊属性，不会传递给组件。React内部使用key来跟踪元素，组件内部无法通过props访问。如果组件需要id，必须单独传递：<Item key={item.id} id={item.id} />。ref也有相同特性。',
            wrong: {
                0: 'key不会出现在props中，组件内部访问props.key会得到undefined。',
                2: 'key不会以任何形式传递，包括_key。这是React的设计决定。',
                3: 'key在任何环境都不传递，这与环境无关，是React的核心机制。'
            }
        },
        tags: ['列表渲染', 'key', 'props']
    },
    {
        id: 48,
        type: 'multiple',
        question: '关于列表渲染，以下说法正确的是？（多选）',
        options: [
            'map方法必须return一个JSX元素',
            '可以在map中使用条件渲染',
            'key应该放在map直接返回的元素上',
            'map中可以返回null来跳过渲染某个元素'
        ],
        answer: [0, 1, 2, 3],
        explanation: {
            correct: '选项A：map必须return值，否则会渲染undefined（不显示）。选项B：可以在map中使用三元运算符等条件渲染。选项C：key必须放在最外层元素上。选项D：return null可以跳过元素，但key仍然需要（避免警告可以先filter）。',
            wrong: {}
        },
        tags: ['列表渲染', 'map', 'key', '最佳实践']
    },
    {
        id: 49,
        type: 'single',
        question: '如何正确地在列表渲染中删除一个元素？',
        options: [
            '直接修改原数组：items.splice(index, 1); setItems(items);',
            '使用filter创建新数组：setItems(items.filter(item => item.id !== id));',
            '设置元素为null：items[index] = null; setItems(items);',
            '使用delete操作符：delete items[index]; setItems(items);'
        ],
        answer: [1],
        explanation: {
            correct: 'filter会创建新数组，符合state不可变性原则。删除id匹配的元素：items.filter(item => item.id !== deleteId)。这样React能检测到数组变化，正确更新UI。',
            wrong: {
                0: 'splice直接修改原数组，违反不可变性。即使调用setItems，传入的是同一个数组引用，React可能检测不到变化。',
                2: '设置为null不会删除元素，只是改变值。而且直接修改数组违反不可变性。null也会影响key的唯一性。',
                3: 'delete会创建空位（sparse array），不是真正删除。且直接修改数组违反不可变性。'
            }
        },
        tags: ['列表渲染', '数组操作', '不可变性', 'filter']
    },
    {
        id: 50,
        type: 'single',
        question: '受控组件和非受控组件的主要区别是什么？',
        options: [
            '受控组件性能更好',
            '受控组件的值由React state控制，非受控组件由DOM自己管理',
            '非受控组件只能用于简单表单',
            '受控组件不需要onChange事件'
        ],
        answer: [1],
        explanation: {
            correct: '受控组件：表单元素的值由React state控制，通过onChange更新state，实现双向绑定。非受控组件：值由DOM管理，React通过ref获取值。受控组件更符合React理念，易于验证和处理；非受控组件代码更少，但控制力较弱。',
            wrong: {
                0: '性能差异不大，不是主要区别。选择哪种主要看是否需要实时控制和验证表单值。',
                2: '非受控组件可以用于任何表单，只是缺少实时控制。某些场景（如文件上传）必须用非受控组件。',
                3: '恰恰相反，受控组件必须有onChange事件来更新state，否则输入框无法输入（只读）。'
            }
        },
        tags: ['表单', '受控组件', '非受控组件', '区别']
    }
];

