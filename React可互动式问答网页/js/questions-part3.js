// Part 3: React19核心新特性 - 题库
const questionsPart3 = [
    // Server Components (1-12)
    {
        id: 1,
        type: 'single',
        question: 'React Server Components (RSC)的核心特点是什么？',
        options: [
            '在客户端渲染但性能更好',
            '在服务器端渲染，不会发送到客户端',
            '可以在服务器和客户端同时运行',
            '是Next.js专有的特性'
        ],
        answer: [1],
        explanation: {
            correct: 'Server Components在服务器端渲染，JavaScript代码不会发送到客户端，只发送渲染结果（类似HTML）。这显著减少了bundle大小，提升了性能。服务器组件可以直接访问数据库、文件系统等服务端资源。',
            wrong: {
                0: 'Server Components在服务器端渲染，不是客户端。',
                2: 'Server Components只在服务器运行，不会在客户端重新执行。',
                3: '虽然Next.js率先支持，但RSC是React 19的官方特性，不限于Next.js。'
            }
        },
        tags: ['Server Components', 'RSC', 'React 19', '新特性']
    },
    {
        id: 2,
        type: 'judge',
        question: 'Server Components可以使用useState、useEffect等Hooks。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'Server Components不能使用客户端Hooks（useState、useEffect、useContext等），因为它们只在服务器运行一次，没有交互性。如果需要状态和交互，必须使用Client Components（标记"use client"）。',
            wrong: {
                0: 'Server Components不支持客户端Hooks。只有Client Components才能使用状态和effect。'
            }
        },
        tags: ['Server Components', 'Hooks限制', 'Client Components']
    },
    {
        id: 3,
        type: 'single',
        question: '如何将组件标记为Client Component？',
        options: [
            '在文件顶部添加 "use client"',
            '在文件顶部添加 "use server"',
            '使用特殊的导入方式',
            'React自动识别'
        ],
        answer: [0],
        explanation: {
            correct: '在文件顶部添加 "use client" 指令标记为Client Component。这告诉打包工具该组件及其依赖需要打包到客户端bundle中。默认情况下，组件是Server Component（在支持的框架中）。',
            wrong: {
                1: '"use server" 用于标记Server Actions，不是Server Components。',
                2: '不需要特殊导入，使用指令标记即可。',
                3: 'React不会自动识别，必须显式标记。'
            }
        },
        tags: ['Client Components', 'use client', 'React 19']
    },
    {
        id: 4,
        type: 'multiple',
        question: 'Server Components的优势包括哪些？（多选）',
        options: [
            '减少客户端JavaScript bundle大小',
            '直接访问服务端资源（数据库、文件系统）',
            '更好的SEO',
            '更快的交互响应'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：服务器代码不发送到客户端。选项B：可以直接查询数据库，无需API。选项C：渲染的HTML对搜索引擎友好。',
            wrong: {
                3: 'Server Components没有交互性，交互需要Client Components。快速交互是Client Components的优势。'
            }
        },
        tags: ['Server Components', '优势', '性能', 'SEO']
    },
    {
        id: 5,
        type: 'single',
        question: 'Server Component可以导入Client Component吗？',
        options: [
            '可以，且这是常见模式',
            '不可以，会报错',
            '可以但不推荐',
            '只能在特定情况下'
        ],
        answer: [0],
        explanation: {
            correct: 'Server Component可以导入和渲染Client Component。这是混合使用的常见模式：服务器组件作为外层，处理数据获取和布局；客户端组件作为叶子节点，处理交互。Server Component会序列化props传递给Client Component。',
            wrong: {
                1: '这是完全允许且常见的模式，不会报错。',
                2: '这是推荐的模式，不是不推荐。',
                3: '在所有情况下都可以，这是标准用法。'
            }
        },
        tags: ['Server Components', 'Client Components', '组件组合']
    },
    {
        id: 6,
        type: 'single',
        question: 'Client Component可以导入Server Component吗？',
        options: [
            '可以直接导入',
            '不可以直接导入，但可以作为children或props传递',
            '完全不可以使用',
            '只能通过特殊API导入'
        ],
        answer: [1],
        explanation: {
            correct: 'Client Component不能直接导入Server Component（会将其转为客户端组件）。但可以通过children或props传递：父组件（Server）渲染Server Component并作为children传给Client Component。这保持了服务器组件的服务端特性。',
            wrong: {
                0: '直接导入会将Server Component转为Client Component，失去服务端优势。',
                2: '可以使用，但必须通过正确的模式（children/props传递）。',
                3: '不需要特殊API，使用children模式即可。'
            }
        },
        tags: ['Client Components', 'Server Components', '组件组合', '限制']
    },
    {
        id: 7,
        type: 'judge',
        question: 'Server Components的props必须是可序列化的（JSON-safe）。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'Server Components的props必须可序列化，因为需要通过网络从服务器传到客户端。不能传递函数、类实例、Symbol等。可以传递：字符串、数字、对象、数组、Date、null、undefined等。',
            wrong: {
                1: '必须可序列化。函数、类实例等无法序列化，不能作为Server Component的props。'
            }
        },
        tags: ['Server Components', 'props', '序列化', '限制']
    },
    {
        id: 8,
        type: 'single',
        question: 'Server Components在什么时候重新渲染？',
        options: [
            '每次用户交互时',
            '每次state变化时',
            '每次导航或数据重新获取时',
            '永远不会重新渲染'
        ],
        answer: [2],
        explanation: {
            correct: 'Server Components在服务器端重新渲染，触发条件：1) 导航到包含该组件的路由；2) 手动触发数据重新获取；3) Server Actions执行后。不会因为客户端state或交互重新渲染。',
            wrong: {
                0: 'Server Components没有交互性，用户交互由Client Components处理。',
                1: 'Server Components没有state，不会因state变化渲染。',
                3: '会重新渲染，但触发条件与Client Components不同。'
            }
        },
        tags: ['Server Components', '渲染时机', 'React 19']
    },
    {
        id: 9,
        type: 'multiple',
        question: 'Server Components可以执行哪些操作？（多选）',
        options: [
            '直接查询数据库',
            '读取文件系统',
            '使用环境变量中的密钥',
            '添加事件监听器'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A、B、C都是服务端操作，Server Components可以安全执行。这是它的主要优势：直接访问服务端资源，无需API层。',
            wrong: {
                3: '添加事件监听器需要客户端JavaScript，Server Components不支持交互。'
            }
        },
        tags: ['Server Components', '服务端操作', '能力']
    },
    {
        id: 10,
        type: 'single',
        question: '在Server Component中如何处理错误？',
        options: [
            '使用try-catch和Error Boundary',
            '只能使用try-catch',
            '只能使用Error Boundary',
            '无法处理错误'
        ],
        answer: [0],
        explanation: {
            correct: 'Server Components可以使用try-catch捕获同步错误，也可以用Error Boundary（客户端组件）捕获渲染错误。推荐模式：Server Component中try-catch处理数据获取错误，外层用Error Boundary处理意外错误。',
            wrong: {
                1: 'Error Boundary也可以用，且是捕获渲染错误的最佳方式。',
                2: 'try-catch也可以且应该用于数据获取等同步操作。',
                3: '可以处理错误，有多种方式。'
            }
        },
        tags: ['Server Components', '错误处理', 'Error Boundary']
    },
    {
        id: 11,
        type: 'judge',
        question: 'Server Components可以使用浏览器专有的API（如window、localStorage）。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'Server Components在服务器运行，没有浏览器API（window、document、localStorage等）。使用这些API会报错。如果需要浏览器API，必须使用Client Components。',
            wrong: {
                0: 'Server Components在Node.js环境运行，没有浏览器API。'
            }
        },
        tags: ['Server Components', '浏览器API', '限制']
    },
    {
        id: 12,
        type: 'single',
        question: 'Server Components和传统SSR（服务端渲染）的主要区别是什么？',
        options: [
            '完全相同，只是名称不同',
            'Server Components不需要hydration，传统SSR需要',
            'Server Components更慢',
            'Server Components只能用于静态内容'
        ],
        answer: [1],
        explanation: {
            correct: 'Server Components不需要hydration（客户端激活），代码不发送到客户端。传统SSR在服务端渲染HTML后，还需要在客户端加载全部JavaScript并hydrate。Server Components显著减少客户端JavaScript，但Client Components仍需要hydration。',
            wrong: {
                0: '有本质区别：是否发送JavaScript到客户端，是否需要hydration。',
                2: 'Server Components通常更快，因为减少了客户端JavaScript。',
                3: 'Server Components可以是动态的，可以查询数据库获取最新数据。'
            }
        },
        tags: ['Server Components', 'SSR', '区别', 'hydration']
    },

    // Server Actions (13-22)
    {
        id: 13,
        type: 'single',
        question: 'Server Actions是什么？',
        options: [
            '在客户端执行的异步函数',
            '可以从客户端调用的服务端函数',
            '只能在Server Components中使用的函数',
            '一种新的状态管理方案'
        ],
        answer: [1],
        explanation: {
            correct: 'Server Actions是可以从客户端（Client Components、表单）调用的服务端函数。它们在服务器执行，可以访问数据库、文件系统等。自动处理序列化、安全性和错误。是React 19的重大创新。',
            wrong: {
                0: 'Server Actions在服务端执行，不是客户端。',
                2: 'Server Actions可以从Client Components调用，不限于Server Components。',
                3: '不是状态管理，是客户端-服务端通信的新方式。'
            }
        },
        tags: ['Server Actions', 'React 19', '新特性', '服务端函数']
    },
    {
        id: 14,
        type: 'single',
        question: '如何定义Server Action？',
        options: [
            '在文件顶部添加 "use server"',
            '在函数顶部添加 "use server"',
            '选项A和B都可以',
            '使用特殊的API'
        ],
        answer: [2],
        explanation: {
            correct: '两种方式都可以：1) 文件级：在文件顶部添加 "use server"，文件中所有导出的函数都是Server Actions；2) 函数级：在async函数体内第一行添加 "use server"。函数级适合在Client Component中内联定义。',
            wrong: {
                0: '这是一种方式，但不是唯一方式。',
                1: '这是一种方式，但不是唯一方式。',
                3: '不需要特殊API，使用指令标记即可。'
            }
        },
        tags: ['Server Actions', 'use server', '定义方式']
    },
    {
        id: 15,
        type: 'judge',
        question: 'Server Actions必须是async函数。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'Server Actions必须是async函数，因为它们涉及网络通信（客户端到服务端），是异步操作。返回值会被序列化发送回客户端。',
            wrong: {
                1: 'Server Actions必须是async，这是框架要求，因为涉及异步通信。'
            }
        },
        tags: ['Server Actions', 'async', '异步函数']
    },
    {
        id: 16,
        type: 'multiple',
        question: 'Server Actions可以在哪里调用？（多选）',
        options: [
            'Client Components的事件处理器中',
            '表单的action属性',
            'Server Components中',
            '普通JavaScript文件中'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：在onClick等事件处理器中调用。选项B：表单原生支持，无需JavaScript。选项C：Server Component中也可以调用（在服务端执行）。',
            wrong: {
                3: '普通JavaScript文件不在React环境中，无法直接调用Server Actions。'
            }
        },
        tags: ['Server Actions', '调用位置', '使用场景']
    },
    {
        id: 17,
        type: 'single',
        question: 'Server Actions与表单结合的优势是什么？',
        options: [
            '表单提交更快',
            '支持渐进增强，无JavaScript也能工作',
            '自动验证表单',
            '减少代码量'
        ],
        answer: [1],
        explanation: {
            correct: 'Server Actions支持渐进增强。表单可以直接使用action={serverAction}，即使JavaScript未加载或禁用，表单仍可通过传统POST提交工作。JavaScript加载后，自动升级为无刷新提交。这提升了可访问性和可靠性。',
            wrong: {
                0: '速度不一定更快，优势在于渐进增强和开发体验。',
                2: '验证需要自己实现，Server Actions不自动验证。',
                3: '代码量可能差不多，主要优势是更好的用户体验和渐进增强。'
            }
        },
        tags: ['Server Actions', '表单', '渐进增强', '优势']
    },
    {
        id: 18,
        type: 'single',
        question: 'useFormState Hook的作用是什么？',
        options: [
            '管理表单输入的state',
            '获取Server Action的返回值和pending状态',
            '验证表单数据',
            '防止重复提交'
        ],
        answer: [1],
        explanation: {
            correct: 'useFormState用于获取Server Action的返回值（如错误信息、成功消息）和提交状态。配合Server Action使用：const [state, formAction] = useFormState(serverAction, initialState)。适合表单提交后显示反馈。',
            wrong: {
                0: '管理输入用useState或受控组件，useFormState专门用于Action结果。',
                2: '验证需要自己实现，useFormState只是获取Action返回值。',
                3: '防重复提交可以配合useFormStatus实现，但不是useFormState的直接作用。'
            }
        },
        tags: ['Server Actions', 'useFormState', 'Hooks', 'React 19']
    },
    {
        id: 19,
        type: 'single',
        question: 'useFormStatus Hook提供什么信息？',
        options: [
            '表单验证状态',
            '表单提交的pending状态和data',
            '表单字段的错误',
            '表单是否被修改'
        ],
        answer: [1],
        explanation: {
            correct: 'useFormStatus返回表单提交状态：{ pending: boolean, data: FormData, method: string, action: string }。必须在<form>子组件中调用。常用于显示加载状态、禁用提交按钮。',
            wrong: {
                0: '验证状态需要自己实现，useFormStatus提供的是提交状态。',
                2: '错误通过useFormState获取，不是useFormStatus。',
                3: '是否修改需要自己跟踪，useFormStatus提供的是提交状态。'
            }
        },
        tags: ['Server Actions', 'useFormStatus', 'Hooks', 'React 19', '表单状态']
    },
    {
        id: 20,
        type: 'judge',
        question: 'Server Actions的参数和返回值必须可序列化。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'Server Actions的参数和返回值必须可序列化（JSON-safe），因为需要通过网络传输。不能传递或返回函数、类实例、Symbol等。常见可序列化类型：字符串、数字、对象、数组、FormData等。',
            wrong: {
                1: '必须可序列化，这是跨网络调用的基本要求。'
            }
        },
        tags: ['Server Actions', '序列化', '限制']
    },
    {
        id: 21,
        type: 'multiple',
        question: 'Server Actions的安全性考虑包括哪些？（多选）',
        options: [
            '必须验证所有输入',
            '必须检查用户权限',
            'React自动验证，无需额外检查',
            '应该使用CSRF保护'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：不信任客户端输入，服务端必须验证。选项B：检查用户是否有权执行操作。选项D：虽然React有内置保护，额外的CSRF token更安全。',
            wrong: {
                2: 'React不会自动验证业务逻辑。开发者必须实现所有验证和权限检查。'
            }
        },
        tags: ['Server Actions', '安全性', '验证', '权限']
    },
    {
        id: 22,
        type: 'single',
        question: 'Server Actions如何处理错误？',
        options: [
            '自动返回错误信息给客户端',
            '需要try-catch捕获并返回',
            '使用Error Boundary',
            '无法处理错误'
        ],
        answer: [1],
        explanation: {
            correct: '应该在Server Action中使用try-catch捕获错误，决定如何处理：返回错误信息、抛出错误（会被Error Boundary捕获）、或重定向。框架不会自动暴露错误详情给客户端（安全考虑）。',
            wrong: {
                0: '不会自动返回错误详情，需要显式处理和返回。',
                2: 'Error Boundary可以捕获未处理的错误，但最好在Action内部处理。',
                3: '可以且应该处理错误。'
            }
        },
        tags: ['Server Actions', '错误处理', '最佳实践']
    },

    // use Hook (23-28)
    {
        id: 23,
        type: 'single',
        question: 'React 19的use Hook的作用是什么？',
        options: [
            '替代useEffect',
            '在渲染期间读取Promise或Context',
            '创建自定义Hook',
            '优化性能'
        ],
        answer: [1],
        explanation: {
            correct: 'use Hook可以在渲染期间读取Promise（异步数据）或Context。对于Promise，use会暂停渲染直到Promise resolve，需要Suspense配合。对于Context，use(Context)等同于useContext(Context)，但更灵活（可以条件调用）。',
            wrong: {
                0: 'use不替代useEffect，它用于读取资源（Promise、Context）。',
                2: '创建自定义Hook不需要use，直接定义以use开头的函数即可。',
                3: 'use主要是为了简化异步数据处理，不是直接的性能优化工具。'
            }
        },
        tags: ['use Hook', 'React 19', '新特性', 'Promise', 'Context']
    },
    {
        id: 24,
        type: 'judge',
        question: 'use Hook可以在条件语句中调用，不受Hook规则限制。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'use是特殊的，可以在条件语句和循环中调用，不受传统Hook规则限制。例如：if (condition) { const value = use(promise); }。这是use与其他Hook的重要区别。',
            wrong: {
                1: 'use确实可以条件调用，这是它的设计特性，为了更灵活地处理异步数据。'
            }
        },
        tags: ['use Hook', 'Hook规则', '条件调用']
    },
    {
        id: 25,
        type: 'single',
        question: '使用use读取Promise时，必须配合什么？',
        options: [
            'useEffect',
            'Suspense边界',
            'Error Boundary',
            '选项B和C'
        ],
        answer: [3],
        explanation: {
            correct: '必须配合Suspense和Error Boundary。use会暂停组件渲染直到Promise resolve，Suspense显示加载状态。如果Promise reject，需要Error Boundary捕获错误。这是React的并发渲染特性。',
            wrong: {
                0: '不需要useEffect，use在渲染期间同步使用。',
                1: '需要Suspense，但也需要Error Boundary处理错误。',
                2: '需要Error Boundary，但也需要Suspense处理加载状态。'
            }
        },
        tags: ['use Hook', 'Suspense', 'Error Boundary', 'Promise']
    },
    {
        id: 26,
        type: 'single',
        question: 'use读取Context和useContext的主要区别是什么？',
        options: [
            '完全相同',
            'use可以条件调用，useContext不可以',
            'use性能更好',
            'use只能在Server Components使用'
        ],
        answer: [1],
        explanation: {
            correct: 'use(Context)可以条件调用，useContext不可以。例如：if (condition) { const value = use(MyContext); }。这使得某些模式更简洁。功能上，两者读取Context的结果相同。',
            wrong: {
                0: '有区别：use可以条件调用，更灵活。',
                2: '性能基本相同，主要区别是灵活性。',
                3: 'use可以在任何组件中使用，不限于Server Components。'
            }
        },
        tags: ['use Hook', 'useContext', '区别', 'Context']
    },
    {
        id: 27,
        type: 'judge',
        question: 'use可以读取在渲染期间创建的Promise。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'use不应该读取在渲染期间创建的Promise，因为每次渲染都会创建新Promise，导致无限循环。Promise应该在组件外部创建、通过props传递、或使用缓存（如React Cache）。',
            wrong: {
                0: '渲染期间创建Promise会导致问题。Promise应该稳定，不在每次渲染时重新创建。'
            }
        },
        tags: ['use Hook', 'Promise', '常见错误', '最佳实践']
    },
    {
        id: 28,
        type: 'single',
        question: '如果Promise reject，use会怎样？',
        options: [
            '返回undefined',
            '返回错误对象',
            '抛出错误，需要Error Boundary捕获',
            '自动重试'
        ],
        answer: [2],
        explanation: {
            correct: 'Promise reject时，use会抛出错误（throw error），需要外层的Error Boundary捕获并显示错误UI。这与async/await的try-catch不同，use依赖组件错误边界处理错误。',
            wrong: {
                0: '不会返回undefined，而是抛出错误。',
                1: '不会返回错误对象，而是抛出（throw）。',
                3: '不会自动重试，需要手动实现重试逻辑。'
            }
        },
        tags: ['use Hook', 'Promise', '错误处理', 'Error Boundary']
    },

    // Actions和Transitions (29-35)
    {
        id: 29,
        type: 'single',
        question: 'useTransition的主要作用是什么？',
        options: [
            '创建CSS过渡动画',
            '标记state更新为低优先级（非紧急）',
            '延迟渲染',
            '优化网络请求'
        ],
        answer: [1],
        explanation: {
            correct: 'useTransition用于标记state更新为transition（过渡），这些更新是低优先级的，可以被紧急更新打断。适合大量更新（如筛选长列表），保持UI响应。返回[isPending, startTransition]。',
            wrong: {
                0: 'useTransition不涉及CSS动画，而是React的并发特性。',
                2: '不是延迟，而是降低优先级。紧急更新仍会立即执行。',
                3: '不优化网络请求，而是优化大量UI更新的响应性。'
            }
        },
        tags: ['useTransition', 'React 19', '并发渲染', '优先级']
    },
    {
        id: 30,
        type: 'judge',
        question: 'transition中的更新可以被其他紧急更新打断。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'transition更新是可中断的。如果在transition进行中发生紧急更新（如用户输入），React会暂停transition，先处理紧急更新，然后重新开始transition。这保证了UI的响应性。',
            wrong: {
                1: 'transition确实可以被打断，这是并发渲染的核心特性。'
            }
        },
        tags: ['useTransition', '可中断渲染', '并发特性']
    },
    {
        id: 31,
        type: 'single',
        question: 'useDeferredValue的作用是什么？',
        options: [
            '延迟useState的更新',
            '创建一个延迟版本的值，允许UI保持响应',
            '推迟effect执行',
            '优化memo'
        ],
        answer: [1],
        explanation: {
            correct: 'useDeferredValue返回一个延迟版本的值。当值频繁变化时（如输入框），紧急更新（更新输入框）立即发生，延迟值稍后更新（更新搜索结果）。这保持输入流畅。与useTransition类似，但用于值而非state更新。',
            wrong: {
                0: '不延迟useState更新，而是创建一个延迟的值副本。',
                2: '不涉及effect，而是值的延迟版本。',
                3: '不是优化memo，而是创建低优先级的值。'
            }
        },
        tags: ['useDeferredValue', 'React 19', '并发渲染', '性能优化']
    },
    {
        id: 32,
        type: 'single',
        question: 'useTransition和useDeferredValue的主要区别是什么？',
        options: [
            '完全相同',
            'useTransition用于包装更新函数，useDeferredValue用于延迟值',
            'useTransition更快',
            'useDeferredValue是useTransition的别名'
        ],
        answer: [1],
        explanation: {
            correct: 'useTransition：控制state更新的优先级，适合你能控制更新时机的场景。useDeferredValue：延迟接收的值，适合值来自父组件或外部的场景。都实现了并发渲染，但使用场景不同。',
            wrong: {
                0: '有区别，一个包装更新函数，一个延迟值。',
                2: '速度相同，都是并发特性，区别在于使用场景。',
                3: '不是别名，是两个独立的Hook，用于不同场景。'
            }
        },
        tags: ['useTransition', 'useDeferredValue', '区别', '并发渲染']
    },
    {
        id: 33,
        type: 'multiple',
        question: '以下哪些场景适合使用useTransition？（多选）',
        options: [
            '过滤或搜索大量数据',
            '切换选项卡渲染大量内容',
            '更新输入框的值',
            '导航到新路由'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：搜索列表，保持输入流畅。选项B：切换选项卡，避免卡顿。选项D：导航，渐进式渲染新页面。这些都是大量更新、非紧急的场景。',
            wrong: {
                2: '输入框的值是紧急更新，不应该transition，否则输入会延迟，体验差。'
            }
        },
        tags: ['useTransition', '使用场景', '最佳实践']
    },
    {
        id: 34,
        type: 'judge',
        question: 'transition更新必须是同步的，不能包含异步操作。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'React 19中，transition可以包含异步操作。startTransition可以是async函数，pending状态会持续到所有异步操作完成。这与Server Actions结合很好，可以跟踪整个异步流程的状态。',
            wrong: {
                0: 'React 19支持异步transition，可以包含异步操作。'
            }
        },
        tags: ['useTransition', '异步操作', 'React 19', '新特性']
    },
    {
        id: 35,
        type: 'single',
        question: 'useOptimistic的作用是什么？',
        options: [
            '优化性能',
            '实现乐观更新UI',
            '延迟渲染',
            '缓存数据'
        ],
        answer: [1],
        explanation: {
            correct: 'useOptimistic用于乐观UI更新。在等待异步操作（如Server Action）完成时，立即显示乐观的UI状态。操作成功则保持，失败则回滚。提升用户感知的响应速度。',
            wrong: {
                0: '不是通用性能优化，专门用于乐观更新模式。',
                2: '不是延迟，而是提前显示预期结果。',
                3: '不是缓存，而是临时显示乐观状态。'
            }
        },
        tags: ['useOptimistic', 'React 19', '乐观更新', 'UX']
    },

    // 文档元数据和资源管理 (36-40)
    {
        id: 36,
        type: 'single',
        question: 'React 19如何处理文档元数据（title、meta标签）？',
        options: [
            '只能通过react-helmet',
            '可以直接在组件中渲染<title>和<meta>',
            '必须在HTML模板中定义',
            '不支持动态元数据'
        ],
        answer: [1],
        explanation: {
            correct: 'React 19原生支持在组件中直接渲染<title>、<meta>、<link>等标签，React会自动提升到<head>。无需react-helmet等第三方库。支持动态更新，适合SEO。',
            wrong: {
                0: 'React 19原生支持，不需要react-helmet。',
                2: '可以在组件中动态渲染，不限于HTML模板。',
                3: '完全支持动态元数据，这是新特性的重点。'
            }
        },
        tags: ['React 19', '文档元数据', 'SEO', '新特性']
    },
    {
        id: 37,
        type: 'judge',
        question: '在React 19中，<link rel="stylesheet">可以在组件中任意位置渲染。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'React 19支持在组件中任意位置渲染样式表链接，React会自动处理去重和提升到<head>。这简化了按需加载CSS的实现，特别是与代码分割结合时。',
            wrong: {
                1: 'React 19确实支持在组件中渲染<link>，自动提升到head。'
            }
        },
        tags: ['React 19', '样式表', '资源管理', '新特性']
    },
    {
        id: 38,
        type: 'single',
        question: 'React 19的<script async>标签有什么特点？',
        options: [
            '与普通HTML相同',
            'React会自动去重，多次渲染同一脚本只加载一次',
            '必须放在<head>中',
            '不支持async脚本'
        ],
        answer: [1],
        explanation: {
            correct: 'React 19自动去重<script>标签。即使多个组件渲染相同的脚本，只会加载一次（基于src）。支持async和defer。这简化了第三方脚本的管理。',
            wrong: {
                0: '不同于普通HTML，React会智能去重。',
                2: '可以在组件中任意位置渲染，React会处理。',
                3: '完全支持async脚本，且有去重优化。'
            }
        },
        tags: ['React 19', 'script标签', '资源管理', '去重']
    },
    {
        id: 39,
        type: 'multiple',
        question: 'React 19支持在组件中直接渲染哪些元数据标签？（多选）',
        options: [
            '<title>',
            '<meta>',
            '<link rel="stylesheet">',
            '<script>'
        ],
        answer: [0, 1, 2, 3],
        explanation: {
            correct: '所有选项都支持。React 19可以在组件中直接渲染这些标签，自动提升到<head>并智能去重。这是React 19的重大改进，简化了元数据管理。',
            wrong: {}
        },
        tags: ['React 19', '元数据', '支持标签', '新特性']
    },
    {
        id: 40,
        type: 'judge',
        question: 'React 19中，preload和prefetch资源链接也会被自动去重。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '<link rel="preload">和<link rel="prefetch">也会被去重。React确保相同的资源不会重复预加载。这优化了资源加载策略，特别是在代码分割和懒加载场景中。',
            wrong: {
                1: 'React 19确实会去重这些资源提示，优化加载性能。'
            }
        },
        tags: ['React 19', 'preload', 'prefetch', '去重', '性能优化']
    },

    // 其他改进 (41-50)
    {
        id: 41,
        type: 'single',
        question: 'React 19的ref处理有什么改进？',
        options: [
            'ref不能作为prop传递',
            'ref可以作为普通prop传递，不需要forwardRef',
            'ref必须用forwardRef',
            '没有变化'
        ],
        answer: [1],
        explanation: {
            correct: 'React 19中，ref可以作为普通prop直接传递和访问：function MyInput({ ref }) { return <input ref={ref} /> }。不再需要forwardRef包装。向后兼容，forwardRef仍然有效。',
            wrong: {
                0: '恰恰相反，React 19允许ref作为prop。',
                2: '不再必须，可以直接用，forwardRef变成可选的。',
                3: '有重大改进，简化了ref的使用。'
            }
        },
        tags: ['React 19', 'ref', 'forwardRef', '新特性', '简化']
    },
    {
        id: 42,
        type: 'judge',
        question: 'React 19移除了对useContext的支持，统一使用use Hook。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'useContext仍然完全支持，不会被移除。use Hook是补充，提供更多灵活性（条件调用）。开发者可以选择使用useContext或use(Context)，两者都有效。',
            wrong: {
                0: 'useContext仍然支持，不会移除。use是新增，不是替代。'
            }
        },
        tags: ['React 19', 'useContext', 'use Hook', '向后兼容']
    },
    {
        id: 43,
        type: 'single',
        question: 'React 19对Context的改进是什么？',
        options: [
            'Context.Provider可以简写为Context',
            'Context性能提升10倍',
            'Context支持选择器',
            '没有改进'
        ],
        answer: [0],
        explanation: {
            correct: 'React 19中，不再需要Context.Provider，可以直接使用Context作为provider：<MyContext value={...}>。向后兼容，Context.Provider仍然有效。这简化了语法。',
            wrong: {
                1: '性能可能有提升，但不是"10倍"这样的具体数字。',
                2: 'React Context仍然不支持原生选择器，需要第三方库。',
                3: '有语法简化的改进。'
            }
        },
        tags: ['React 19', 'Context', 'Provider', '语法简化']
    },
    {
        id: 44,
        type: 'judge',
        question: 'React 19提升了hydration的性能和错误恢复能力。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'React 19改进了hydration：1) 更快的并发hydration；2) 更好的mismatch错误恢复（尝试修复而不是完全重新渲染）；3) 更清晰的错误信息。这改善了SSR应用的性能和用户体验。',
            wrong: {
                1: 'React 19确实有显著的hydration改进。'
            }
        },
        tags: ['React 19', 'hydration', 'SSR', '性能优化']
    },
    {
        id: 45,
        type: 'multiple',
        question: 'React 19废弃或移除了哪些API？（多选）',
        options: [
            'defaultProps（函数组件）',
            'propTypes',
            'contextTypes',
            'useState'
        ],
        answer: [0],
        explanation: {
            correct: '选项A：函数组件的defaultProps被废弃，推荐使用默认参数。类组件的defaultProps仍然支持。',
            wrong: {
                1: 'propTypes仍然支持，虽然推荐TypeScript。',
                2: 'contextTypes是旧API，早就不推荐，但没有在19中特别移除。',
                3: 'useState是核心Hook，当然不会移除。'
            }
        },
        tags: ['React 19', '废弃API', '移除', '变更']
    },
    {
        id: 46,
        type: 'single',
        question: 'React 19的并发渲染是否默认启用？',
        options: [
            '是，自动启用',
            '否，需要手动开启',
            '只在使用特定特性时启用',
            '只在生产环境启用'
        ],
        answer: [2],
        explanation: {
            correct: '并发渲染在使用并发特性时自动启用，如：useTransition、useDeferredValue、Suspense。不使用这些特性时，行为与React 18相同。这是渐进式升级策略。',
            wrong: {
                0: '不是自动全局启用，而是按需启用。',
                1: '不需要手动全局开启，使用并发特性即可。',
                3: '开发和生产环境行为一致。'
            }
        },
        tags: ['React 19', '并发渲染', '启用方式']
    },
    {
        id: 47,
        type: 'single',
        question: 'React 19对错误处理的改进包括什么？',
        options: [
            '自动重试失败的组件',
            '更好的错误信息和source maps支持',
            '不再需要Error Boundary',
            '没有改进'
        ],
        answer: [1],
        explanation: {
            correct: 'React 19改进了开发体验：1) 更清晰的错误消息；2) 更好的堆栈跟踪和source maps；3) hydration mismatch的更具体错误。仍然需要Error Boundary捕获错误。',
            wrong: {
                0: '不会自动重试，重试逻辑需要自己实现。',
                2: 'Error Boundary仍然是捕获渲染错误的主要方式。',
                3: '有明显的错误处理改进。'
            }
        },
        tags: ['React 19', '错误处理', '开发体验', '改进']
    },
    {
        id: 48,
        type: 'judge',
        question: 'React 19完全移除了对类组件的支持。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '类组件仍然完全支持，不会被移除。React团队承诺长期支持类组件。React 19的新特性主要针对函数组件，但不影响类组件的使用。',
            wrong: {
                0: '类组件仍然支持，React保持向后兼容。'
            }
        },
        tags: ['React 19', '类组件', '向后兼容', '支持']
    },
    {
        id: 49,
        type: 'multiple',
        question: 'React 19的主要目标包括哪些？（多选）',
        options: [
            '简化开发体验',
            '提升性能',
            '更好的服务端渲染支持',
            '完全重写React核心'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：简化API（ref as prop、Context简写等）。选项B：并发渲染、自动批处理等性能优化。选项C：Server Components、Server Actions等创新。',
            wrong: {
                3: '不是完全重写，而是渐进式改进，保持向后兼容。'
            }
        },
        tags: ['React 19', '目标', '改进方向']
    },
    {
        id: 50,
        type: 'single',
        question: '从React 18升级到React 19需要改动大量代码吗？',
        options: [
            '是，需要完全重写',
            '否，大部分代码可以直接运行',
            '需要重写所有组件为Server Components',
            '需要移除所有类组件'
        ],
        answer: [1],
        explanation: {
            correct: 'React 19高度向后兼容。大部分React 18代码可以直接在19中运行。新特性是可选的，可以渐进式采用。需要注意的主要是废弃警告（如defaultProps），但不影响运行。',
            wrong: {
                0: '不需要重写，React保持向后兼容。',
                2: 'Server Components是可选的，不强制使用。',
                3: '类组件仍然支持，不需要移除。'
            }
        },
        tags: ['React 19', '升级', '向后兼容', '迁移']
    }
];

