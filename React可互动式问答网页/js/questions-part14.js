// Part 14: 安全与SEO - 题库
const questionsPart14 = [
    // XSS安全 (1-10)
    {
        id: 1,
        type: 'single',
        question: 'XSS（跨站脚本攻击）的主要危害是什么？',
        options: [
            '拖慢网站速度',
            '注入恶意脚本，窃取用户信息或执行恶意操作',
            '破坏网站布局',
            '增加服务器负载'
        ],
        answer: [1],
        explanation: {
            correct: 'XSS攻击通过注入恶意JavaScript脚本，可以：1) 窃取cookie、token等敏感信息；2) 冒充用户执行操作；3) 重定向到钓鱼网站；4) 篡改页面内容；5) 记录用户输入（如密码）。是Web安全的主要威胁之一。',
            wrong: {
                0: 'XSS不是性能问题，而是安全漏洞。',
                2: '虽然可能影响布局，但主要危害是安全问题。',
                3: '不直接增加服务器负载，主要危害客户端用户。'
            }
        },
        tags: ['XSS', '安全', 'Web安全', '跨站脚本']
    },
    {
        id: 2,
        type: 'judge',
        question: 'React默认会转义所有在JSX中渲染的内容，因此完全不用担心XSS攻击。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'React默认转义确实提供了很好的保护，但不是100%安全。危险情况：1) 使用dangerouslySetInnerHTML；2) 直接操作DOM；3) href="javascript:..."；4) 服务端渲染的安全问题；5) 第三方库的漏洞。仍需谨慎处理用户输入。',
            wrong: {
                0: '虽然React有保护，但仍有绕过的方式。开发者需要了解安全最佳实践。'
            }
        },
        tags: ['XSS', 'React安全', '转义', '最佳实践']
    },
    {
        id: 3,
        type: 'single',
        question: 'dangerouslySetInnerHTML的正确使用方式是什么？',
        options: [
            '可以直接使用用户输入',
            '必须先对内容进行消毒（sanitize）',
            '永远不应该使用',
            '只能用于静态内容'
        ],
        answer: [1],
        explanation: {
            correct: '使用dangerouslySetInnerHTML时必须先消毒内容，移除潜在的恶意脚本。推荐使用DOMPurify等库。使用场景：富文本编辑器、渲染Markdown、第三方HTML内容。但要极度谨慎，确保内容可信或已消毒。',
            wrong: {
                0: '直接使用用户输入极其危险，是典型的XSS漏洞。',
                2: '某些场景确实需要，但必须正确使用。',
                3: '可以用于动态内容，但必须经过消毒处理。'
            }
        },
        tags: ['dangerouslySetInnerHTML', 'XSS', '消毒', '安全最佳实践']
    },
    {
        id: 4,
        type: 'multiple',
        question: '以下哪些属性可能导致XSS？（多选）',
        options: [
            'href="javascript:alert(1)"',
            'src属性指向用户控制的URL',
            'onClick={handleClick}',
            'style属性使用用户输入'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：javascript:协议可以执行脚本。选项B：如果URL指向恶意脚本文件。选项D：CSS注入，某些CSS属性可以执行JS（如expression in IE）。',
            wrong: {
                2: 'onClick使用函数引用是安全的，React会正确处理。危险的是onClick="alert(1)"这种字符串形式（不是JSX标准写法）。'
            }
        },
        tags: ['XSS', '危险属性', 'href', 'src', 'style']
    },
    {
        id: 5,
        type: 'single',
        question: 'DOMPurify库的作用是什么？',
        options: [
            '优化DOM性能',
            '清理和消毒HTML，移除恶意代码',
            '压缩HTML',
            '格式化HTML'
        ],
        answer: [1],
        explanation: {
            correct: 'DOMPurify是专业的HTML消毒库，移除危险的标签、属性和脚本，保留安全的内容。用于处理用户提交的HTML或不可信的HTML。使用：const clean = DOMPurify.sanitize(dirty)。',
            wrong: {
                0: 'DOMPurify不是性能优化工具，而是安全工具。',
                2: '不是压缩，而是移除危险内容。',
                3: '不是格式化，而是安全清理。'
            }
        },
        tags: ['DOMPurify', 'HTML消毒', '安全', 'XSS防护']
    },
    {
        id: 6,
        type: 'judge',
        question: '在React中，将用户输入直接用作className是安全的。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'className是安全的，React会将其作为字符串处理，不会执行代码。但需要注意CSS注入的风险（虽然危害较小）：攻击者可能注入CSS类名导致样式混乱。对于关键的安全场景，可以验证className是否在允许列表中。',
            wrong: {
                1: 'className基本是安全的，不会导致XSS。React会正确处理。'
            }
        },
        tags: ['className', '安全', '用户输入', 'React']
    },
    {
        id: 7,
        type: 'single',
        question: 'Content Security Policy (CSP)的主要作用是什么？',
        options: [
            '压缩内容',
            '限制页面可以加载哪些资源，防止XSS',
            '加密内容',
            '缓存策略'
        ],
        answer: [1],
        explanation: {
            correct: 'CSP通过HTTP头或meta标签指定页面可以加载资源的来源（脚本、样式、图片等）。即使存在XSS漏洞，攻击者也无法加载外部恶意脚本。例如：Content-Security-Policy: script-src "self" https://trusted.com。',
            wrong: {
                0: 'CSP不涉及压缩，而是安全策略。',
                2: 'CSP不加密内容，而是控制资源来源。',
                3: '缓存策略是Cache-Control等头，不是CSP。'
            }
        },
        tags: ['CSP', 'Content Security Policy', 'XSS防护', 'HTTP头']
    },
    {
        id: 8,
        type: 'multiple',
        question: 'CSP策略包括哪些指令？（多选）',
        options: [
            'script-src：限制JavaScript来源',
            'style-src：限制CSS来源',
            'img-src：限制图片来源',
            'data-src：限制数据来源'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A、B、C都是有效的CSP指令。还有：font-src、connect-src（XHR/WebSocket）、frame-src等。通过组合这些指令，可以精确控制页面的资源加载。',
            wrong: {
                3: 'data-src不是CSP指令。限制data: URL使用script-src和img-src等。'
            }
        },
        tags: ['CSP', '指令', 'script-src', 'style-src', 'img-src']
    },
    {
        id: 9,
        type: 'single',
        question: '在React应用中使用内联脚本（如<script>...）与CSP的关系是什么？',
        options: [
            '完全兼容',
            '需要使用nonce或hash才能兼容',
            '完全不兼容',
            '不受CSP限制'
        ],
        answer: [1],
        explanation: {
            correct: 'CSP的script-src "self"会阻止内联脚本。解决方案：1) 使用nonce：script-src "nonce-随机值"，脚本标签加nonce属性；2) 使用hash：script-src "sha256-哈希值"；3) 避免内联脚本（最佳实践）。',
            wrong: {
                0: '默认情况下不兼容，需要额外配置。',
                2: '可以通过nonce或hash兼容，不是完全不兼容。',
                3: '内联脚本受CSP严格限制。'
            }
        },
        tags: ['CSP', '内联脚本', 'nonce', 'hash', 'React']
    },
    {
        id: 10,
        type: 'judge',
        question: '使用eval()、Function()构造函数在React应用中是安全的。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'eval()和new Function()极其危险，可以执行任意代码。如果输入来自用户，是严重的安全漏洞。CSP可以禁用它们（script-src不包含unsafe-eval）。几乎所有场景都有更安全的替代方案，应该避免使用。',
            wrong: {
                0: 'eval和Function构造函数是危险的，应该避免，特别是涉及用户输入时。'
            }
        },
        tags: ['eval', 'Function', '安全', '危险API']
    },

    // CSRF和其他安全 (11-20)
    {
        id: 11,
        type: 'single',
        question: 'CSRF（跨站请求伪造）攻击的原理是什么？',
        options: [
            '注入恶意脚本',
            '利用用户的登录状态，伪造请求执行操作',
            '窃取用户密码',
            '拦截网络请求'
        ],
        answer: [1],
        explanation: {
            correct: 'CSRF利用用户已登录的状态（cookie自动发送），诱导用户访问恶意网站，该网站向目标站点发送请求（如转账、修改密码）。因为浏览器自动带上cookie，服务器认为是合法请求。',
            wrong: {
                0: '注入脚本是XSS，不是CSRF。',
                2: 'CSRF不直接窃取密码，而是利用登录状态执行操作。',
                3: 'CSRF不拦截请求，而是伪造请求。'
            }
        },
        tags: ['CSRF', '跨站请求伪造', 'Web安全', '攻击原理']
    },
    {
        id: 12,
        type: 'multiple',
        question: '防御CSRF的方法包括哪些？（多选）',
        options: [
            '使用CSRF Token',
            '检查Referer或Origin头',
            'SameSite Cookie',
            '使用HTTPS'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：服务器生成token，请求时验证。选项B：验证请求来源。选项C：SameSite=Strict/Lax限制跨站cookie发送。这些都是有效的CSRF防御。',
            wrong: {
                3: 'HTTPS防中间人攻击，但不防CSRF。CSRF攻击不需要窃听通信。'
            }
        },
        tags: ['CSRF', '防御', 'CSRF Token', 'SameSite', 'Referer']
    },
    {
        id: 13,
        type: 'single',
        question: 'SameSite Cookie的Strict和Lax模式的区别是什么？',
        options: [
            '完全相同',
            'Strict完全禁止跨站发送，Lax允许GET导航发送',
            'Lax更严格',
            '只是名称不同'
        ],
        answer: [1],
        explanation: {
            correct: 'Strict：完全禁止跨站发送cookie，包括点击链接。Lax：允许顶级导航的GET请求（点击链接），禁止POST和子请求。Lax是Chrome默认值，平衡了安全和可用性。Strict更安全但可能影响用户体验（如从邮件链接登录）。',
            wrong: {
                0: '有明显区别，Strict更严格。',
                2: 'Strict更严格，不是Lax。',
                3: '不只是名称，行为有实质区别。'
            }
        },
        tags: ['SameSite', 'Cookie', 'Strict', 'Lax', 'CSRF防御']
    },
    {
        id: 14,
        type: 'judge',
        question: '在React SPA中，因为没有传统的表单提交，所以不需要担心CSRF。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'SPA仍然需要防CSRF。虽然不用传统表单，但API请求（fetch/axios）仍会自动发送cookie。如果攻击者诱导用户执行恶意请求，仍然会带上cookie。应该使用CSRF token、SameSite cookie或基于header的认证（如Bearer token）。',
            wrong: {
                0: 'SPA仍然面临CSRF风险，需要采取防御措施。'
            }
        },
        tags: ['CSRF', 'SPA', 'React', '安全']
    },
    {
        id: 15,
        type: 'single',
        question: 'JWT（JSON Web Token）存储在哪里最安全？',
        options: [
            'localStorage',
            'sessionStorage',
            'HttpOnly Cookie',
            '内存中'
        ],
        answer: [2],
        explanation: {
            correct: 'HttpOnly Cookie最安全：1) 无法被JavaScript访问，防XSS窃取；2) 配合SameSite防CSRF；3) Secure标志确保只在HTTPS发送。localStorage/sessionStorage可被XSS窃取。内存中刷新页面会丢失。实践中常用HttpOnly Cookie或内存+刷新token组合。',
            wrong: {
                0: 'localStorage可被XSS窃取，不安全。',
                1: 'sessionStorage也可被XSS窃取，与localStorage类似。',
                3: '内存安全但刷新丢失，需要复杂的刷新token机制。'
            }
        },
        tags: ['JWT', 'Token存储', '安全', 'Cookie', 'localStorage']
    },
    {
        id: 16,
        type: 'multiple',
        question: '安全的密码处理实践包括哪些？（多选）',
        options: [
            '在客户端哈希密码',
            '使用HTTPS传输',
            '永远不在前端日志中记录密码',
            '在前端验证密码强度'
        ],
        answer: [1, 2, 3],
        explanation: {
            correct: '选项B：HTTPS防中间人窃听。选项C：避免密码泄露到日志。选项D：提升用户密码质量（虽然服务端也要验证）。',
            wrong: {
                0: '客户端哈希意义不大，攻击者仍可以窃取哈希值重放。应该在服务端用bcrypt等算法哈希，客户端通过HTTPS明文传输。'
            }
        },
        tags: ['密码安全', 'HTTPS', '最佳实践', '安全']
    },
    {
        id: 17,
        type: 'judge',
        question: '在React组件中直接console.log用户的敏感信息是可以的，因为只在开发环境。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '不应该log敏感信息（密码、token、信用卡等）。风险：1) 可能误提交到版本控制；2) 生产环境如果忘记移除会泄露；3) 浏览器DevTools可被恶意扩展访问。养成不log敏感数据的习惯。',
            wrong: {
                0: '永远不应该log敏感信息，即使在开发环境。'
            }
        },
        tags: ['敏感信息', 'console.log', '安全', '最佳实践']
    },
    {
        id: 18,
        type: 'single',
        question: '什么是点击劫持（Clickjacking）？',
        options: [
            '窃取用户点击数据',
            '通过透明iframe诱导用户点击隐藏的按钮',
            '阻止用户点击',
            '自动触发点击'
        ],
        answer: [1],
        explanation: {
            correct: '点击劫持通过透明的iframe覆盖在诱饵内容上，用户以为点击诱饵，实际点击iframe中的按钮（如授权、转账）。防御：X-Frame-Options头或CSP的frame-ancestors指令，禁止页面被iframe嵌入。',
            wrong: {
                0: '不是窃取数据，而是诱导用户执行意外操作。',
                2: '不是阻止点击，而是误导点击目标。',
                3: '不是自动触发，而是诱导用户主动点击。'
            }
        },
        tags: ['Clickjacking', '点击劫持', 'iframe', 'X-Frame-Options']
    },
    {
        id: 19,
        type: 'single',
        question: 'X-Frame-Options头的SAMEORIGIN值的含义是什么？',
        options: [
            '允许任何网站嵌入',
            '只允许同源的页面嵌入',
            '禁止任何嵌入',
            '只在HTTPS时允许'
        ],
        answer: [1],
        explanation: {
            correct: 'SAMEORIGIN允许同源的页面通过iframe嵌入，禁止跨源嵌入。其他值：DENY（完全禁止）、ALLOW-FROM（已废弃）。现代做法是使用CSP的frame-ancestors指令，更灵活（可以指定多个域）。',
            wrong: {
                0: '允许任何网站是不设置头或设置为ALLOWALL（不推荐）。',
                2: '完全禁止是DENY，不是SAMEORIGIN。',
                3: 'SAMEORIGIN与HTTPS无关，只看源（协议、域、端口）。'
            }
        },
        tags: ['X-Frame-Options', 'SAMEORIGIN', '点击劫持防御', 'HTTP头']
    },
    {
        id: 20,
        type: 'multiple',
        question: '安全的HTTP响应头包括哪些？（多选）',
        options: [
            'X-Content-Type-Options: nosniff',
            'X-Frame-Options: DENY',
            'Content-Security-Policy',
            'X-Powered-By: React'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：防止MIME嗅探攻击。选项B：防点击劫持。选项C：防XSS和数据注入。这些都是重要的安全头。',
            wrong: {
                3: 'X-Powered-By暴露技术栈信息，帮助攻击者，应该移除，不是安全头。'
            }
        },
        tags: ['HTTP头', '安全', 'X-Content-Type-Options', 'X-Frame-Options', 'CSP']
    },

    // SEO基础 (21-30)
    {
        id: 21,
        type: 'single',
        question: 'SPA（单页应用）的主要SEO挑战是什么？',
        options: [
            '加载速度慢',
            '爬虫可能无法执行JavaScript，看不到内容',
            '代码太复杂',
            '不支持搜索引擎'
        ],
        answer: [1],
        explanation: {
            correct: 'SPA的内容通过JavaScript动态生成，初始HTML几乎为空。虽然Google等现代爬虫可以执行JS，但仍有限制（超时、资源限制）。其他搜索引擎可能完全不执行JS。解决方案：SSR、SSG、预渲染、动态渲染。',
            wrong: {
                0: '速度不是主要SEO问题（虽然也重要）。主要是内容可见性。',
                2: '代码复杂度不直接影响SEO。',
                3: 'SPA可以支持搜索引擎，但需要特殊处理。'
            }
        },
        tags: ['SEO', 'SPA', '单页应用', '爬虫', 'JavaScript']
    },
    {
        id: 22,
        type: 'multiple',
        question: '提升React应用SEO的方法包括哪些？（多选）',
        options: [
            '服务端渲染（SSR）',
            '静态生成（SSG）',
            '使用React.memo',
            '使用语义化HTML标签'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：SSR预渲染HTML，爬虫直接看到内容。选项B：构建时生成HTML。选项D：语义化标签帮助搜索引擎理解内容结构。',
            wrong: {
                2: 'React.memo是性能优化，不影响SEO。'
            }
        },
        tags: ['SEO', 'SSR', 'SSG', '语义化HTML', 'React']
    },
    {
        id: 23,
        type: 'judge',
        question: 'React Helmet可以动态修改页面的title和meta标签以改善SEO。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: 'React Helmet允许在组件中声明式地管理<head>内容，包括title、meta、link等。虽然是客户端修改，但配合SSR时，这些标签会出现在服务端渲染的HTML中，爬虫可见。React 19原生支持类似功能。',
            wrong: {
                1: 'React Helmet确实可以改善SEO，特别是配合SSR使用。'
            }
        },
        tags: ['React Helmet', 'SEO', 'meta标签', 'title']
    },
    {
        id: 24,
        type: 'single',
        question: '对SEO最重要的meta标签是哪个？',
        options: [
            'meta keywords',
            'meta description',
            'meta author',
            'meta viewport'
        ],
        answer: [1],
        explanation: {
            correct: 'meta description显示在搜索结果中作为页面摘要，影响点击率。应该：1) 每页独特；2) 150-160字符；3) 包含关键词；4) 吸引用户点击。keywords已被主流搜索引擎忽略（因为滥用）。',
            wrong: {
                0: 'keywords标签已被Google等忽略，对SEO几乎无用。',
                2: 'author对SEO影响很小。',
                3: 'viewport对移动友好性重要，但不直接影响搜索排名（间接影响）。'
            }
        },
        tags: ['SEO', 'meta description', 'meta标签', '搜索优化']
    },
    {
        id: 25,
        type: 'single',
        question: 'Open Graph标签的主要作用是什么？',
        options: [
            '提升Google排名',
            '控制页面在社交媒体上分享时的显示',
            '加快页面加载',
            '防止XSS攻击'
        ],
        answer: [1],
        explanation: {
            correct: 'Open Graph（OG）标签控制页面在Facebook、Twitter等社交媒体分享时的标题、描述、图片。例如：<meta property="og:title" content="...">。虽然不直接影响搜索排名，但改善社交分享效果，间接带来流量。',
            wrong: {
                0: 'OG标签不直接影响Google排名，主要用于社交分享。',
                2: 'OG标签不影响加载速度。',
                3: 'OG标签与安全无关，是SEO和社交优化。'
            }
        },
        tags: ['Open Graph', 'OG标签', 'SEO', '社交媒体']
    },
    {
        id: 26,
        type: 'judge',
        question: '使用有意义的URL路径（如/products/react-course）比数字ID（如/products/123）对SEO更好。',
        options: ['正确', '错误'],
        answer: [0],
        explanation: {
            correct: '语义化URL对SEO和用户体验都更好：1) 包含关键词，帮助排名；2) 用户一眼看出内容；3) 更易分享和记忆。避免无意义的参数和ID。使用连字符分隔单词，小写字母。',
            wrong: {
                1: '语义化URL确实对SEO有帮助，且用户体验更好。'
            }
        },
        tags: ['SEO', 'URL', '语义化', '最佳实践']
    },
    {
        id: 27,
        type: 'multiple',
        question: '影响SEO的技术因素包括哪些？（多选）',
        options: [
            '页面加载速度',
            '移动友好性',
            'HTTPS',
            '代码行数'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：Core Web Vitals是重要排名因素。选项B：移动优先索引，移动体验至关重要。选项C：HTTPS是排名因素，且影响用户信任。',
            wrong: {
                3: '代码行数不影响SEO。重要的是内容质量、性能、可访问性。'
            }
        },
        tags: ['SEO', '技术SEO', '页面速度', '移动友好', 'HTTPS']
    },
    {
        id: 28,
        type: 'single',
        question: 'robots.txt文件的作用是什么？',
        options: [
            '阻止黑客访问',
            '告诉搜索引擎爬虫哪些页面可以爬取',
            '加密网站内容',
            '验证网站所有权'
        ],
        answer: [1],
        explanation: {
            correct: 'robots.txt放在网站根目录，指示爬虫哪些路径可以爬、哪些不可以。例如：Disallow: /admin/。注意：这只是建议，恶意爬虫可能忽略。真正的访问控制需要身份验证。',
            wrong: {
                0: 'robots.txt不阻止黑客，任何人都能访问它。安全控制需要其他机制。',
                2: 'robots.txt不加密，是纯文本文件。',
                3: '验证所有权用搜索引擎提供的验证文件或meta标签。'
            }
        },
        tags: ['robots.txt', 'SEO', '爬虫', '搜索引擎']
    },
    {
        id: 29,
        type: 'single',
        question: 'sitemap.xml的主要作用是什么？',
        options: [
            '网站地图供用户浏览',
            '列出网站的所有URL，帮助搜索引擎发现和索引页面',
            '配置网站路由',
            '存储网站数据'
        ],
        answer: [1],
        explanation: {
            correct: 'sitemap.xml列出网站的所有重要URL，提交给搜索引擎（Google Search Console等）。帮助爬虫发现深层页面、新页面，特别对大型网站和SPA重要。包含URL、更新频率、优先级等信息。',
            wrong: {
                0: '这是HTML格式的用户网站地图，不是sitemap.xml。',
                2: '路由配置是应用代码，不是sitemap。',
                3: 'sitemap不存储数据，只列出URL。'
            }
        },
        tags: ['sitemap', 'SEO', '搜索引擎', 'XML']
    },
    {
        id: 30,
        type: 'judge',
        question: '在React应用中，使用<h1>、<h2>等标题标签的层次结构对SEO没有影响。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '标题层次结构对SEO很重要：1) 帮助搜索引擎理解内容层次和主题；2) 每页应该只有一个<h1>；3) 标题应该按顺序嵌套（h1→h2→h3）；4) 包含关键词。这也改善可访问性（屏幕阅读器导航）。',
            wrong: {
                0: '标题标签的正确使用对SEO和可访问性都很重要。'
            }
        },
        tags: ['SEO', '标题标签', 'HTML', '语义化', '可访问性']
    },

    // 结构化数据与高级SEO (31-40)
    {
        id: 31,
        type: 'single',
        question: '什么是结构化数据（Structured Data）？',
        options: [
            '数据库的表结构',
            '使用特定格式（如JSON-LD）标记页面内容，帮助搜索引擎理解',
            '压缩后的数据',
            'API的响应格式'
        ],
        answer: [1],
        explanation: {
            correct: '结构化数据使用schema.org词汇表标记内容类型（文章、产品、评论、事件等），搜索引擎可以展示富媒体搜索结果（Rich Snippets），如评分星星、价格、库存。格式：JSON-LD（推荐）、Microdata、RDFa。',
            wrong: {
                0: '不是数据库结构，而是网页内容的语义标记。',
                2: '不是压缩，而是添加语义信息。',
                3: '不是API格式，而是HTML中的标记。'
            }
        },
        tags: ['结构化数据', 'Structured Data', 'Schema.org', 'JSON-LD', 'SEO']
    },
    {
        id: 32,
        type: 'single',
        question: 'JSON-LD结构化数据应该放在HTML的哪里？',
        options: [
            '只能放在<head>中',
            '只能放在<body>中',
            '可以放在<head>或<body>中',
            '必须是外部文件'
        ],
        answer: [2],
        explanation: {
            correct: 'JSON-LD可以放在<head>或<body>的<script type="application/ld+json">标签中。放在<head>更常见，但<body>中也完全有效。在React中，可以用react-helmet或直接渲染<script>标签。',
            wrong: {
                0: '不限于<head>，<body>中也可以。',
                1: '不限于<body>，<head>更常见。',
                3: '应该内联在HTML中，不是外部文件。'
            }
        },
        tags: ['JSON-LD', '结构化数据', 'SEO', '位置']
    },
    {
        id: 33,
        type: 'multiple',
        question: '常见的结构化数据类型包括哪些？（多选）',
        options: [
            'Article（文章）',
            'Product（产品）',
            'Review（评论）',
            'Button（按钮）'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A、B、C都是常见的schema.org类型。其他常见类型：Organization、Person、Event、Recipe、BreadcrumbList等。每种类型有特定的属性，正确使用可以获得富媒体搜索结果。',
            wrong: {
                3: 'Button不是结构化数据类型。结构化数据描述内容，不是UI元素。'
            }
        },
        tags: ['结构化数据', 'Schema.org', '类型', 'Article', 'Product', 'Review']
    },
    {
        id: 34,
        type: 'judge',
        question: '添加结构化数据可以保证网站在搜索结果中获得特殊展示。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '结构化数据不保证富媒体搜索结果。搜索引擎会：1) 验证数据格式；2) 评估内容质量；3) 决定是否展示。正确的结构化数据增加机会，但不保证。可以用Google的Rich Results Test工具测试。',
            wrong: {
                0: '不保证特殊展示，但正确使用能显著增加机会。'
            }
        },
        tags: ['结构化数据', 'Rich Snippets', 'SEO', '搜索结果']
    },
    {
        id: 35,
        type: 'single',
        question: '什么是Breadcrumb导航的结构化数据？',
        options: [
            '网站的导航菜单',
            '标记页面在网站层次结构中的位置',
            '用户的浏览历史',
            '网站的sitemap'
        ],
        answer: [1],
        explanation: {
            correct: 'Breadcrumb（面包屑）结构化数据标记页面在网站中的层次位置（首页 > 分类 > 子分类 > 当前页）。搜索结果可能显示这个路径，帮助用户理解页面位置，提升点击率。使用BreadcrumbList类型。',
            wrong: {
                0: 'Breadcrumb不是主导航，是层次路径。',
                2: '不是浏览历史，而是网站结构中的位置。',
                3: '不是sitemap，是单个页面的层次标记。'
            }
        },
        tags: ['Breadcrumb', '面包屑', '结构化数据', 'SEO']
    },
    {
        id: 36,
        type: 'single',
        question: 'Canonical标签的作用是什么？',
        options: [
            '指定页面的官方版本，避免重复内容问题',
            '重定向到另一个页面',
            '阻止页面被索引',
            '指定页面语言'
        ],
        answer: [0],
        explanation: {
            correct: 'Canonical标签<link rel="canonical" href="...">告诉搜索引擎哪个URL是主要版本，其他URL（如带参数、移动版）是重复。避免重复内容惩罚，集中SEO权重。在React中，每个页面应该有canonical标签指向自己或主版本。',
            wrong: {
                1: '重定向用HTTP 301，不是canonical标签。',
                2: '阻止索引用noindex meta标签或robots.txt。',
                3: '语言用hreflang标签，不是canonical。'
            }
        },
        tags: ['Canonical', 'SEO', '重复内容', 'link标签']
    },
    {
        id: 37,
        type: 'multiple',
        question: '多语言网站的SEO最佳实践包括哪些？（多选）',
        options: [
            '使用hreflang标签指示语言和地区',
            '每种语言使用独立的URL',
            '所有语言共用一个URL，用JavaScript切换',
            '提供语言选择器'
        ],
        answer: [0, 1, 3],
        explanation: {
            correct: '选项A：hreflang告诉搜索引擎页面的语言和目标地区。选项B：独立URL易于索引和分享。选项D：方便用户切换语言。',
            wrong: {
                2: '共用URL且JavaScript切换对SEO不友好。爬虫可能看不到其他语言版本。应该用不同URL（子域名、子目录或参数）。'
            }
        },
        tags: ['多语言', 'hreflang', 'SEO', '国际化']
    },
    {
        id: 38,
        type: 'judge',
        question: '在React SPA中使用#号路由（如/#/about）对SEO友好。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'Hash路由（#）对SEO不友好：1) URL中#后的部分不会发送到服务器；2) 传统爬虫完全忽略；3) 难以跟踪和分享。应该使用HTML5 History API（react-router的BrowserRouter），配合服务端配置，所有路由返回index.html。',
            wrong: {
                0: 'Hash路由对SEO很不友好。现代React应用应该使用History模式。'
            }
        },
        tags: ['路由', 'Hash路由', 'SEO', 'React Router']
    },
    {
        id: 39,
        type: 'single',
        question: '什么是预渲染（Prerendering）？',
        options: [
            '提前渲染所有组件',
            '在构建时或请求时生成静态HTML快照',
            '在客户端渲染前准备数据',
            '服务端渲染的另一个名称'
        ],
        answer: [1],
        explanation: {
            correct: '预渲染为SPA生成静态HTML快照，爬虫看到完整内容，用户仍然获得SPA体验。方法：1) 构建时预渲染（react-snap、prerender-spa-plugin）；2) 动态渲染（检测爬虫，实时渲染HTML）。比SSR简单，但不适合频繁更新的内容。',
            wrong: {
                0: '不是提前渲染所有组件，而是生成HTML快照。',
                2: '不是准备数据，而是生成HTML。',
                3: '预渲染与SSR不同：预渲染生成静态HTML，SSR是实时渲染。'
            }
        },
        tags: ['预渲染', 'Prerendering', 'SEO', 'SPA']
    },
    {
        id: 40,
        type: 'single',
        question: '动态渲染（Dynamic Rendering）的原理是什么？',
        options: [
            '检测用户设备动态选择渲染方式',
            '检测请求是否来自爬虫，是则返回预渲染的HTML',
            '根据用户权限渲染不同内容',
            '动态加载组件'
        ],
        answer: [1],
        explanation: {
            correct: '动态渲染检测User-Agent，判断是否为爬虫。是爬虫则返回预渲染的HTML（可用Puppeteer等工具），否则返回SPA。Google推荐的方案。注意：不算cloaking（隐藏真实内容），因为内容相同，只是格式不同。',
            wrong: {
                0: '不是根据设备，而是根据是否为爬虫。',
                2: '不是根据权限，而是根据User-Agent。',
                3: '动态加载组件是代码分割，不是动态渲染。'
            }
        },
        tags: ['动态渲染', 'Dynamic Rendering', 'SEO', '爬虫检测']
    },

    // 性能与Core Web Vitals (41-50)
    {
        id: 41,
        type: 'single',
        question: 'Core Web Vitals包括哪三个指标？',
        options: [
            'FCP、TTI、TBT',
            'LCP、FID、CLS',
            'TTFB、SI、TTI',
            'FP、FCP、LCP'
        ],
        answer: [1],
        explanation: {
            correct: 'Core Web Vitals是Google的核心性能指标，影响搜索排名：1) LCP（Largest Contentful Paint）：最大内容绘制，应<2.5s；2) FID（First Input Delay）：首次输入延迟，应<100ms；3) CLS（Cumulative Layout Shift）：累积布局偏移，应<0.1。',
            wrong: {
                0: 'FCP、TTI、TBT是重要指标，但不是Core Web Vitals三大核心。',
                2: 'TTFB、SI、TTI也是性能指标，但不是Core Web Vitals。',
                3: 'FP、FCP、LCP都是绘制指标，但只有LCP是Core Web Vitals之一。'
            }
        },
        tags: ['Core Web Vitals', 'LCP', 'FID', 'CLS', 'SEO', '性能']
    },
    {
        id: 42,
        type: 'single',
        question: 'LCP（Largest Contentful Paint）测量的是什么？',
        options: [
            '页面完全加载的时间',
            '最大内容元素（图片、视频、文本块）渲染的时间',
            '首次渲染的时间',
            '交互就绪的时间'
        ],
        answer: [1],
        explanation: {
            correct: 'LCP测量视口内最大的内容元素何时渲染。通常是：大图片、视频、大的文本块。代表用户感知的加载速度。优化：1) 优化图片（压缩、懒加载、CDN）；2) 减少渲染阻塞资源；3) 优化服务器响应。',
            wrong: {
                0: '完全加载是Load事件，LCP关注主要内容。',
                2: '首次渲染是FCP（First Contentful Paint），不是LCP。',
                3: '交互就绪是TTI（Time to Interactive）或FID，不是LCP。'
            }
        },
        tags: ['LCP', 'Largest Contentful Paint', 'Core Web Vitals', '性能']
    },
    {
        id: 43,
        type: 'judge',
        question: 'FID（First Input Delay）在实验室环境（Lighthouse）中可以直接测量。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: 'FID只能在真实用户访问时测量（需要用户交互）。实验室工具用TBT（Total Blocking Time）作为FID的替代指标。FID测量用户首次交互（点击、点击、按键）到浏览器响应的延迟。优化：减少长任务，优化JavaScript。',
            wrong: {
                0: 'FID需要真实用户交互，实验室环境用TBT替代。'
            }
        },
        tags: ['FID', 'First Input Delay', 'Core Web Vitals', 'TBT']
    },
    {
        id: 44,
        type: 'single',
        question: 'CLS（Cumulative Layout Shift）测量的是什么？',
        options: [
            '页面加载时间',
            '布局稳定性，意外的布局偏移',
            '样式表大小',
            'CSS动画性能'
        ],
        answer: [1],
        explanation: {
            correct: 'CLS测量页面生命周期中所有意外布局偏移的累积。常见原因：1) 无尺寸的图片；2) 动态插入的内容；3) Web字体加载导致文本闪烁；4) 异步加载的广告。优化：为图片/视频预留空间（width/height或aspect-ratio），避免在现有内容上方插入内容。',
            wrong: {
                0: '加载时间是LCP、FCP等，不是CLS。',
                2: 'CLS不测量大小，而是测量意外移动。',
                3: 'CSS动画性能与CLS无关，只要不是意外偏移。'
            }
        },
        tags: ['CLS', 'Cumulative Layout Shift', 'Core Web Vitals', '布局稳定性']
    },
    {
        id: 45,
        type: 'multiple',
        question: '优化LCP的方法包括哪些？（多选）',
        options: [
            '优化图片（压缩、WebP、懒加载）',
            '使用CDN',
            '预加载关键资源',
            '使用更多的JavaScript库'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：减少图片加载时间。选项B：CDN加速资源传输。选项C：<link rel="preload">提前加载关键资源（如LCP图片、字体）。',
            wrong: {
                3: '更多JavaScript库会增加加载时间，恶化LCP。应该减少不必要的JavaScript。'
            }
        },
        tags: ['LCP', '性能优化', 'CDN', '预加载', '图片优化']
    },
    {
        id: 46,
        type: 'single',
        question: '什么是INP（Interaction to Next Paint）？',
        options: [
            '页面首次绘制时间',
            '测量用户交互到下次绘制的延迟',
            '网络延迟',
            '图片加载时间'
        ],
        answer: [1],
        explanation: {
            correct: 'INP是新的Core Web Vitals指标（将替代FID），测量页面对用户交互的整体响应性。不仅看首次交互，而是看所有交互。应<200ms。优化：减少JavaScript执行时间，优化事件处理器，使用useTransition等并发特性。',
            wrong: {
                0: '首次绘制是FCP，不是INP。',
                2: 'INP不是网络延迟，而是交互响应性。',
                3: 'INP不涉及图片加载，而是交互响应。'
            }
        },
        tags: ['INP', 'Interaction to Next Paint', 'Core Web Vitals', '交互性能']
    },
    {
        id: 47,
        type: 'judge',
        question: '所有图片都应该使用懒加载以优化性能。',
        options: ['正确', '错误'],
        answer: [1],
        explanation: {
            correct: '不是所有图片都应该懒加载。首屏图片（特别是LCP图片）不应该懒加载，否则会延迟显示，恶化LCP。应该：1) 首屏图片立即加载；2) 首屏下方图片懒加载（loading="lazy"）；3) LCP图片可以预加载。',
            wrong: {
                0: '首屏图片不应该懒加载，会恶化性能感知。只对首屏以下的图片使用懒加载。'
            }
        },
        tags: ['懒加载', '图片优化', 'LCP', '性能', '最佳实践']
    },
    {
        id: 48,
        type: 'single',
        question: '为图片设置width和height属性的主要作用是什么？',
        options: [
            '控制图片显示大小',
            '防止CLS，浏览器预留空间',
            '加快图片加载',
            '压缩图片'
        ],
        answer: [1],
        explanation: {
            correct: '设置width和height让浏览器在图片加载前就知道尺寸，预留空间，避免加载后导致布局偏移（CLS）。现代浏览器会根据width、height计算aspect-ratio。即使用CSS调整大小，也应该设置这些属性。',
            wrong: {
                0: '虽然会影响显示大小，但主要作用是防止CLS，可以用CSS覆盖。',
                2: '不加快加载，而是改善加载过程中的体验。',
                3: '不压缩图片，压缩需要其他工具。'
            }
        },
        tags: ['图片', 'width', 'height', 'CLS', '布局稳定性']
    },
    {
        id: 49,
        type: 'multiple',
        question: '以下哪些会导致CLS（布局偏移）？（多选）',
        options: [
            '没有设置尺寸的图片加载',
            '动态插入的广告',
            'Web字体加载导致的文本重排',
            '平滑的CSS动画'
        ],
        answer: [0, 1, 2],
        explanation: {
            correct: '选项A：图片加载后撑开空间。选项B：广告插入推动内容。选项C：fallback字体到Web字体的切换导致尺寸变化。这些都是意外偏移。',
            wrong: {
                3: '平滑的CSS动画不算CLS，只要是预期的、用户触发的变化。CLS只计算意外的偏移。'
            }
        },
        tags: ['CLS', '布局偏移', '原因', '性能问题']
    },
    {
        id: 50,
        type: 'single',
        question: '使用font-display: swap的效果是什么？',
        options: [
            '立即显示fallback字体，Web字体加载后切换',
            '阻塞渲染直到Web字体加载',
            '隐藏文本直到Web字体加载',
            '禁用Web字体'
        ],
        answer: [0],
        explanation: {
            correct: 'font-display: swap让文本立即以fallback字体显示，Web字体加载完成后切换。好处：更快的FCP。缺点：可能导致CLS（如果字体尺寸差异大）。其他值：block（阻塞）、optional（网络慢时放弃）。选择取决于品牌和性能的平衡。',
            wrong: {
                1: '阻塞是font-display: block，不是swap。',
                2: '隐藏是默认行为的一部分，swap会立即显示。',
                3: 'swap不禁用Web字体，而是优化加载体验。'
            }
        },
        tags: ['font-display', 'Web字体', 'FCP', 'CLS', '性能优化']
    }
];

