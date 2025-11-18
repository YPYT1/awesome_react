// Part 2: Hooks深入掌握 - 题库
const questionsPart2 = [
    // useState (1-10)
    {
        id: 1,
        type: 'single',
        question: 'useState返回的数组中，第二个元素（setter函数）的特点是什么？',
        options: [
            '每次渲染都会创建新的setter函数',
            'setter函数的引用在组件整个生命周期中保持不变',
            'setter函数会改变但功能相同',
            'setter函数只在首次渲染时创建'
        ],
        answer: [1],
        explanation: {
            correct: 'setter函数（如setCount）的引用在组件整个生命周期中保持稳定不变。这是React的优化，意味着可以安全地将setter函数传递给子组件或作为依赖项，不会导致不必要的重新渲染。这与state值本身不同，state值每次更新都会变化。',
            wrong: {
                0: 'setter函数不会在每次渲染时重新创建，它的引用是稳定的。这是React的性能优化。',
                2: 'setter函数的引用不会改变，它是稳定的。',
                3: '描述不准确。setter函数不仅在首次渲染创建，而是在整个生命周期中保持同一个引用。'
            }
        },
        tags: ['useState', 'Hooks', 'setter函数', '稳定引用']
    },
    {
        id: 2,
        type: 'judge',
        question: '在useState的setter函数中，如果新值与旧值相同，React仍会触发重新渲染。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'React使用Object.is算法比较新旧值。如果值相同，React会跳过渲染和effect执行。这是React的优化机制。但注意：对于对象和数组，即使内容相同，如果是不同的引用，React仍会认为值改变了。',
            wrong: {
                0: 'React会进行浅比较，如果新值和旧值相同（使用Object.is比较），会跳过渲染，这是重要的性能优化。'
            }
        },
        tags: ['useState', 'React优化', '渲染机制']
    },
    {
        id: 3,
        type: 'multiple',
        question: '关于useState的惰性初始化，以下说法正确的是？（多选）',
        options: [
            '可以传递函数给useState：useState(() => expensiveComputation())',
            '初始化函数只在首次渲染时执行一次',
            '初始化函数可以接收参数',
            '惰性初始化适用于初始值计算成本较高的场景'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：传递函数实现惰性初始化。选项B：该函数只在组件首次渲染时执行，后续渲染会跳过。选项D：主要用于优化昂贵的初始化计算。',
            wrong: {
                2: '初始化函数不接收任何参数，它是一个无参函数，返回值作为初始state。如果需要基于props初始化，可以在函数内部访问props（闭包）。'
            }
        },
        tags: ['useState', '惰性初始化', '性能优化']
    },
    {
        id: 4,
        type: 'single',
        question: '以下哪种情况必须使用函数式更新？',
        options: [
            '当state是对象或数组时',
            '当新state依赖旧state，且可能有多次连续更新时',
            '当state是布尔值时',
            '所有情况都应该使用函数式更新'
        ],
        answer: [1],
        explanation: {
            correct: '当新state依赖旧state时，应使用函数式更新：setCount(c => c + 1)。这确保获取最新的state值。特别是在事件处理器中多次调用setState、或在异步操作中更新state时，函数式更新能保证正确性，避免闭包陷阱。',
            wrong: {
                0: '对象和数组需要不可变更新，但不一定要用函数式更新。关键是是否依赖旧值。',
                2: '布尔值切换（如setFlag(f => !f)）适合用函数式更新，但不是必须的。',
                3: '如果新值不依赖旧值，直接传值更简洁：setName("张三")。函数式更新只在需要时使用。'
            }
        },
        tags: ['useState', '函数式更新', '最佳实践', '闭包陷阱']
    },
    {
        id: 5,
        type: 'single',
        question: '多个useState可以合并为一个吗？以下说法正确的是：',
        options: [
            '必须合并为一个对象state',
            '必须分开使用多个useState',
            '根据关联性选择：相关的state合并，独立的分开',
            'useState数量会影响性能，应该尽量少'
        ],
        answer: [2],
        explanation: {
            correct: '根据state的关联性决定：相关且经常一起更新的state可以合并为对象；独立的state应该分开。分开的好处：1) 代码更清晰；2) 更新更简单；3) 自定义Hook更容易复用。合并的好处：1) 相关数据聚合；2) 一次更新多个值。',
            wrong: {
                0: '不需要强制合并。过度合并会导致更新困难（需要展开运算符），代码不够清晰。',
                1: '不需要完全分开。合理的合并可以让代码更有组织性。',
                3: 'useState的数量对性能影响微乎其微。代码清晰度和可维护性更重要。'
            }
        },
        tags: ['useState', '状态组织', '最佳实践']
    },
    {
        id: 6,
        type: 'judge',
        question: 'useState可以在条件语句、循环或嵌套函数中调用。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '这违反了Hooks规则。Hooks必须在函数组件的顶层调用，不能在条件、循环或嵌套函数中。原因：React依赖Hooks的调用顺序来正确匹配state，条件调用会破坏这个顺序，导致严重bug。',
            wrong: {
                0: 'Hooks有严格的调用规则，必须在顶层调用。这是React Hooks设计的核心约束，保证内部state链表的正确性。'
            }
        },
        tags: ['useState', 'Hooks规则', '调用顺序']
    },
    {
        id: 7,
        type: 'multiple',
        question: '以下哪些是useState更新state的正确方式？（多选）',
        options: [
            'setCount(5)',
            'setCount(count + 1)',
            'setCount(c => c + 1)',
            'setCount(prev => ({ ...prev, name: "张三" }))'
        ],
        answer: [0, 1, 2, 3],
        explanation: {
            correct: '所有选项都是语法上正确的。选项A：直接设置值。选项B：使用当前count值（注意闭包陷阱）。选项C：函数式更新，最安全。选项D：更新对象state的函数式写法。虽然都正确，但在不同场景下应选择最合适的方式。',
            wrong: {}
        },
        tags: ['useState', '更新方式', '语法']
    },
    {
        id: 8,
        type: 'single',
        question: 'React 18中，以下哪种情况下state更新会自动批处理？',
        options: [
            '只有在React事件处理器中',
            '只有在同步代码中',
            '在所有情况下（事件、异步、setTimeout等）',
            '永远不会自动批处理'
        ],
        answer: [2],
        explanation: {
            correct: 'React 18引入了自动批处理，无论在何处（事件处理器、Promise、setTimeout、原生事件），多个state更新都会自动批处理为一次渲染。这是重大性能改进。React 17及以前版本只在React事件处理器中批处理。',
            wrong: {
                0: '这是React 17的行为。React 18扩展了批处理范围，包含所有场景。',
                1: 'React 18的批处理不限于同步代码，异步代码（Promise、setTimeout）也会批处理。',
                3: 'React 18确实会自动批处理，这是一个重要的性能优化特性。'
            }
        },
        tags: ['useState', 'React 18', '自动批处理', '性能优化']
    },
    {
        id: 9,
        type: 'single',
        question: '如果需要在state更新后立即获取DOM的最新状态，应该使用什么？',
        options: [
            'setState后直接访问DOM',
            'useEffect监听state变化',
            'useLayoutEffect监听state变化',
            'setTimeout延迟访问'
        ],
        answer: [2],
        explanation: {
            correct: 'useLayoutEffect在DOM更新后、浏览器绘制前同步执行，可以立即读取DOM。useEffect是异步的，在绘制后执行。如果需要测量DOM尺寸、同步修改DOM以避免闪烁，使用useLayoutEffect。',
            wrong: {
                0: 'setState是异步的，直接访问DOM可能得到旧值。',
                1: 'useEffect是异步执行的，在浏览器绘制之后，不适合需要同步读取DOM的场景。',
                3: 'setTimeout不可靠，延迟时间难以确定，可能仍然读取旧值或造成闪烁。'
            }
        },
        tags: ['useState', 'useLayoutEffect', 'DOM更新', '同步操作']
    },
    {
        id: 10,
        type: 'judge',
        question: '在严格模式下，React会故意调用两次useState的初始化函数来帮助发现副作用。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '在开发模式的严格模式（StrictMode）下，React会双重调用某些函数（包括函数组件、useState初始化函数、useReducer等）来帮助发现副作用和不纯的代码。这只发生在开发环境，生产环境不会。这提醒开发者保持函数纯净。',
            wrong: {
                1: 'React确实会在严格模式下双重调用来检测问题。这是有意为之的开发辅助功能。'
            }
        },
        tags: ['useState', 'StrictMode', '严格模式', '调试']
    },

    // useEffect (11-20)
    {
        id: 11,
        type: 'single',
        question: 'useEffect的执行时机是什么？',
        options: [
            '在组件渲染之前同步执行',
            '在DOM更新后异步执行',
            '在DOM更新后、浏览器绘制前同步执行',
            '在组件卸载时执行'
        ],
        answer: [1],
        explanation: {
            correct: 'useEffect在组件渲染到屏幕之后异步执行，不会阻塞浏览器绘制。执行时机：1) DOM已更新；2) 浏览器已绘制；3) 用户已看到更新。这与useLayoutEffect不同，后者在绘制前同步执行。',
            wrong: {
                0: 'useEffect在渲染之后执行，不是之前。渲染前执行的是组件函数本身。',
                2: '这是useLayoutEffect的时机，不是useEffect。useEffect在绘制之后异步执行。',
                3: '清理函数在组件卸载时执行，但useEffect本身在每次渲染后执行（根据依赖）。'
            }
        },
        tags: ['useEffect', '执行时机', '异步执行']
    },
    {
        id: 12,
        type: 'multiple',
        question: '关于useEffect的依赖数组，以下说法正确的是？（多选）',
        options: [
            '省略依赖数组，effect每次渲染后都执行',
            '传空数组[]，effect只在挂载时执行一次',
            '依赖数组应包含effect中使用的所有外部变量',
            '依赖数组中可以只包含部分使用的变量'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：无依赖数组时每次都执行。选项B：空数组只执行一次（相当于componentDidMount）。选项C：应包含所有外部变量，否则可能导致闭包陷阱和bug。',
            wrong: {
                3: '必须包含所有使用的外部变量。遗漏依赖会导致闭包陷阱，使用过时的值。ESLint的exhaustive-deps规则会检查这个。'
            }
        },
        tags: ['useEffect', '依赖数组', '最佳实践']
    },
    {
        id: 13,
        type: 'single',
        question: 'useEffect的清理函数何时执行？',
        options: [
            '只在组件卸载时执行',
            '在每次effect重新执行之前和组件卸载时执行',
            '在组件挂载时执行',
            '在effect执行后立即执行'
        ],
        answer: [1],
        explanation: {
            correct: '清理函数在两个时机执行：1) 每次effect重新执行之前，清理上一次的effect；2) 组件卸载时，清理最后一次的effect。这确保没有内存泄漏。例如清除定时器、取消订阅、中止请求等。',
            wrong: {
                0: '不仅在卸载时执行。每次effect重新执行前都会先执行清理函数。',
                2: '挂载时不执行清理函数，而是执行effect本身。',
                3: '清理函数不是在effect后立即执行，而是在下次effect前或卸载时执行。'
            }
        },
        tags: ['useEffect', '清理函数', '执行时机']
    },
    {
        id: 14,
        type: 'judge',
        question: 'useEffect中可以使用async/await将整个effect函数标记为async。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'effect函数不能是async函数，因为它应该返回清理函数或undefined，而async函数总是返回Promise。正确做法：在effect内部定义async函数并立即调用，或使用.then()。',
            wrong: {
                0: 'useEffect回调不能是async函数。可以在内部使用async函数：useEffect(() => { async function fetchData() {...}; fetchData(); }, [])'
            }
        },
        tags: ['useEffect', 'async/await', '异步操作', '常见错误']
    },
    {
        id: 15,
        type: 'single',
        question: '以下哪种处理数据获取的方式是正确的？',
        options: [
            'useEffect(async () => { const data = await fetch(url); }, [])',
            'useEffect(() => { fetch(url).then(data => setState(data)); }, [])',
            'useEffect(() => { async function f() { const data = await fetch(url); setState(data); } f(); }, [])',
            '选项B和C都正确'
        ],
        answer: [3],
        explanation: {
            correct: '选项B和C都是正确的异步数据获取方式。选项B使用Promise链，选项C在内部定义async函数。两种方式都避免了让effect本身成为async函数。实践中选项C更常见，代码更清晰。',
            wrong: {
                0: 'effect回调不能是async函数。async函数返回Promise，但effect应该返回清理函数或undefined。',
                1: '这是正确的，但不是唯一正确答案。',
                2: '这是正确的，但不是唯一正确答案。'
            }
        },
        tags: ['useEffect', '数据获取', 'async/await', '最佳实践']
    },
    {
        id: 16,
        type: 'multiple',
        question: '以下哪些情况需要在useEffect中进行清理？（多选）',
        options: [
            '设置定时器（setTimeout、setInterval）',
            '订阅事件或数据源',
            '发起网络请求',
            '修改DOM'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：定时器必须清除，避免内存泄漏。选项B：订阅必须取消，避免回调在组件卸载后执行。选项C：网络请求应该中止或忽略结果，避免在卸载后setState。',
            wrong: {
                3: '修改DOM通常不需要清理，除非添加了事件监听器或其他需要清除的内容。单纯的DOM修改（如改变innerText）不需要清理。'
            }
        },
        tags: ['useEffect', '清理函数', '内存泄漏', '最佳实践']
    },
    {
        id: 17,
        type: 'single',
        question: '如何避免useEffect中的竞态条件（race condition）？',
        options: [
            '使用最新的数据覆盖旧数据',
            '使用标志位或AbortController忽略过期的请求',
            '在依赖数组中添加所有变量',
            '使用useCallback包装请求函数'
        ],
        answer: [1],
        explanation: {
            correct: '应该忽略过期的请求。方法：1) 使用布尔标志位let ignore = false，清理时设为true；2) 使用AbortController中止请求。例如：快速切换用户ID时，只显示最后一次请求的结果，忽略之前的。',
            wrong: {
                0: '直接覆盖可能导致显示错误数据（旧请求比新请求慢时）。必须识别并忽略过期请求。',
                2: '完整的依赖数组是必要的，但不能解决竞态条件。竞态条件需要显式处理过期请求。',
                3: 'useCallback用于优化，不能解决竞态条件。关键是在清理函数中标记过期。'
            }
        },
        tags: ['useEffect', '竞态条件', '数据获取', '最佳实践']
    },
    {
        id: 18,
        type: 'judge',
        question: 'useEffect中setState不会触发无限循环，因为React会自动检测。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '如果effect中setState且state在依赖数组中，会导致无限循环：state改变 → effect执行 → setState → state改变 → ...。React不会自动阻止。避免方法：1) 移除不必要的依赖；2) 使用函数式更新；3) 使用useRef保存值；4) 重新设计逻辑。',
            wrong: {
                0: 'React不会自动检测和阻止无限循环。开发者必须小心设计依赖数组，确保不会造成循环。'
            }
        },
        tags: ['useEffect', '无限循环', '常见错误']
    },
    {
        id: 19,
        type: 'single',
        question: '多个useEffect的执行顺序是什么？',
        options: [
            '完全随机',
            '按照在代码中出现的顺序执行',
            '按照依赖数组的复杂度执行',
            '同时并行执行'
        ],
        answer: [1],
        explanation: {
            correct: 'useEffect按照在组件中定义的顺序依次执行。所有effect都在渲染完成后按顺序执行。这种可预测的顺序使得代码行为更可控。如果有依赖关系，应该注意顺序。',
            wrong: {
                0: '执行顺序不是随机的，而是确定的、按定义顺序的。',
                2: '依赖数组不影响执行顺序，只影响effect是否执行。',
                3: 'effect虽然是异步的，但在同一个组件中是按顺序依次执行，不是并行。'
            }
        },
        tags: ['useEffect', '执行顺序', 'React机制']
    },
    {
        id: 20,
        type: 'multiple',
        question: 'useEffect的最佳实践包括哪些？（多选）',
        options: [
            '每个effect应该只做一件事，复杂逻辑拆分成多个effect',
            '依赖数组应包含所有外部变量',
            '需要清理的副作用必须返回清理函数',
            '尽可能使用空依赖数组[]以优化性能'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：单一职责，便于理解和维护。选项B：完整依赖，避免闭包陷阱。选项C：防止内存泄漏。这些都是重要的最佳实践。',
            wrong: {
                3: '不应该为了性能强行使用空数组。应该根据实际需求设置依赖。错误的依赖会导致bug，比性能问题严重得多。'
            }
        },
        tags: ['useEffect', '最佳实践', '代码质量']
    },

    // useContext (21-25)
    {
        id: 21,
        type: 'single',
        question: 'useContext的主要作用是什么？',
        options: [
            '创建Context对象',
            '读取Context的值',
            '提供Context值给子组件',
            '更新Context值'
        ],
        answer: [1],
        explanation: {
            correct: 'useContext用于读取Context的当前值。创建Context使用React.createContext()，提供值使用Provider组件，更新值通过重新设置Provider的value。useContext让组件订阅Context变化。',
            wrong: {
                0: '创建Context使用createContext()，不是useContext。',
                2: '提供值使用<Context.Provider value={...}>，不是useContext。',
                3: 'Context值通过Provider的value prop更新，useContext只负责读取。'
            }
        },
        tags: ['useContext', 'Context API', '基本概念']
    },
    {
        id: 22,
        type: 'judge',
        question: 'useContext会导致使用它的组件在Context值改变时重新渲染，即使只使用了部分值。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'useContext订阅整个Context对象。即使只使用部分值，只要Context对象变化，组件就会重新渲染。这可能导致性能问题。优化方法：1) 拆分Context；2) 使用React.memo；3) 使用状态管理库的选择器。',
            wrong: {
                1: 'useContext确实会导致全量重渲染，这是React Context的特点。需要通过其他方式优化性能。'
            }
        },
        tags: ['useContext', '性能', '重新渲染']
    },
    {
        id: 23,
        type: 'single',
        question: '如果组件树中没有对应的Provider，useContext会返回什么？',
        options: [
            '抛出错误',
            '返回undefined',
            '返回createContext时设置的默认值',
            '返回null'
        ],
        answer: [2],
        explanation: {
            correct: '会返回createContext()时传入的默认值。例如：const MyContext = createContext("default")，如果没有Provider，useContext(MyContext)返回"default"。默认值只在组件树中找不到Provider时使用。',
            wrong: {
                0: '不会抛出错误，而是返回默认值。这是设计的回退机制。',
                1: '返回createContext的默认值，不是undefined（除非默认值就是undefined）。',
                3: '返回默认值，不是null（除非默认值是null）。'
            }
        },
        tags: ['useContext', 'defaultValue', '默认值']
    },
    {
        id: 24,
        type: 'multiple',
        question: '优化Context性能的方法包括哪些？（多选）',
        options: [
            '拆分Context，将频繁变化和不常变化的值分开',
            '使用useMemo包装Provider的value',
            '将不需要响应Context变化的子组件用React.memo包装',
            '在Provider中使用多个子Provider'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：拆分Context减少不必要的渲染。选项B：useMemo避免value对象每次重新创建导致的渲染。选项C：React.memo阻止不必要的渲染。',
            wrong: {
                3: '嵌套Provider本身不是优化手段，反而可能增加复杂度。优化的关键是减少不必要的渲染。'
            }
        },
        tags: ['useContext', '性能优化', '最佳实践']
    },
    {
        id: 25,
        type: 'single',
        question: '在Context中提供更新函数的最佳实践是什么？',
        options: [
            '将state和setState都放在同一个Context中',
            '将state和setState分成两个Context',
            '不应该在Context中提供更新函数',
            '使用全局变量代替Context'
        ],
        answer: [1],
        explanation: {
            correct: '最佳实践是拆分为两个Context：一个提供state，一个提供dispatch/setState。这样只需要更新函数的组件不会在state变化时重新渲染。例如：const StateContext和const DispatchContext。',
            wrong: {
                0: '放在同一个Context会导致只使用dispatch的组件也在state变化时重新渲染，浪费性能。',
                2: 'Context中可以且应该提供更新函数，这是常见模式。但应该拆分Context优化性能。',
                3: '全局变量不符合React的数据流模式，且不会触发重新渲染。应该使用Context或状态管理库。'
            }
        },
        tags: ['useContext', '性能优化', '最佳实践', 'Context拆分']
    },

    // useReducer (26-30)
    {
        id: 26,
        type: 'single',
        question: 'useReducer适合什么场景？',
        options: [
            '只有简单的state时',
            '只有一两个state值时',
            'state逻辑复杂，或下一个state依赖之前的state时',
            '所有情况都应该用useReducer'
        ],
        answer: [2],
        explanation: {
            correct: 'useReducer适合：1) 复杂的state逻辑（多个子值、复杂的更新）；2) 下一个state依赖前一个state；3) 需要优化深层组件更新（dispatch引用稳定）；4) 状态转换逻辑需要测试。简单state用useState更合适。',
            wrong: {
                0: '简单state用useState更直观，useReducer会增加不必要的复杂度。',
                1: '少量state用useState更简洁，useReducer的优势在于处理复杂逻辑。',
                3: '不是所有情况都需要useReducer。根据复杂度选择：简单用useState，复杂用useReducer。'
            }
        },
        tags: ['useReducer', '使用场景', '最佳实践']
    },
    {
        id: 27,
        type: 'judge',
        question: 'useReducer的dispatch函数引用在组件整个生命周期中保持不变。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'dispatch函数的引用是稳定的，永远不会改变。这是useReducer的优势之一，可以安全地传递给子组件或作为依赖项，不会导致不必要的重新渲染。这与useState的setter函数特性相同。',
            wrong: {
                1: 'dispatch引用确实保持稳定，这是React的保证，也是性能优化的基础。'
            }
        },
        tags: ['useReducer', 'dispatch', '稳定引用']
    },
    {
        id: 28,
        type: 'multiple',
        question: 'reducer函数应该遵循什么原则？（多选）',
        options: [
            '必须是纯函数，相同输入产生相同输出',
            '不能修改传入的state，应该返回新state',
            '可以包含异步操作和副作用',
            '应该使用switch语句处理不同的action type'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：reducer必须是纯函数，保证可预测性。选项B：不可变更新，返回新对象。选项D：switch是常见模式，清晰地处理不同action。',
            wrong: {
                2: 'reducer不能包含副作用（API调用、定时器等）。副作用应该在effect或action creator中处理。reducer只负责计算新state。'
            }
        },
        tags: ['useReducer', 'reducer函数', '纯函数', '最佳实践']
    },
    {
        id: 29,
        type: 'single',
        question: 'useReducer的惰性初始化如何实现？',
        options: [
            'useReducer(reducer, initialState)',
            'useReducer(reducer, () => initialState)',
            'useReducer(reducer, initialArg, init)',
            'useReducer(reducer, initialState, lazy: true)'
        ],
        answer: [2],
        explanation: {
            correct: '第三个参数init是初始化函数：useReducer(reducer, initialArg, init)。init接收initialArg，返回初始state。只在首次渲染时调用，适合耗时的初始化计算。例如：useReducer(reducer, props, initFromProps)。',
            wrong: {
                0: '这是标准用法，没有惰性初始化。每次渲染都会计算initialState。',
                1: '这不是正确的语法。useReducer的惰性初始化需要第三个参数。',
                3: '不存在lazy选项。惰性初始化通过第三个参数函数实现。'
            }
        },
        tags: ['useReducer', '惰性初始化', '性能优化']
    },
    {
        id: 30,
        type: 'single',
        question: 'useReducer和Redux的主要区别是什么？',
        options: [
            '完全相同，没有区别',
            'useReducer是组件内部的，Redux是全局的',
            'useReducer不支持中间件',
            '选项B和C都正确'
        ],
        answer: [3],
        explanation: {
            correct: 'useReducer是React内置Hook，作用域是组件内部。Redux是独立的状态管理库，全局store。主要区别：1) 作用域（局部vs全局）；2) 中间件（useReducer无，Redux有）；3) DevTools（Redux有专门工具）；4) 学习曲线（useReducer更简单）。',
            wrong: {
                0: '两者概念相似但有重要区别，特别是作用域和生态系统。',
                1: '这是区别之一，但不是全部。',
                2: '这也是区别之一，但不是全部。'
            }
        },
        tags: ['useReducer', 'Redux', '区别', '状态管理']
    },

    // useMemo和useCallback (31-36)
    {
        id: 31,
        type: 'single',
        question: 'useMemo和useCallback的主要区别是什么？',
        options: [
            'useMemo缓存值，useCallback缓存函数',
            'useMemo缓存函数，useCallback缓存值',
            '两者完全相同',
            'useMemo用于性能优化，useCallback用于功能实现'
        ],
        answer: [0],
        explanation: {
            correct: 'useMemo缓存计算结果（值）：const value = useMemo(() => compute(), deps)。useCallback缓存函数本身：const fn = useCallback(() => {...}, deps)。实际上useCallback(fn, deps)等价于useMemo(() => fn, deps)。',
            wrong: {
                1: '正好相反。useMemo缓存计算结果，useCallback缓存函数定义。',
                2: '虽然实现上有相似性，但用途和返回值不同。useMemo返回值，useCallback返回函数。',
                3: '两者都用于性能优化，没有功能实现和性能优化的区分。'
            }
        },
        tags: ['useMemo', 'useCallback', '区别', '性能优化']
    },
    {
        id: 32,
        type: 'judge',
        question: '应该为所有计算和函数都使用useMemo和useCallback以提升性能。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '不应该过度使用。useMemo和useCallback本身有成本（内存、比较依赖）。只在以下情况使用：1) 计算成本高；2) 传递给使用React.memo的子组件；3) 作为其他Hook的依赖。过早优化会降低代码可读性，实际性能提升可能微乎其微。',
            wrong: {
                0: '过度使用会降低代码可读性，增加内存占用，且可能没有实际性能提升。应该按需使用，先写简单代码，性能有问题时再优化。'
            }
        },
        tags: ['useMemo', 'useCallback', '性能优化', '过度优化']
    },
    {
        id: 33,
        type: 'multiple',
        question: '以下哪些情况应该使用useMemo？（多选）',
        options: [
            '计算成本很高，如复杂的数据转换',
            '返回值传递给使用React.memo的子组件',
            '返回值作为其他Hook的依赖',
            '所有函数组件中的计算'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：避免每次渲染都执行昂贵计算。选项B：避免子组件不必要的重新渲染。选项C：避免其他Hook不必要的执行。这些是真正需要优化的场景。',
            wrong: {
                3: '不是所有计算都需要useMemo。简单计算的成本可能低于useMemo本身。应该有针对性地优化。'
            }
        },
        tags: ['useMemo', '使用场景', '性能优化']
    },
    {
        id: 34,
        type: 'single',
        question: 'useCallback主要解决什么问题？',
        options: [
            '减少函数执行次数',
            '防止子组件不必要的重新渲染',
            '提升函数执行性能',
            '缓存函数执行结果'
        ],
        answer: [1],
        explanation: {
            correct: 'useCallback主要用于传递给子组件的回调函数。每次渲染创建新函数会导致子组件（使用React.memo）重新渲染，因为props变化了。useCallback保持函数引用不变，避免不必要的渲染。',
            wrong: {
                0: 'useCallback不减少函数执行次数，只是缓存函数定义。函数该执行还是执行。',
                2: 'useCallback不提升函数本身的性能，而是通过避免子组件渲染来提升整体性能。',
                3: '缓存函数结果是useMemo的作用，useCallback缓存函数定义本身。'
            }
        },
        tags: ['useCallback', '性能优化', '子组件渲染']
    },
    {
        id: 35,
        type: 'single',
        question: '以下哪种useCallback的使用是正确的？',
        options: [
            'const handleClick = useCallback(() => { console.log(count); })',
            'const handleClick = useCallback(() => { console.log(count); }, [])',
            'const handleClick = useCallback(() => { console.log(count); }, [count])',
            '选项B和C都可以'
        ],
        answer: [2],
        explanation: {
            correct: '依赖数组必须包含回调中使用的所有外部变量。count在回调中使用，必须加入依赖数组。否则会产生闭包陷阱，总是打印初始的count值。',
            wrong: {
                0: '缺少依赖数组，回调在每次渲染都会重新创建，失去了useCallback的意义。',
                1: '空依赖数组会导致闭包陷阱，count永远是初始值。违反了exhaustive-deps规则。',
                3: '选项B有闭包陷阱问题，不正确。只有选项C是正确的。'
            }
        },
        tags: ['useCallback', '依赖数组', '闭包陷阱']
    },
    {
        id: 36,
        type: 'judge',
        question: 'useMemo可以用来跳过昂贵的副作用操作。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'useMemo只应该用于纯计算，不应该有副作用。副作用（API调用、订阅、DOM修改）应该放在useEffect中。useMemo的目的是缓存计算结果，React可能会在某些情况下丢弃缓存值，不保证一定执行。',
            wrong: {
                0: 'useMemo不应该用于副作用。副作用应该放在useEffect中。useMemo是为了优化纯计算，不保证一定执行或只执行一次。'
            }
        },
        tags: ['useMemo', '副作用', '最佳实践']
    },

    // useRef (37-41)
    {
        id: 37,
        type: 'multiple',
        question: 'useRef的主要用途包括哪些？（多选）',
        options: [
            '访问和操作DOM元素',
            '保存不触发重新渲染的可变值',
            '保存上一次渲染的值',
            '替代useState管理状态'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：最常见用途，通过ref访问DOM。选项B：保存定时器ID、订阅等不需要触发渲染的值。选项C：在effect中保存prev值，用于比较。',
            wrong: {
                3: 'useRef不能替代useState。ref变化不会触发重新渲染，不适合管理需要显示在UI上的状态。'
            }
        },
        tags: ['useRef', '用途', 'DOM', '可变值']
    },
    {
        id: 38,
        type: 'judge',
        question: '修改ref.current会触发组件重新渲染。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '修改ref.current不会触发重新渲染。这是useRef和useState的关键区别。useRef返回的对象在整个生命周期中保持不变，修改current属性是纯粹的mutation，不会被React追踪。',
            wrong: {
                0: 'ref的变化不会触发渲染。如果需要变化触发渲染，应该使用useState。ref用于不需要触发渲染的场景。'
            }
        },
        tags: ['useRef', '渲染机制', 'ref.current']
    },
    {
        id: 39,
        type: 'single',
        question: '在渲染期间可以读写ref.current吗？',
        options: [
            '可以随意读写',
            '不能在渲染期间读写，应该在effect或事件处理器中',
            '只能在useEffect中读写',
            '只能在事件处理器中读写'
        ],
        answer: [1],
        explanation: {
            correct: '渲染期间不应该读写ref.current（除非是初始化）。渲染应该是纯函数，依赖和修改ref会破坏这个原则，导致不可预测的行为。正确做法：在事件处理器或useEffect中读写ref。',
            wrong: {
                0: '渲染期间读写ref违反了React的纯函数原则，可能导致bug和不可预测的行为。',
                2: '不仅限于useEffect，事件处理器中也可以读写。关键是不在渲染期间读写。',
                3: '不仅限于事件处理器，useEffect中也可以。两者都是在渲染之外的时机。'
            }
        },
        tags: ['useRef', '渲染纯度', '最佳实践']
    },
    {
        id: 40,
        type: 'single',
        question: 'forwardRef的作用是什么？',
        options: [
            '向父组件传递props',
            '允许父组件访问子组件的DOM节点或值',
            '在组件间共享state',
            '优化组件性能'
        ],
        answer: [1],
        explanation: {
            correct: 'forwardRef允许组件将ref转发到内部的DOM节点或子组件。通常组件不能接收ref prop（它是特殊属性），forwardRef打破这个限制，让父组件能够访问子组件的DOM或通过useImperativeHandle暴露的方法。',
            wrong: {
                0: '传递props不需要forwardRef，直接传递即可。forwardRef专门用于转发ref。',
                2: '共享state使用props、Context或状态管理库，不用forwardRef。',
                3: 'forwardRef不是性能优化工具，而是访问DOM/子组件的机制。'
            }
        },
        tags: ['useRef', 'forwardRef', 'ref转发']
    },
    {
        id: 41,
        type: 'single',
        question: 'useImperativeHandle通常与什么一起使用？',
        options: [
            'useState',
            'useEffect',
            'forwardRef',
            'useMemo'
        ],
        answer: [2],
        explanation: {
            correct: 'useImperativeHandle与forwardRef配合使用，自定义暴露给父组件的ref值。不是暴露整个DOM节点，而是暴露特定的方法或属性。例如：只暴露focus和blur方法，隐藏其他DOM API。',
            wrong: {
                0: 'useState管理state，与useImperativeHandle无直接关系。',
                1: 'useEffect处理副作用，与useImperativeHandle无直接关系。',
                3: 'useMemo用于缓存值，与useImperativeHandle无直接关系。'
            }
        },
        tags: ['useRef', 'useImperativeHandle', 'forwardRef', 'ref']
    },

    // 自定义Hooks (42-46)
    {
        id: 42,
        type: 'judge',
        question: '自定义Hook必须以"use"开头命名。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '自定义Hook必须以"use"开头，这是React的约定。原因：1) 让React和开发者识别这是Hook；2) 让ESLint插件检查Hook规则；3) 保证Hook只在合适的地方调用。不以use开头的函数不被视为Hook，不会被检查规则。',
            wrong: {
                1: '必须以use开头。这不仅是约定，也是工具链（ESLint）识别Hook的依据。不遵守会导致规则检查失败。'
            }
        },
        tags: ['自定义Hooks', '命名规范', '约定']
    },
    {
        id: 43,
        type: 'multiple',
        question: '自定义Hook的优势包括哪些？（多选）',
        options: [
            '复用状态逻辑，避免代码重复',
            '使组件代码更简洁，关注点分离',
            '可以组合多个Hook创建更复杂的逻辑',
            '提升组件性能'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：核心优势，在组件间复用逻辑。选项B：提取逻辑让组件更关注UI。选项C：Hook可以组合，构建复杂功能。',
            wrong: {
                3: '自定义Hook主要是为了代码复用和组织，不直接提升性能。性能优化需要使用useMemo、useCallback等特定Hook。'
            }
        },
        tags: ['自定义Hooks', '优势', '代码复用']
    },
    {
        id: 44,
        type: 'single',
        question: '自定义Hook可以返回什么类型的值？',
        options: [
            '只能返回数组',
            '只能返回对象',
            '可以返回任何值：数组、对象、单个值、甚至不返回',
            '必须返回值，不能返回undefined'
        ],
        answer: [2],
        explanation: {
            correct: '自定义Hook可以返回任何类型。常见模式：1) 数组（类似useState）：[value, setValue]；2) 对象：{data, loading, error}；3) 单个值：const count = useCount()；4) 不返回（纯副作用）。选择取决于API设计。',
            wrong: {
                0: '不限于数组。对象、单值都可以，根据需要设计API。',
                1: '不限于对象。数组、单值都可以，根据使用习惯选择。',
                3: '可以不返回值，比如只处理副作用的Hook：useDocumentTitle()。'
            }
        },
        tags: ['自定义Hooks', '返回值', 'API设计']
    },
    {
        id: 45,
        type: 'single',
        question: '自定义Hook可以调用其他Hook吗？',
        options: [
            '不可以，每个Hook必须独立',
            '可以，这是Hook组合的核心',
            '只能调用内置Hook，不能调用其他自定义Hook',
            '只能调用useState和useEffect'
        ],
        answer: [1],
        explanation: {
            correct: '自定义Hook可以调用任何Hook（内置或自定义），这是Hook的强大之处。可以组合简单Hook构建复杂功能。例如：useUser可以调用useState、useEffect和另一个自定义Hook useAuth。Hook组合使得逻辑复用更灵活。',
            wrong: {
                0: 'Hook的设计就是为了组合。可以自由调用其他Hook。',
                2: '可以调用任何Hook，包括其他自定义Hook。这样可以构建Hook层次结构。',
                3: '可以调用任何Hook，不限于useState和useEffect。'
            }
        },
        tags: ['自定义Hooks', 'Hook组合', '最佳实践']
    },
    {
        id: 46,
        type: 'judge',
        question: '自定义Hook共享的是逻辑，不是状态。每次调用都会创建独立的state。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '自定义Hook复用的是逻辑（代码），不是状态。每次调用创建独立的state和effect。例如：两个组件都调用useCounter()，它们有各自独立的count，互不影响。如果需要共享状态，应该使用Context或状态管理库。',
            wrong: {
                1: '自定义Hook确实共享逻辑不共享状态。每次调用都是独立的，这是Hook的核心特性。'
            }
        },
        tags: ['自定义Hooks', '状态隔离', '逻辑复用']
    },

    // 高级Hooks (47-50)
    {
        id: 47,
        type: 'single',
        question: 'useLayoutEffect和useEffect的主要区别是什么？',
        options: [
            '完全相同，没有区别',
            'useLayoutEffect在DOM更新后、浏览器绘制前同步执行',
            'useLayoutEffect只能用于布局计算',
            'useLayoutEffect性能更好'
        ],
        answer: [1],
        explanation: {
            correct: 'useLayoutEffect在DOM更新后、浏览器绘制前同步执行，会阻塞浏览器绘制。用于需要同步读取DOM布局和立即修改DOM的场景，避免闪烁。useEffect是异步的，在绘制后执行，不阻塞页面。',
            wrong: {
                0: '执行时机不同：useLayoutEffect同步且在绘制前，useEffect异步且在绘制后。',
                2: '虽然常用于布局，但不限于此。任何需要同步执行的操作都可以用。',
                3: 'useLayoutEffect会阻塞渲染，通常性能较差。应该优先使用useEffect，只在必要时用useLayoutEffect。'
            }
        },
        tags: ['useLayoutEffect', 'useEffect', '执行时机', '区别']
    },
    {
        id: 48,
        type: 'multiple',
        question: '以下哪些场景应该使用useLayoutEffect？（多选）',
        options: [
            '测量DOM元素尺寸或位置',
            '需要在浏览器绘制前同步修改DOM，避免闪烁',
            '数据获取',
            '根据DOM滚动位置更新state'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：测量后立即使用结果布局。选项B：避免用户看到中间状态。选项D：基于DOM位置的同步更新。这些都需要在绘制前同步执行。',
            wrong: {
                2: '数据获取是异步操作，应该用useEffect。useLayoutEffect会阻塞渲染，影响性能。'
            }
        },
        tags: ['useLayoutEffect', '使用场景', 'DOM操作']
    },
    {
        id: 49,
        type: 'single',
        question: 'useDebugValue的作用是什么？',
        options: [
            '在生产环境中打印调试信息',
            '在React DevTools中显示自定义Hook的标签',
            '暂停代码执行进行调试',
            '自动记录Hook的调用历史'
        ],
        answer: [1],
        explanation: {
            correct: 'useDebugValue用于在React DevTools中为自定义Hook添加标签，方便调试。只在开发环境有效，不影响生产性能。例如：useDebugValue(isOnline ? "Online" : "Offline")会在DevTools中显示状态。',
            wrong: {
                0: 'useDebugValue只在DevTools中显示，不打印到控制台，且生产环境不起作用。',
                2: '不能暂停执行，只是显示信息。调试断点应该用浏览器DevTools。',
                3: '不会自动记录历史，只显示当前值。'
            }
        },
        tags: ['useDebugValue', '调试', 'DevTools']
    },
    {
        id: 50,
        type: 'judge',
        question: 'Hooks只能在函数组件中使用，不能在类组件中使用。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'Hooks只能在函数组件和自定义Hook中使用，不能在类组件、普通JavaScript函数或条件语句中使用。这是Hook的基本规则。类组件应该使用传统的state和生命周期方法。',
            wrong: {
                1: 'Hooks确实只能在函数组件中使用。这是设计决定，类组件有自己的API（this.state、生命周期方法）。'
            }
        },
        tags: ['Hooks', '使用规则', '函数组件', '类组件']
    }
];

