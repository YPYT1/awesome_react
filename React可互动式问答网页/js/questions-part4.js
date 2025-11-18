// Part 4: 并发特性与性能优化 - 题库
const questionsPart4 = [
    // 并发渲染基础 (1-10)
    {
        id: 1,
        type: 'single',
        question: 'React并发渲染的核心概念是什么？',
        options: [
            '多线程渲染',
            '可中断的渲染，能够暂停和恢复',
            '更快的渲染速度',
            '并行执行多个组件'
        ],
        answer: [1],
        explanation: {
            correct: '并发渲染的核心是可中断性。React可以开始渲染、暂停处理更紧急的更新、然后恢复之前的渲染。这不是多线程（JavaScript是单线程），而是通过时间切片实现的优先级调度。',
            wrong: {
                0: 'JavaScript是单线程的，React并发不使用多线程，而是通过时间切片和优先级调度。',
                2: '并发渲染不一定更快，但能保持UI响应性，优先处理紧急更新。',
                3: '不是并行执行，而是通过暂停和恢复实现多个更新的协调。'
            }
        },
        tags: ['并发渲染', '可中断渲染', 'React原理', '基础概念']
    },
    {
        id: 2,
        type: 'judge',
        question: 'Suspense只能用于数据获取，不能用于代码分割。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'Suspense可以用于多种场景：1) 代码分割（React.lazy）；2) 数据获取（use Hook、库如React Query）；3) 图片加载等。Suspense是通用的异步资源加载机制。',
            wrong: {
                0: 'Suspense最初就是为React.lazy（代码分割）引入的，现在扩展到数据获取等场景。'
            }
        },
        tags: ['Suspense', '代码分割', '数据获取', '用途']
    },
    {
        id: 3,
        type: 'single',
        question: 'Suspense的fallback何时显示？',
        options: [
            '立即显示',
            '等待一小段时间后显示，避免闪烁',
            '永远不显示',
            '只在错误时显示'
        ],
        answer: [1],
        explanation: {
            correct: 'React会等待一小段时间（通常几百毫秒）才显示fallback，避免快速加载时的闪烁。如果内容很快加载完成，用户不会看到loading状态。这是React的智能优化。',
            wrong: {
                0: '不会立即显示，有延迟以避免闪烁。',
                2: '会显示，但有智能延迟。',
                3: '错误由Error Boundary处理，fallback是loading状态。'
            }
        },
        tags: ['Suspense', 'fallback', '加载状态', '优化']
    },
    {
        id: 4,
        type: 'multiple',
        question: '并发特性包括哪些？（多选）',
        options: [
            'useTransition',
            'useDeferredValue',
            'Suspense',
            'useMemo'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A、B、C都是并发特性。useTransition标记低优先级更新，useDeferredValue创建延迟值，Suspense处理异步加载。它们共同实现了可中断的并发渲染。',
            wrong: {
                3: 'useMemo是性能优化工具，但不是并发特性，不涉及可中断渲染。'
            }
        },
        tags: ['并发特性', 'useTransition', 'useDeferredValue', 'Suspense']
    },
    {
        id: 5,
        type: 'single',
        question: 'Suspense可以嵌套吗？',
        options: [
            '不可以',
            '可以，内层Suspense先触发',
            '可以但不推荐',
            '只能嵌套两层'
        ],
        answer: [1],
        explanation: {
            correct: 'Suspense可以嵌套，这是推荐的模式。内层Suspense处理局部loading（如单个组件），外层处理整体loading。用户看到逐步加载的内容，体验更好。这叫做"渐进式加载"。',
            wrong: {
                0: '完全可以嵌套，且是常见模式。',
                2: '嵌套是推荐的最佳实践，不是不推荐。',
                3: '可以嵌套任意多层，根据需要设计。'
            }
        },
        tags: ['Suspense', '嵌套', '渐进式加载', '最佳实践']
    },
    {
        id: 6,
        type: 'judge',
        question: '并发渲染会导致组件多次渲染同一个状态。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '并发模式下，React可能多次渲染同一个state（开始渲染→被打断→丢弃结果→重新开始）。因此组件必须是纯函数，渲染不应有副作用。严格模式会故意双重调用来帮助发现问题。',
            wrong: {
                1: '确实可能多次渲染。这要求组件保持纯净，不依赖渲染次数。'
            }
        },
        tags: ['并发渲染', '纯函数', '多次渲染', '副作用']
    },
    {
        id: 7,
        type: 'single',
        question: 'React.lazy用于什么？',
        options: [
            '延迟state更新',
            '动态导入组件，实现代码分割',
            '延迟effect执行',
            '优化memo'
        ],
        answer: [1],
        explanation: {
            correct: 'React.lazy用于动态导入组件，实现代码分割：const Component = lazy(() => import("./Component"))。配合Suspense使用，组件代码会按需加载，减小初始bundle。',
            wrong: {
                0: 'lazy用于组件导入，不是state更新。',
                2: 'lazy用于组件导入，不涉及effect。',
                3: 'lazy用于代码分割，不是memo优化。'
            }
        },
        tags: ['React.lazy', '代码分割', '动态导入', '性能优化']
    },
    {
        id: 8,
        type: 'single',
        question: 'React.lazy导入的组件必须是什么类型的导出？',
        options: [
            '命名导出',
            '默认导出',
            '两者都可以',
            'namespace导出'
        ],
        answer: [1],
        explanation: {
            correct: 'React.lazy要求默认导出：export default Component。如果组件是命名导出，需要创建中间模块重新导出为default，或使用动态import后手动提取。',
            wrong: {
                0: '必须是默认导出，命名导出需要额外处理。',
                2: '只能是默认导出，这是React.lazy的限制。',
                3: 'namespace导出不支持，必须是默认导出。'
            }
        },
        tags: ['React.lazy', '默认导出', '代码分割', '限制']
    },
    {
        id: 9,
        type: 'multiple',
        question: '使用Suspense的注意事项包括哪些？（多选）',
        options: [
            '必须配合Error Boundary处理错误',
            'fallback应该是轻量的组件',
            '可以在Suspense内部使用useEffect',
            '服务端渲染需要特殊处理'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：加载失败需要Error Boundary捕获。选项B：fallback会频繁显示，应该轻量。选项D：SSR需要特殊配置（如streaming SSR）。',
            wrong: {
                2: 'Suspense边界内的组件可以正常使用useEffect，没有特殊限制。'
            }
        },
        tags: ['Suspense', '注意事项', '最佳实践', 'Error Boundary']
    },
    {
        id: 10,
        type: 'judge',
        question: 'startTransition中的更新永远不会显示loading状态。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'startTransition中的更新可以触发Suspense的loading状态。useTransition的isPending可以用来显示自定义的loading UI。长时间的transition会显示Suspense fallback。',
            wrong: {
                0: 'transition可以触发loading状态，特别是涉及异步操作或Suspense时。'
            }
        },
        tags: ['startTransition', 'Suspense', 'loading状态', 'isPending']
    },

    // 性能优化基础 (11-20)
    {
        id: 11,
        type: 'single',
        question: 'React的渲染包括哪两个主要阶段？',
        options: [
            '编译和执行',
            '渲染和提交',
            '挂载和更新',
            '创建和销毁'
        ],
        answer: [1],
        explanation: {
            correct: '渲染阶段：调用组件函数，计算虚拟DOM，决定需要什么变化。提交阶段：将变化应用到实际DOM。理解这两个阶段对优化很重要。渲染阶段可能被中断（并发模式），提交阶段是同步的。',
            wrong: {
                0: '编译是构建时的，不是运行时的渲染过程。',
                2: '挂载和更新是组件生命周期，不是渲染的两个阶段。',
                3: '创建和销毁也是生命周期概念，不是渲染阶段划分。'
            }
        },
        tags: ['渲染机制', '渲染阶段', '提交阶段', 'React原理']
    },
    {
        id: 12,
        type: 'judge',
        question: '重新渲染一定会导致DOM更新。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '重新渲染不一定导致DOM更新。React在渲染阶段计算虚拟DOM，然后diff对比。如果虚拟DOM相同，跳过提交阶段，不更新DOM。这是React的重要优化。',
            wrong: {
                0: '渲染和DOM更新是分开的。React只在必要时更新DOM。'
            }
        },
        tags: ['渲染机制', 'DOM更新', 'diff算法', '优化']
    },
    {
        id: 13,
        type: 'multiple',
        question: '触发组件重新渲染的因素包括哪些？（多选）',
        options: [
            'state变化',
            'props变化',
            '父组件重新渲染',
            'ref变化'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：setState触发重新渲染。选项B：props改变触发渲染。选项C：默认情况下，父组件渲染会导致所有子组件渲染（可用React.memo优化）。',
            wrong: {
                3: 'ref变化不触发重新渲染，这是ref的特点。'
            }
        },
        tags: ['渲染触发', 'state', 'props', '重新渲染']
    },
    {
        id: 14,
        type: 'single',
        question: 'React.memo的作用是什么？',
        options: [
            '缓存组件的state',
            '阻止组件在props未变化时重新渲染',
            '缓存计算结果',
            '优化事件处理器'
        ],
        answer: [1],
        explanation: {
            correct: 'React.memo是高阶组件，对props进行浅比较。如果props相同，跳过渲染，复用上次结果。用于优化纯展示组件，避免父组件渲染导致的不必要重新渲染。',
            wrong: {
                0: 'React.memo比较props，不涉及state。',
                2: '缓存计算结果用useMemo，不是React.memo。',
                3: '优化事件处理器用useCallback，不是React.memo。'
            }
        },
        tags: ['React.memo', '性能优化', 'props比较', '避免重渲染']
    },
    {
        id: 15,
        type: 'single',
        question: 'React.memo使用什么比较方法？',
        options: [
            '深比较',
            '浅比较（===）',
            '引用比较',
            '可配置的自定义比较'
        ],
        answer: [3],
        explanation: {
            correct: '默认使用浅比较（类似Object.is）。可以传入第二个参数，自定义比较函数：React.memo(Component, (prevProps, nextProps) => {...})。返回true表示相等（不渲染），false表示不等（渲染）。',
            wrong: {
                0: '默认不是深比较，但可以自定义实现深比较。',
                1: '虽然默认是浅比较，但不完全准确，因为可以自定义。',
                2: '不仅是引用比较，浅比较会比较对象的每个属性的引用。'
            }
        },
        tags: ['React.memo', '比较方法', '自定义比较', '浅比较']
    },
    {
        id: 16,
        type: 'judge',
        question: '应该为所有组件使用React.memo以提升性能。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '不应该过度使用React.memo。它有成本（比较props、额外内存）。只在以下情况使用：1) 组件渲染成本高；2) 经常以相同props重新渲染；3) 是纯展示组件。过度使用会降低代码可读性。',
            wrong: {
                0: '过度使用React.memo会增加内存和比较开销，可能适得其反。应该有针对性地优化。'
            }
        },
        tags: ['React.memo', '过度优化', '最佳实践', '性能']
    },
    {
        id: 17,
        type: 'single',
        question: 'key的主要作用是什么？',
        options: [
            '作为组件的唯一标识',
            '帮助React识别哪些元素变化了',
            '提升渲染速度',
            '防止组件重新渲染'
        ],
        answer: [1],
        explanation: {
            correct: 'key帮助React识别列表中的元素：哪些添加、删除、移动了。正确的key让React能够复用DOM和state，避免不必要的重新创建。key应该是稳定、唯一的（如ID），不应该用索引（列表变化时会有问题）。',
            wrong: {
                0: 'key是元素标识，但主要目的是帮助diff算法。',
                2: 'key的目的是正确性，不是速度。正确的key有时会更快，但主要是避免bug。',
                3: 'key不阻止渲染，而是帮助React正确地更新和复用元素。'
            }
        },
        tags: ['key', '列表渲染', 'diff算法', '最佳实践']
    },
    {
        id: 18,
        type: 'multiple',
        question: '错误的key使用方式包括哪些？（多选）',
        options: [
            '使用数组索引作为key',
            '使用随机数作为key',
            '使用Math.random()作为key',
            '使用稳定的ID作为key'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：索引在列表变化时会导致错误（元素顺序改变、插入删除）。选项B、C：随机数每次渲染都变，破坏了复用，且会丢失state。',
            wrong: {
                3: '稳定的ID（如数据库ID、UUID）是正确的key，这是最佳实践。'
            }
        },
        tags: ['key', '常见错误', '列表渲染', '最佳实践']
    },
    {
        id: 19,
        type: 'single',
        question: 'Fragment的key属性在什么场景下有用？',
        options: [
            'Fragment不能有key',
            '在map函数中返回多个元素时',
            '所有Fragment都应该有key',
            'key对Fragment无效'
        ],
        answer: [1],
        explanation: {
            correct: 'Fragment可以有key属性，用于列表渲染：items.map(item => <Fragment key={item.id}>...</Fragment>)。当需要在列表中返回多个元素但不想添加额外DOM节点时使用。注意：短语法<>不支持key，必须用<Fragment>。',
            wrong: {
                0: 'Fragment可以有key，特别是在列表中。',
                2: '只在列表渲染时需要key，其他情况不需要。',
                3: 'key对Fragment有效且重要。'
            }
        },
        tags: ['Fragment', 'key', '列表渲染', '最佳实践']
    },
    {
        id: 20,
        type: 'judge',
        question: '组件的位置改变会导致state重置。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '组件在树中的位置改变（不是同一个父组件中移动，而是从一个父组件移到另一个），state会重置。React根据组件类型和位置识别组件实例。位置变化意味着旧实例卸载、新实例挂载。使用key可以强制重置或保持state。',
            wrong: {
                1: '位置改变确实会重置state。如果需要保持state，应该提升state或使用key。'
            }
        },
        tags: ['state重置', '组件位置', 'React机制', 'key']
    },

    // 高级性能优化 (21-30)
    {
        id: 21,
        type: 'single',
        question: '什么是"状态下沉"（State Colocation）？',
        options: [
            '将state提升到父组件',
            '将state放在尽可能靠近使用它的地方',
            '将state存储在Redux中',
            '使用Context共享state'
        ],
        answer: [1],
        explanation: {
            correct: '状态下沉是将state放在尽可能低、尽可能接近使用它的组件中。好处：1) 减少不必要的重新渲染（state变化只影响小范围）；2) 代码更易理解；3) 组件更容易复用。只在需要共享时才提升state。',
            wrong: {
                0: '这是状态提升（lifting state up），与状态下沉相反。',
                2: '存储在Redux是状态外部化，不是状态下沉。',
                3: 'Context是共享state，状态下沉是尽量不共享、局部化。'
            }
        },
        tags: ['状态下沉', '性能优化', '最佳实践', 'state管理']
    },
    {
        id: 22,
        type: 'multiple',
        question: '避免在渲染期间进行的操作包括哪些？（多选）',
        options: [
            '修改外部变量',
            '发起网络请求',
            '操作DOM',
            '调用纯函数'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A、B、C都是副作用，应该在effect或事件处理器中进行。渲染必须是纯函数，并发模式下可能多次执行、被打断。副作用在渲染期间会导致不可预测的行为。',
            wrong: {
                3: '调用纯函数是安全的，渲染期间可以进行纯计算。'
            }
        },
        tags: ['渲染纯度', '副作用', '最佳实践', '并发渲染']
    },
    {
        id: 23,
        type: 'single',
        question: '虚拟滚动（Virtual Scrolling）的核心思想是什么？',
        options: [
            '只渲染可见区域的元素',
            '预先渲染所有元素',
            '使用CSS实现滚动',
            '缓存滚动位置'
        ],
        answer: [0],
        explanation: {
            correct: '虚拟滚动只渲染可见区域（视口）内的元素，加上少量缓冲区。滚动时动态添加/移除元素。这让大列表（成千上万项）保持高性能。常用库：react-window、react-virtualized。',
            wrong: {
                1: '预渲染所有元素正是虚拟滚动要避免的，这会导致性能问题。',
                2: 'CSS滚动是标准方式，虚拟滚动是优化大列表的技术。',
                3: '缓存滚动位置是一个功能，但不是核心思想。'
            }
        },
        tags: ['虚拟滚动', '性能优化', '大列表', 'react-window']
    },
    {
        id: 24,
        type: 'judge',
        question: '内联函数（如onClick={() => ...}）总是会导致性能问题。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '内联函数不总是性能问题。现代JavaScript引擎很快，创建函数的成本很低。只在以下情况需要优化：1) 传递给使用React.memo的子组件；2) 作为其他Hook的依赖；3) 有明显的性能问题。否则，内联函数更简洁，过早优化会降低可读性。',
            wrong: {
                0: '内联函数在大多数情况下不是问题。不要过早优化，先写清晰的代码。'
            }
        },
        tags: ['内联函数', '性能优化', '过早优化', '最佳实践']
    },
    {
        id: 25,
        type: 'single',
        question: '什么时候应该拆分组件？',
        options: [
            '组件超过100行',
            '有state变化且只影响部分UI',
            '所有情况都应该拆分',
            '永远不应该拆分'
        ],
        answer: [1],
        explanation: {
            correct: '当state变化只影响部分UI时，将该部分拆分成独立组件。state在子组件中，变化只触发子组件渲染，父组件和兄弟组件不受影响。这是性能优化的关键技巧。其他拆分原因：复用、可读性、单一职责。',
            wrong: {
                0: '行数不是拆分的主要依据，应该看职责和性能影响。',
                2: '不是所有情况都需要拆分，应该根据需求和性能考虑。',
                3: '合理拆分是必要的，提升可维护性和性能。'
            }
        },
        tags: ['组件拆分', '性能优化', '最佳实践', 'state管理']
    },
    {
        id: 26,
        type: 'multiple',
        question: 'Context性能优化的方法包括哪些？（多选）',
        options: [
            '拆分Context，将频繁变化和不常变化的值分开',
            '使用useMemo包装Provider的value',
            '将不需要Context的组件用React.memo包装',
            '使用多个嵌套的Provider'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：减少不必要的订阅。选项B：避免value对象变化导致的渲染。选项C：阻止不使用Context的子组件渲染。这些都是有效的Context优化策略。',
            wrong: {
                3: '嵌套Provider不是优化手段，拆分Context才是。多层嵌套可能增加复杂度。'
            }
        },
        tags: ['Context', '性能优化', '最佳实践', 'useMemo']
    },
    {
        id: 27,
        type: 'single',
        question: '代码分割的最佳粒度是什么？',
        options: [
            '每个组件都分割',
            '按路由分割',
            '完全不分割',
            '只分割大文件'
        ],
        answer: [1],
        explanation: {
            correct: '按路由分割是最常见且有效的策略。每个路由是自然的分割点，用户导航时才加载对应代码。也可以在路由内进一步分割（如模态框、选项卡）。平衡：过度分割增加请求数，分割不足初始bundle过大。',
            wrong: {
                0: '每个组件都分割会导致过多请求，反而降低性能。',
                2: '现代应用通常需要代码分割，否则初始bundle过大。',
                3: '不仅看文件大小，更重要的是使用频率和时机。'
            }
        },
        tags: ['代码分割', '最佳实践', '路由', '性能优化']
    },
    {
        id: 28,
        type: 'judge',
        question: 'Profiler API可以在生产环境中使用来分析性能。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'Profiler API可以在生产环境使用，但会有轻微的性能开销。用法：<Profiler id="..." onRender={callback}>。回调接收渲染时间等信息。适合收集真实用户的性能数据。但不应该一直开启，只在需要时使用。',
            wrong: {
                1: 'Profiler确实可以在生产环境使用，这是设计的一部分。'
            }
        },
        tags: ['Profiler', '性能分析', '生产环境', 'API']
    },
    {
        id: 29,
        type: 'single',
        question: '什么是"过度渲染"（Over-rendering）？',
        options: [
            '渲染次数过多',
            '组件不必要地重新渲染，但输出相同',
            '渲染速度太快',
            'DOM更新过多'
        ],
        answer: [1],
        explanation: {
            correct: '过度渲染是指组件重新渲染但输出的虚拟DOM相同，这是浪费的计算。原因：props/state形式上变化但实质相同（如每次创建新对象）。解决：React.memo、useMemo、useCallback、优化数据结构。',
            wrong: {
                0: '次数多不一定是问题，关键是是否必要。',
                2: '渲染速度快是好事，不是问题。',
                3: '过度渲染不一定导致DOM更新，React的diff会跳过相同的输出。'
            }
        },
        tags: ['过度渲染', '性能问题', '优化', 'React.memo']
    },
    {
        id: 30,
        type: 'multiple',
        question: '检测性能问题的工具包括哪些？（多选）',
        options: [
            'React DevTools Profiler',
            'Chrome DevTools Performance',
            'console.log',
            'React的Profiler组件'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：React专用，查看组件渲染时间、次数。选项B：浏览器工具，查看整体性能、帧率。选项D：代码中插入，收集渲染数据。这些都是专业的性能分析工具。',
            wrong: {
                2: 'console.log可以辅助调试，但不是专业的性能分析工具，且会影响性能。'
            }
        },
        tags: ['性能分析', '工具', 'DevTools', 'Profiler']
    },

    // 渲染优化技巧 (31-40)
    {
        id: 31,
        type: 'single',
        question: '什么是"bail out"（跳过渲染）？',
        options: [
            'React强制刷新组件',
            'React跳过组件及其子树的渲染',
            'React只渲染子组件',
            'React延迟渲染'
        ],
        answer: [1],
        explanation: {
            correct: 'Bail out是React的优化：当组件的props和state都没变（浅比较），React跳过该组件及其整个子树的渲染。触发条件：setState相同值、memo返回true、Context值未变。这是React自动的优化，无需手动处理。',
            wrong: {
                0: 'bail out是跳过渲染，不是强制刷新。',
                2: 'bail out会跳过整个子树，不只是父组件。',
                3: '不是延迟，而是完全跳过。'
            }
        },
        tags: ['bail out', '跳过渲染', 'React优化', '渲染机制']
    },
    {
        id: 32,
        type: 'judge',
        question: '使用对象或数组作为useState的初始值时，每次渲染都应该创建新的对象/数组。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '不应该在每次渲染时创建新对象/数组。如果初始值是常量，应该在组件外定义。如果需要计算，使用惰性初始化：useState(() => computeInitial())。每次创建新对象是浪费，虽然只在首次渲染使用，但仍会执行。',
            wrong: {
                0: '应该避免重复创建。在组件外定义常量，或使用惰性初始化。'
            }
        },
        tags: ['useState', '初始值', '性能优化', '最佳实践']
    },
    {
        id: 33,
        type: 'single',
        question: 'children作为props的性能优势是什么？',
        options: [
            '没有性能优势',
            'children不会因为父组件state变化而重新渲染',
            'children渲染更快',
            'children占用更少内存'
        ],
        answer: [1],
        explanation: {
            correct: 'children是在父组件的父级创建的，父组件state变化不会影响children的渲染。这是"组件组合"模式的优势，可以避免不必要的渲染。例如：<Layout><ExpensiveComponent /></Layout>，ExpensiveComponent不会因Layout的state变化渲染。',
            wrong: {
                0: '有明显的性能优势，这是重要的优化技巧。',
                2: '渲染速度相同，优势在于减少渲染次数。',
                3: '内存占用相同，优势在于渲染频率。'
            }
        },
        tags: ['children', '组件组合', '性能优化', '最佳实践']
    },
    {
        id: 34,
        type: 'multiple',
        question: '以下哪些会导致组件重新创建（unmount + mount）？（多选）',
        options: [
            'key改变',
            '组件类型改变',
            'state改变',
            '条件渲染切换不同组件'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：key变化，React认为是新元素。选项B：<div>变成<span>，重新创建。选项D：条件切换不同组件类型，旧的卸载新的挂载。',
            wrong: {
                2: 'state改变只触发重新渲染，不会unmount和remount。'
            }
        },
        tags: ['重新创建', 'key', '组件类型', '渲染机制']
    },
    {
        id: 35,
        type: 'single',
        question: '什么是"props drilling"？',
        options: [
            'props的类型检查',
            '通过多层组件传递props',
            'props的性能优化',
            'props的默认值'
        ],
        answer: [1],
        explanation: {
            correct: 'Props drilling是指通过多层中间组件传递props，这些中间组件本身不使用这些props。问题：代码冗余、难维护。解决方案：Context、组件组合、状态管理库。',
            wrong: {
                0: 'drilling不是类型检查，而是传递层次过深的问题。',
                2: '不是优化技术，而是需要解决的问题。',
                3: '不涉及默认值，而是传递路径的问题。'
            }
        },
        tags: ['props drilling', 'Context', '代码问题', '最佳实践']
    },
    {
        id: 36,
        type: 'judge',
        question: '频繁的小更新比一次大更新性能更好。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '通常不是。每次更新都有开销（协调、diff、提交）。React 18的自动批处理会合并多个state更新为一次渲染。如果需要手动批处理，React 18之前可以用unstable_batchedUpdates。一般应该让React自动处理。',
            wrong: {
                0: '一次大更新通常比多次小更新更高效，因为减少了渲染次数。React 18会自动批处理。'
            }
        },
        tags: ['批处理', '性能优化', 'React 18', '更新策略']
    },
    {
        id: 37,
        type: 'single',
        question: 'windowing技术的替代方案包括什么？',
        options: [
            '没有替代方案',
            '分页加载',
            '无限滚动 + 虚拟化',
            '选项B和C'
        ],
        answer: [3],
        explanation: {
            correct: '大列表的处理方案：1) 虚拟滚动（windowing）：只渲染可见项；2) 分页：一次加载一页；3) 无限滚动：逐步加载更多；4) 混合方案：无限滚动 + 虚拟化。选择取决于用户体验需求和数据量。',
            wrong: {
                0: '有多种替代方案，根据场景选择。',
                1: '分页是一种方案，但不是唯一的。',
                2: '无限滚动是一种方案，但不是唯一的。'
            }
        },
        tags: ['大列表', '虚拟滚动', '分页', '无限滚动']
    },
    {
        id: 38,
        type: 'single',
        question: '什么是"时间切片"（Time Slicing）？',
        options: [
            '定时器的使用',
            '将长任务分割成小块，留出时间响应用户输入',
            '动画的帧率控制',
            '网络请求的优化'
        ],
        answer: [1],
        explanation: {
            correct: '时间切片是React并发渲染的核心技术。将长时间的渲染任务分割成多个小任务，在每个任务间检查是否有更高优先级的工作（如用户输入）。这保持UI的响应性，避免长时间阻塞。',
            wrong: {
                0: '不是定时器，而是并发渲染的调度机制。',
                2: '不是动画相关，而是渲染任务的调度。',
                3: '不是网络优化，而是渲染优化。'
            }
        },
        tags: ['时间切片', '并发渲染', 'React原理', '性能']
    },
    {
        id: 39,
        type: 'multiple',
        question: '优化首次渲染速度的方法包括哪些？（多选）',
        options: [
            '代码分割，按需加载',
            '服务端渲染（SSR）',
            '使用React.memo',
            '优化bundle大小（tree shaking、压缩）'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：减少初始JavaScript。选项B：服务端预渲染HTML，用户更快看到内容。选项D：更小的bundle下载更快。这些都直接影响首次加载速度。',
            wrong: {
                2: 'React.memo优化重新渲染，对首次渲染无效（首次渲染必须执行）。'
            }
        },
        tags: ['首次渲染', '性能优化', 'SSR', '代码分割']
    },
    {
        id: 40,
        type: 'judge',
        question: 'useCallback和useMemo的依赖数组应该尽可能少，以提升性能。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '依赖数组应该包含所有使用的外部变量，不能为了性能而遗漏。遗漏依赖会导致闭包陷阱和bug，比性能问题严重得多。正确做法：完整依赖 + 优化依赖项本身（如使用useRef、拆分函数等）。',
            wrong: {
                0: '不应该为了少而遗漏依赖。应该保证正确性，然后优化依赖项本身。'
            }
        },
        tags: ['useCallback', 'useMemo', '依赖数组', '最佳实践']
    },

    // 性能监控与调试 (41-50)
    {
        id: 41,
        type: 'single',
        question: 'React DevTools的Profiler标签可以查看什么信息？',
        options: [
            '只能查看组件树',
            '组件渲染次数、时间、原因',
            '只能查看props和state',
            '网络请求'
        ],
        answer: [1],
        explanation: {
            correct: 'Profiler标签用于性能分析：1) 每个组件的渲染时间；2) 渲染次数；3) 为什么渲染（props变化、state变化、父组件渲染）；4) 火焰图和排名图。这是分析React性能问题的主要工具。',
            wrong: {
                0: 'Profiler不仅显示树，还有详细的性能数据。',
                2: '查看props和state用Components标签，Profiler关注性能。',
                3: '网络请求用Chrome DevTools的Network标签。'
            }
        },
        tags: ['React DevTools', 'Profiler', '性能分析', '调试工具']
    },
    {
        id: 42,
        type: 'multiple',
        question: '使用Profiler记录性能时，应该注意什么？（多选）',
        options: [
            '在生产模式下测试（开发模式更慢）',
            '多次测量取平均值',
            '测试真实的用户场景',
            '只关注渲染最慢的组件'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：开发模式有额外检查，不反映生产性能。选项B：单次测量可能有偏差。选项C：测试实际使用场景才有意义。',
            wrong: {
                3: '不应只关注最慢的，应该看整体和频繁渲染的组件。有时频繁的小渲染比偶尔的大渲染影响更大。'
            }
        },
        tags: ['性能测试', 'Profiler', '最佳实践', '调试']
    },
    {
        id: 43,
        type: 'single',
        question: 'why-did-you-render库的作用是什么？',
        options: [
            '自动优化组件',
            '检测不必要的重新渲染',
            '提升渲染速度',
            '压缩代码'
        ],
        answer: [1],
        explanation: {
            correct: 'why-did-you-render是第三方库，在开发时检测不必要的重新渲染。它会在控制台输出：组件为什么渲染、props/state是否真的变化（浅比较相同但引用不同）。帮助发现过度渲染问题。',
            wrong: {
                0: '不会自动优化，只是检测和提醒，优化需要开发者手动做。',
                2: '不提升速度，只是帮助发现问题。',
                3: '不是构建工具，是开发调试工具。'
            }
        },
        tags: ['why-did-you-render', '性能调试', '第三方库', '过度渲染']
    },
    {
        id: 44,
        type: 'judge',
        question: 'React.StrictMode会影响生产环境的性能。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'StrictMode只在开发环境生效，生产环境完全没有影响。开发时，StrictMode会双重调用某些函数（组件、初始化函数）来检测副作用，但不影响生产构建。',
            wrong: {
                0: 'StrictMode只在开发环境有效，不影响生产性能。'
            }
        },
        tags: ['StrictMode', '性能', '开发模式', '生产环境']
    },
    {
        id: 45,
        type: 'single',
        question: 'React的Concurrent Mode Profiler可以查看什么？',
        options: [
            '只能查看同步渲染',
            '可以查看transition、Suspense等并发特性的行为',
            '只能查看错误',
            '不存在这个工具'
        ],
        answer: [1],
        explanation: {
            correct: 'React DevTools的Profiler支持并发特性分析：1) transition的持续时间；2) Suspense的挂起时间；3) 哪些更新被打断；4) 优先级调度的可视化。这帮助理解和优化并发渲染。',
            wrong: {
                0: '专门支持并发渲染的分析，不限于同步渲染。',
                2: '不是查看错误，而是性能分析。',
                3: '确实存在，是React DevTools的一部分。'
            }
        },
        tags: ['Profiler', '并发模式', '性能分析', 'DevTools']
    },
    {
        id: 46,
        type: 'single',
        question: 'Performance API的User Timing可以用来测量什么？',
        options: [
            '只能测量网络请求',
            '可以标记和测量自定义代码段的执行时间',
            '只能测量React组件',
            '自动测量所有性能'
        ],
        answer: [1],
        explanation: {
            correct: 'User Timing API允许自定义性能标记：performance.mark("start"); doWork(); performance.mark("end"); performance.measure("work", "start", "end")。可以测量任何代码段，结合Chrome DevTools查看。React内部也使用它。',
            wrong: {
                0: '不限于网络，可以测量任何代码。',
                2: '不限于React，可以测量任何JavaScript代码。',
                3: '不是自动的，需要手动添加标记。'
            }
        },
        tags: ['Performance API', 'User Timing', '性能测量', '工具']
    },
    {
        id: 47,
        type: 'multiple',
        question: '识别性能瓶颈的方法包括哪些？（多选）',
        options: [
            '使用React DevTools Profiler找出渲染慢的组件',
            '使用Chrome DevTools Performance找出长任务',
            '使用console.time测量代码段',
            '猜测哪里慢'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：React层面的性能分析。选项B：浏览器层面的性能分析。选项C：精确测量特定代码段。这些都是科学的性能分析方法。',
            wrong: {
                3: '不应该猜测，应该用工具测量。过早优化和错误优化都是浪费时间。'
            }
        },
        tags: ['性能分析', '瓶颈识别', '工具', '方法论']
    },
    {
        id: 48,
        type: 'judge',
        question: '所有性能问题都应该优先优化。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '不是所有性能问题都值得优化。应该考虑：1) 影响范围（关键路径 vs 边缘功能）；2) 频率（每次加载 vs 偶尔触发）；3) 用户感知（是否真的影响体验）；4) 优化成本（时间、复杂度）。优先优化高影响、高频率的问题。',
            wrong: {
                0: '应该优先级排序，优化投入产出比高的问题。有些微小问题的优化成本可能大于收益。'
            }
        },
        tags: ['性能优化', '优先级', '最佳实践', '投入产出比']
    },
    {
        id: 49,
        type: 'single',
        question: 'Lighthouse的Performance评分主要衡量什么？',
        options: [
            '只衡量React性能',
            '衡量整体加载性能和用户体验指标',
            '只衡量网络速度',
            '只衡量JavaScript执行时间'
        ],
        answer: [1],
        explanation: {
            correct: 'Lighthouse评估整体Web性能：1) FCP（首次内容绘制）；2) LCP（最大内容绘制）；3) TTI（可交互时间）；4) TBT（总阻塞时间）；5) CLS（累积布局偏移）。不限于React，是全面的性能评估。',
            wrong: {
                0: '不限于React，评估整个网页。',
                2: '不只网络，还包括渲染、交互等多个方面。',
                3: '不只JavaScript，还包括网络、渲染、布局等。'
            }
        },
        tags: ['Lighthouse', '性能评分', 'Web Vitals', '工具']
    },
    {
        id: 50,
        type: 'multiple',
        question: '性能优化的一般流程包括哪些步骤？（多选）',
        options: [
            '测量和识别瓶颈',
            '优化瓶颈',
            '再次测量验证效果',
            '重写整个应用'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '正确的流程：1) 测量找出真正的瓶颈；2) 针对性优化；3) 测量验证优化效果；4) 必要时重复。这是科学的优化方法，避免盲目优化和过早优化。',
            wrong: {
                3: '极少需要重写整个应用。应该针对性优化，重写成本太高且风险大。'
            }
        },
        tags: ['性能优化', '流程', '方法论', '最佳实践']
    }
];

