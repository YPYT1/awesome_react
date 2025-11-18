# Remix Action 表单处理

## 课程概述

本课程深入讲解Remix的Action和表单处理机制。Remix通过原生HTML表单增强和Server Action提供了优雅的数据提交方案,支持渐进增强和无JavaScript工作。

学习目标:
- 掌握Remix Action基础
- 理解表单提交机制
- 学习数据验证
- 掌握错误处理
- 理解重定向策略
- 学习文件上传
- 掌握乐观UI
- 构建完整的表单系统

---

## 一、Action 基础

### 1.1 什么是Action

```typescript
// Action 处理表单提交和数据修改
// - 只在服务器端运行
// - 处理 POST, PUT, PATCH, DELETE 请求
// - 返回数据或重定向

// app/routes/contact.tsx
import { json, redirect, ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const name = formData.get("name")
  const email = formData.get("email")
  const message = formData.get("message")
  
  // 保存数据
  await sendEmail({ name, email, message })
  
  // 重定向到成功页面
  return redirect("/contact/success")
}

export default function Contact() {
  return (
    <Form method="post">
      <div>
        <label>Name:</label>
        <input type="text" name="name" required />
      </div>
      
      <div>
        <label>Email:</label>
        <input type="email" name="email" required />
      </div>
      
      <div>
        <label>Message:</label>
        <textarea name="message" required />
      </div>
      
      <button type="submit">Send Message</button>
    </Form>
  )
}
```

### 1.2 Form 组件

```typescript
// Form 组件提供客户端增强
import { Form } from "@remix-run/react"

export default function MyForm() {
  return (
    // 使用 Form 组件 (客户端增强)
    <Form method="post">
      <input type="text" name="title" />
      <button type="submit">Submit</button>
    </Form>
    
    // vs 原生 form (无 JavaScript 也能工作)
    // <form method="post">
    //   <input type="text" name="title" />
    //   <button type="submit">Submit</button>
    // </form>
  )
}
```

### 1.3 useActionData

```typescript
// app/routes/posts.new.tsx
import { json, redirect, ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"

interface ActionData {
  errors?: {
    title?: string
    content?: string
  }
  values?: {
    title: string
    content: string
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  
  const errors: ActionData['errors'] = {}
  
  if (!title) {
    errors.title = "Title is required"
  }
  
  if (!content) {
    errors.content = "Content is required"
  }
  
  if (Object.keys(errors).length > 0) {
    return json<ActionData>({
      errors,
      values: { title, content }
    }, { status: 400 })
  }
  
  const post = await createPost({ title, content })
  return redirect(`/posts/${post.id}`)
}

export default function NewPost() {
  const actionData = useActionData<typeof action>()
  
  return (
    <Form method="post">
      <h1>Create New Post</h1>
      
      <div>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          defaultValue={actionData?.values?.title}
        />
        {actionData?.errors?.title && (
          <p style={{ color: 'red' }}>{actionData.errors.title}</p>
        )}
      </div>
      
      <div>
        <label>Content:</label>
        <textarea
          name="content"
          defaultValue={actionData?.values?.content}
        />
        {actionData?.errors?.content && (
          <p style={{ color: 'red' }}>{actionData.errors.content}</p>
        )}
      </div>
      
      <button type="submit">Create Post</button>
    </Form>
  )
}
```

---

## 二、数据验证

### 2.1 基础验证

```typescript
// app/routes/register.tsx
import { json, redirect, ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"

interface ActionData {
  errors?: {
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  
  const errors: ActionData['errors'] = {}
  
  // 验证姓名
  if (!name || name.length < 2) {
    errors.name = "Name must be at least 2 characters"
  }
  
  // 验证邮箱
  if (!email || !email.includes("@")) {
    errors.email = "Valid email is required"
  }
  
  // 验证密码
  if (!password || password.length < 8) {
    errors.password = "Password must be at least 8 characters"
  }
  
  // 验证密码确认
  if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords don't match"
  }
  
  // 检查邮箱是否已存在
  const existingUser = await db.user.findUnique({ where: { email } })
  if (existingUser) {
    errors.email = "Email already in use"
  }
  
  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors }, { status: 400 })
  }
  
  // 创建用户
  await createUser({ name, email, password })
  return redirect("/login?registered=true")
}

export default function Register() {
  const actionData = useActionData<typeof action>()
  
  return (
    <Form method="post" className="form">
      <h1>Register</h1>
      
      <div className="form-group">
        <label>Name:</label>
        <input type="text" name="name" required />
        {actionData?.errors?.name && (
          <p className="error">{actionData.errors.name}</p>
        )}
      </div>
      
      <div className="form-group">
        <label>Email:</label>
        <input type="email" name="email" required />
        {actionData?.errors?.email && (
          <p className="error">{actionData.errors.email}</p>
        )}
      </div>
      
      <div className="form-group">
        <label>Password:</label>
        <input type="password" name="password" required />
        {actionData?.errors?.password && (
          <p className="error">{actionData.errors.password}</p>
        )}
      </div>
      
      <div className="form-group">
        <label>Confirm Password:</label>
        <input type="password" name="confirmPassword" required />
        {actionData?.errors?.confirmPassword && (
          <p className="error">{actionData.errors.confirmPassword}</p>
        )}
      </div>
      
      <button type="submit">Register</button>
    </Form>
  )
}
```

### 2.2 使用 Zod 验证

```bash
npm install zod
```

```typescript
// lib/validation.ts
import { z } from "zod"

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.enum(["tech", "lifestyle", "business"]),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(false)
})

export type PostInput = z.infer<typeof postSchema>

// app/routes/posts.new.tsx
import { json, redirect, ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import { postSchema } from "~/lib/validation"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  
  const data = {
    title: formData.get("title"),
    content: formData.get("content"),
    category: formData.get("category"),
    tags: formData.getAll("tags"),
    published: formData.get("published") === "on"
  }
  
  // Zod 验证
  const result = postSchema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return json({ errors }, { status: 400 })
  }
  
  // 数据已验证,安全使用
  const post = await createPost(result.data)
  return redirect(`/posts/${post.id}`)
}

export default function NewPost() {
  const actionData = useActionData<typeof action>()
  
  return (
    <Form method="post">
      <h1>Create Post</h1>
      
      <div>
        <label>Title:</label>
        <input type="text" name="title" required />
        {actionData?.errors?.title && (
          <p className="error">{actionData.errors.title[0]}</p>
        )}
      </div>
      
      <div>
        <label>Content:</label>
        <textarea name="content" required />
        {actionData?.errors?.content && (
          <p className="error">{actionData.errors.content[0]}</p>
        )}
      </div>
      
      <div>
        <label>Category:</label>
        <select name="category" required>
          <option value="">Select...</option>
          <option value="tech">Tech</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="business">Business</option>
        </select>
        {actionData?.errors?.category && (
          <p className="error">{actionData.errors.category[0]}</p>
        )}
      </div>
      
      <div>
        <label>
          <input type="checkbox" name="published" />
          Publish immediately
        </label>
      </div>
      
      <button type="submit">Create Post</button>
    </Form>
  )
}
```

---

## 三、更新和删除

### 3.1 编辑表单

```typescript
// app/routes/posts.$id.edit.tsx
import { json, redirect, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node"
import { Form, useLoaderData, useActionData } from "@remix-run/react"

export async function loader({ params }: LoaderFunctionArgs) {
  const post = await db.post.findUnique({
    where: { id: params.id }
  })
  
  if (!post) {
    throw new Response("Not found", { status: 404 })
  }
  
  return json({ post })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent")
  
  if (intent === "delete") {
    await db.post.delete({ where: { id: params.id } })
    return redirect("/posts")
  }
  
  // 更新
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  
  const errors: any = {}
  
  if (!title) errors.title = "Title is required"
  if (!content) errors.content = "Content is required"
  
  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 })
  }
  
  await db.post.update({
    where: { id: params.id },
    data: { title, content }
  })
  
  return redirect(`/posts/${params.id}`)
}

export default function EditPost() {
  const { post } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  
  return (
    <div>
      <h1>Edit Post</h1>
      
      <Form method="post">
        <div>
          <label>Title:</label>
          <input
            type="text"
            name="title"
            defaultValue={post.title}
            required
          />
          {actionData?.errors?.title && (
            <p className="error">{actionData.errors.title}</p>
          )}
        </div>
        
        <div>
          <label>Content:</label>
          <textarea
            name="content"
            defaultValue={post.content}
            required
          />
          {actionData?.errors?.content && (
            <p className="error">{actionData.errors.content}</p>
          )}
        </div>
        
        <div className="actions">
          <button type="submit">Save Changes</button>
          <button
            type="submit"
            name="intent"
            value="delete"
            className="danger"
            onClick={(e) => {
              if (!confirm("Are you sure?")) {
                e.preventDefault()
              }
            }}
          >
            Delete Post
          </button>
        </div>
      </Form>
    </div>
  )
}
```

### 3.2 多个Action

```typescript
// app/routes/posts.$id.tsx
import { json, redirect, ActionFunctionArgs } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent")
  
  switch (intent) {
    case "publish": {
      await db.post.update({
        where: { id: params.id },
        data: { published: true }
      })
      return json({ success: true })
    }
    
    case "unpublish": {
      await db.post.update({
        where: { id: params.id },
        data: { published: false }
      })
      return json({ success: true })
    }
    
    case "delete": {
      await db.post.delete({
        where: { id: params.id }
      })
      return redirect("/posts")
    }
    
    case "like": {
      await db.post.update({
        where: { id: params.id },
        data: { likes: { increment: 1 } }
      })
      return json({ success: true })
    }
    
    default: {
      return json({ error: "Invalid intent" }, { status: 400 })
    }
  }
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>()
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      
      <div className="actions">
        <Form method="post">
          <button name="intent" value="like">
            👍 Like ({post.likes})
          </button>
        </Form>
        
        <Form method="post">
          <button
            name="intent"
            value={post.published ? "unpublish" : "publish"}
          >
            {post.published ? "Unpublish" : "Publish"}
          </button>
        </Form>
        
        <Form method="post">
          <button
            name="intent"
            value="delete"
            className="danger"
            onClick={(e) => {
              if (!confirm("Are you sure?")) e.preventDefault()
            }}
          >
            Delete
          </button>
        </Form>
      </div>
    </article>
  )
}
```

---

## 四、文件上传

### 4.1 基础文件上传

```typescript
// app/routes/posts.new.tsx
import { json, unstable_createFileUploadHandler, unstable_parseMultipartFormData, ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"

export async function action({ request }: ActionFunctionArgs) {
  const uploadHandler = unstable_createFileUploadHandler({
    maxPartSize: 5_000_000, // 5MB
    directory: "public/uploads",
    file: ({ filename }) => filename,
  })
  
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  )
  
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const image = formData.get("image") as File | null
  
  if (!image) {
    return json({ error: "Image is required" }, { status: 400 })
  }
  
  const post = await createPost({
    title,
    content,
    imagePath: `/uploads/${image.name}`
  })
  
  return redirect(`/posts/${post.id}`)
}

export default function NewPost() {
  const actionData = useActionData<typeof action>()
  
  return (
    <Form method="post" encType="multipart/form-data">
      <h1>Create Post</h1>
      
      <div>
        <label>Title:</label>
        <input type="text" name="title" required />
      </div>
      
      <div>
        <label>Content:</label>
        <textarea name="content" required />
      </div>
      
      <div>
        <label>Image:</label>
        <input
          type="file"
          name="image"
          accept="image/*"
          required
        />
      </div>
      
      {actionData?.error && (
        <p className="error">{actionData.error}</p>
      )}
      
      <button type="submit">Create Post</button>
    </Form>
  )
}
```

### 4.2 图片预览

```typescript
// app/routes/profile.edit.tsx
import { Form } from "@remix-run/react"
import { useState } from "react"

export default function EditProfile() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }
  
  return (
    <Form method="post" encType="multipart/form-data">
      <div>
        <label>Profile Picture:</label>
        <input
          type="file"
          name="avatar"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {previewUrl && (
          <div className="preview">
            <img src={previewUrl} alt="Preview" style={{ maxWidth: 200 }} />
          </div>
        )}
      </div>
      
      <button type="submit">Update Profile</button>
    </Form>
  )
}
```

---

## 五、乐观UI

### 5.1 useFetcher

```typescript
// app/routes/posts.$id.tsx
import { json, ActionFunctionArgs } from "@remix-run/node"
import { useFetcher, useLoaderData } from "@remix-run/react"

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent")
  
  if (intent === "like") {
    const post = await db.post.update({
      where: { id: params.id },
      data: { likes: { increment: 1 } }
    })
    return json({ likes: post.likes })
  }
  
  return json({ error: "Invalid intent" }, { status: 400 })
}

export default function Post() {
  const { post } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  
  // 乐观更新: 立即显示新值
  const likes = fetcher.formData 
    ? post.likes + 1 
    : fetcher.data?.likes ?? post.likes
  
  const isLiking = fetcher.state !== "idle"
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      
      <fetcher.Form method="post">
        <button
          name="intent"
          value="like"
          disabled={isLiking}
        >
          👍 {likes} {isLiking && "..."}
        </button>
      </fetcher.Form>
    </article>
  )
}
```

### 5.2 待办事项示例

```typescript
// app/routes/todos.tsx
import { json, ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData, useFetcher } from "@remix-run/react"

export async function loader() {
  const todos = await db.todo.findMany()
  return json({ todos })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent")
  const id = formData.get("id") as string
  
  if (intent === "toggle") {
    const todo = await db.todo.findUnique({ where: { id } })
    const updated = await db.todo.update({
      where: { id },
      data: { completed: !todo.completed }
    })
    return json({ todo: updated })
  }
  
  if (intent === "create") {
    const title = formData.get("title") as string
    const todo = await db.todo.create({
      data: { title, completed: false }
    })
    return json({ todo })
  }
  
  return json({ error: "Invalid intent" }, { status: 400 })
}

export default function Todos() {
  const { todos } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  
  return (
    <div>
      <h1>Todos</h1>
      
      {/* 新建待办 */}
      <fetcher.Form method="post">
        <input type="text" name="title" required />
        <button name="intent" value="create">
          Add Todo
        </button>
      </fetcher.Form>
      
      {/* 待办列表 */}
      <ul>
        {todos.map(todo => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  )
}

function TodoItem({ todo }: { todo: any }) {
  const fetcher = useFetcher()
  
  // 乐观更新
  const completed = fetcher.formData
    ? fetcher.formData.get("intent") === "toggle"
      ? !todo.completed
      : todo.completed
    : todo.completed
  
  return (
    <li>
      <fetcher.Form method="post">
        <input type="hidden" name="id" value={todo.id} />
        <label>
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => {
              fetcher.submit(e.currentTarget.form)
            }}
            name="intent"
            value="toggle"
          />
          <span style={{ textDecoration: completed ? 'line-through' : 'none' }}>
            {todo.title}
          </span>
        </label>
      </fetcher.Form>
    </li>
  )
}
```

---

## 六、实战案例

### 6.1 完整的CRUD博客

```typescript
// app/routes/blog.admin.tsx
import { json, ActionFunctionArgs } from "@remix-run/node"
import { useLoaderData, Form, Link } from "@remix-run/react"

export async function loader() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return json({ posts })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const id = formData.get("id") as string
  
  await db.post.delete({ where: { id } })
  
  return json({ success: true })
}

export default function BlogAdmin() {
  const { posts } = useLoaderData<typeof loader>()
  
  return (
    <div>
      <div className="header">
        <h1>Manage Posts</h1>
        <Link to="/blog/admin/new">Create New Post</Link>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td>{post.title}</td>
              <td>{post.published ? 'Published' : 'Draft'}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <Link to={`/blog/admin/${post.id}/edit`}>Edit</Link>
                <Form method="post" style={{ display: 'inline' }}>
                  <input type="hidden" name="id" value={post.id} />
                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!confirm("Are you sure?")) e.preventDefault()
                    }}
                  >
                    Delete
                  </button>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 七、最佳实践

### 7.1 渐进增强

```typescript
// 表单在没有 JavaScript 时也能工作
export default function ContactForm() {
  return (
    <Form method="post">
      <input type="text" name="name" required />
      <input type="email" name="email" required />
      <button type="submit">Submit</button>
    </Form>
  )
}
```

### 7.2 类型安全

```typescript
// 使用 TypeScript 确保类型安全
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)
  
  // 验证和类型转换
  const validated = schema.parse(data)
  
  return json({ success: true })
}
```

### 7.3 学习资源

1. 官方文档
   - Actions: https://remix.run/docs/en/main/route/action
   - Forms: https://remix.run/docs/en/main/components/form

2. 示例
   - Remix Examples
   - Remix Stacks

---

## 课后练习

1. 创建注册/登录表单
2. 实现CRUD操作
3. 添加文件上传功能
4. 实现乐观UI更新
5. 构建完整的表单系统

通过本课程的学习,你应该能够熟练使用Remix的Action和表单处理,构建交互丰富的Web应用!

