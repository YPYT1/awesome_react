# GraphQL Codegen代码生成

## 概述

GraphQL Code Generator是一个强大的工具,可以根据GraphQL Schema和操作自动生成TypeScript类型定义、React Hooks等代码。它能够提供完整的类型安全,减少手写代码,提高开发效率。本文将详细介绍GraphQL Codegen的使用方法。

## 安装和配置

### 安装依赖

```bash
npm install -D @graphql-codegen/cli
npm install -D @graphql-codegen/typescript
npm install -D @graphql-codegen/typescript-operations
npm install -D @graphql-codegen/typescript-react-apollo
```

### 基础配置

```yaml
# codegen.yml
schema: "https://api.example.com/graphql"

documents:
  - "src/**/*.{ts,tsx}"
  - "!src/generated/**/*"

generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
    
    config:
      withHooks: true
      withHOC: false
      withComponent: false
```

### package.json脚本

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.yml",
    "codegen:watch": "graphql-codegen --config codegen.yml --watch"
  }
}
```

## 类型生成

### Schema类型

```graphql
# schema.graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  published: Boolean!
}
```

生成的TypeScript类型：

```typescript
// generated/graphql.ts
export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  email: Scalars['String'];
  age?: Maybe<Scalars['Int']>;
  posts: Array<Post>;
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['ID'];
  title: Scalars['String'];
  content: Scalars['String'];
  author: User;
  published: Scalars['Boolean'];
};
```

### 操作类型

```graphql
# queries.graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    id
    title
    content
    author {
      id
      name
    }
  }
}
```

生成的TypeScript类型：

```typescript
// generated/graphql.ts
export type GetUserQueryVariables = Exact<{
  id: Scalars['ID'];
}>;

export type GetUserQuery = {
  __typename?: 'Query';
  user?: {
    __typename?: 'User';
    id: string;
    name: string;
    email: string;
    posts: Array<{
      __typename?: 'Post';
      id: string;
      title: string;
    }>;
  } | null;
};

export type CreatePostMutationVariables = Exact<{
  input: CreatePostInput;
}>;

export type CreatePostMutation = {
  __typename?: 'Mutation';
  createPost: {
    __typename?: 'Post';
    id: string;
    title: string;
    content: string;
    author: {
      __typename?: 'User';
      id: string;
      name: string;
    };
  };
};
```

## Hook生成

### 查询Hook

```tsx
import { gql } from '@apollo/client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

// 生成的Hook
import { useGetUserQuery } from './generated/graphql';

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useGetUserQuery({
    variables: { id: userId },
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // 完整的类型支持
  const user = data?.user;
  
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.email}</p>
      <ul>
        {user?.posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Mutation Hook

```tsx
const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      author {
        id
        name
      }
    }
  }
`;

// 生成的Hook
import { useCreatePostMutation } from './generated/graphql';

function CreatePostForm() {
  const [createPost, { data, loading, error }] = useCreatePostMutation();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    
    await createPost({
      variables: {
        input: {
          title: formData.get('title') as string,
          content: formData.get('content') as string,
        },
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Post'}
      </button>
      
      {error && <div className="error">{error.message}</div>}
      {data && <div className="success">Post created: {data.createPost.title}</div>}
    </form>
  );
}
```

## 片段(Fragments)

### 定义片段

```graphql
# fragments.graphql
fragment UserFields on User {
  id
  name
  email
}

fragment PostFields on Post {
  id
  title
  content
  author {
    ...UserFields
  }
}

query GetPosts {
  posts {
    ...PostFields
  }
}
```

### 生成的片段类型

```typescript
// generated/graphql.ts
export type UserFieldsFragment = {
  __typename?: 'User';
  id: string;
  name: string;
  email: string;
};

export type PostFieldsFragment = {
  __typename?: 'Post';
  id: string;
  title: string;
  content: string;
  author: UserFieldsFragment;
};

export type GetPostsQuery = {
  __typename?: 'Query';
  posts: Array<PostFieldsFragment>;
};
```

### 使用片段

```tsx
import { UserFieldsFragment, PostFieldsFragment } from './generated/graphql';

function PostCard({ post }: { post: PostFieldsFragment }) {
  return (
    <article>
      <h2>{post.title}</h2>
      <p>{post.content}</p>
      <UserInfo user={post.author} />
    </article>
  );
}

function UserInfo({ user }: { user: UserFieldsFragment }) {
  return (
    <div className="user-info">
      <span>{user.name}</span>
      <span>{user.email}</span>
    </div>
  );
}
```

## 高级配置

### 自定义标量

```yaml
# codegen.yml
schema: "https://api.example.com/graphql"

generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
    
    config:
      scalars:
        DateTime: Date
        JSON: "{ [key: string]: any }"
        Upload: File
```

生成的类型：

```typescript
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  JSON: { [key: string]: any };
  Upload: File;
};
```

### 命名转换

```yaml
config:
  # 枚举值转换为大写
  enumsAsConst: true
  
  # 类型前缀
  typesPrefix: I
  
  # 类型后缀
  typesSuffix: Type
  
  # 字段命名转换
  namingConvention:
    typeNames: pascal-case#pascalCase
    enumValues: upper-case#upperCase
```

### 多个输出

```yaml
generates:
  # TypeScript类型
  src/generated/types.ts:
    plugins:
      - typescript
  
  # 操作类型
  src/generated/operations.ts:
    plugins:
      - typescript-operations
    config:
      skipTypename: true
  
  # React Hooks
  src/generated/hooks.ts:
    plugins:
      - typescript-react-apollo
    config:
      withHooks: true
      withComponent: false
```

## 代码生成策略

### Near-operation-file

```yaml
# codegen.yml
schema: "https://api.example.com/graphql"

documents:
  - "src/**/*.graphql"

generates:
  src/:
    preset: near-operation-file
    presetConfig:
      baseTypesPath: generated/types.ts
      extension: .generated.tsx
    plugins:
      - typescript-operations
      - typescript-react-apollo
```

目录结构：

```
src/
  components/
    UserProfile.tsx
    UserProfile.graphql
    UserProfile.generated.tsx  # 生成的文件
  generated/
    types.ts
```

使用：

```tsx
// UserProfile.tsx
import { useGetUserQuery } from './UserProfile.generated';

function UserProfile({ userId }: { userId: string }) {
  const { data, loading } = useGetUserQuery({
    variables: { id: userId },
  });
  
  if (loading) return <div>Loading...</div>;
  
  return <div>{data?.user?.name}</div>;
}
```

### 插件链

```yaml
generates:
  src/generated/graphql.ts:
    plugins:
      # 1. 基础类型
      - typescript
      
      # 2. 操作类型
      - typescript-operations
      
      # 3. React Apollo Hooks
      - typescript-react-apollo
      
      # 4. 自定义插件
      - add:
          content: "// Generated at: {{timestamp}}"
```

## 验证和Lint

### Schema验证

```yaml
# codegen.yml
schema: 
  - "https://api.example.com/graphql"

generates:
  ./schema-check.ts:
    plugins:
      - schema-ast

hooks:
  afterAllFileWrite:
    - prettier --write
    - eslint --fix
```

### 操作验证

```bash
npm install -D @graphql-codegen/cli
npm install -D @graphql-inspector/cli
```

```json
{
  "scripts": {
    "validate": "graphql-inspector validate 'src/**/*.graphql' 'https://api.example.com/graphql'"
  }
}
```

## 实战示例

### 完整配置

```yaml
# codegen.yml
overwrite: true

schema:
  - "https://api.example.com/graphql":
      headers:
        Authorization: "Bearer ${API_TOKEN}"

documents:
  - "src/**/*.{ts,tsx}"
  - "!src/generated/**/*"

generates:
  # 生成类型定义
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
    
    config:
      # React Apollo配置
      withHooks: true
      withHOC: false
      withComponent: false
      
      # 类型配置
      skipTypename: false
      enumsAsTypes: false
      
      # 命名配置
      namingConvention:
        typeNames: pascal-case#pascalCase
        enumValues: upper-case#upperCase
      
      # 自定义标量
      scalars:
        DateTime: Date
        JSON: "Record<string, any>"
      
      # 导入配置
      importTypes:
        - "@apollo/client#ApolloError"
      
      # 默认值
      defaultBaseOptions:
        query:
          fetchPolicy: "cache-first"
        mutation:
          errorPolicy: "all"

hooks:
  afterAllFileWrite:
    - prettier --write
    - eslint --fix
```

### 使用示例

```tsx
// UserList.tsx
import { gql } from '@apollo/client';
import { useGetUsersQuery, User } from './generated/graphql';

const GET_USERS = gql`
  query GetUsers($limit: Int) {
    users(limit: $limit) {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

function UserList() {
  const { data, loading, error, refetch } = useGetUsersQuery({
    variables: { limit: 10 },
  });
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <button onClick={() => refetch()}>Refresh</button>
      
      <ul>
        {data?.users.map(user => (
          <UserItem key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
}

function UserItem({ user }: { user: User }) {
  return (
    <li>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <span>{user.posts.length} posts</span>
    </li>
  );
}
```

## CI/CD集成

### GitHub Actions

```yaml
# .github/workflows/codegen.yml
name: GraphQL Codegen

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  codegen:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Codegen
        run: npm run codegen
        env:
          API_TOKEN: ${{ secrets.API_TOKEN }}
      
      - name: Check for changes
        run: |
          if [[ -n $(git status -s) ]]; then
            echo "Generated files have changes!"
            git diff
            exit 1
          fi
```

### Pre-commit Hook

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run codegen && git add src/generated"
    }
  }
}
```

## 总结

GraphQL Codegen核心特性：

1. **类型生成**：Schema类型、操作类型
2. **Hook生成**：Query Hooks、Mutation Hooks
3. **片段支持**：Fragment定义、Fragment类型
4. **高级配置**：自定义标量、命名转换
5. **代码策略**：Near-operation-file、插件链
6. **验证Lint**：Schema验证、操作验证
7. **CI/CD**：自动化生成、版本控制

GraphQL Codegen提供了完整的类型安全,是GraphQL + TypeScript的最佳实践。

## 第四部分：GraphQL Codegen高级配置

### 4.1 自定义标量类型

```yaml
# codegen.yml
schema: './schema.graphql'
generates:
  ./src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
    config:
      # 自定义标量映射
      scalars:
        DateTime: string
        Date: string
        Time: string
        JSON: '{ [key: string]: any }'
        Upload: File
        BigInt: string
        Decimal: string
        UUID: string
        Email: string
        URL: string
      # 使用自定义类型
      customScalars:
        DateTime: 
          input: Date
          output: Date
        Money:
          input: number
          output: string
```

```typescript
// 自定义标量定义
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: Date;
  JSON: { [key: string]: any };
  Upload: File;
  Email: string;
  URL: string;
};

// 使用自定义标量
interface User {
  id: Scalars['ID'];
  email: Scalars['Email'];
  createdAt: Scalars['DateTime'];
  metadata: Scalars['JSON'];
}
```

### 4.2 高级插件配置

```yaml
# codegen.yml
generates:
  ./src/generated/graphql.ts:
    plugins:
      # 1. TypeScript核心插件
      - typescript:
          # 避免命名冲突
          avoidOptionals: false
          # 使用接口而非类型
          declarationKind: 'interface'
          # 枚举作为常量
          enumsAsConst: true
          # 只读数组
          immutableTypes: true
          # 不生成Maybe类型
          maybeValue: 'T | null'
          # 非空标记
          nonOptionalTypename: true
          
      # 2. Operations插件
      - typescript-operations:
          # 添加__typename
          preResolveTypes: true
          # 扁平化片段
          inlineFragmentTypes: 'combine'
          # 数组去重
          dedupeFragments: true
          # 省略类型名称
          omitOperationSuffix: true
          
      # 3. React Apollo插件
      - typescript-react-apollo:
          # 使用类型导入
          useTypeImports: true
          # 生成HOC
          withHOC: false
          # 生成Hooks
          withHooks: true
          # 生成Component
          withComponent: false
          # Hook后缀
          hooksSuffix: 'Query'
          # 添加文档节点
          addDocBlocks: true
          
      # 4. 验证插件
      - typescript-validation-schema:
          # 使用Zod
          schema: zod
          # 导入位置
          importFrom: './types'
          # 验证指令
          directives:
            constraint: true
```

### 4.3 Near-operation-file策略

```yaml
# codegen.yml - 就近生成策略
schema: './schema.graphql'
documents: './src/**/*.graphql'
generates:
  ./src/generated/graphql.ts:
    plugins:
      - typescript
    preset: near-operation-file
    presetConfig:
      # 生成文件的扩展名
      extension: .generated.ts
      # 基础类型导入路径
      baseTypesPath: ~@/generated/graphql
      # 文件夹深度
      folder: __generated__
    plugins:
      - typescript-operations
      - typescript-react-apollo
```

```
项目结构：
src/
  components/
    User/
      User.tsx
      User.graphql
      __generated__/
        User.generated.ts
    Post/
      Post.tsx
      Post.graphql
      __generated__/
        Post.generated.ts
  generated/
    graphql.ts (基础类型)
```

### 4.4 片段组合和继承

```graphql
# 基础片段
fragment UserBase on User {
  id
  name
  email
}

# 扩展片段
fragment UserWithPosts on User {
  ...UserBase
  posts {
    id
    title
  }
}

# 深度嵌套片段
fragment PostWithAuthor on Post {
  id
  title
  author {
    ...UserBase
  }
  comments {
    id
    text
    author {
      ...UserBase
    }
  }
}
```

```yaml
# codegen.yml
generates:
  ./src/generated/graphql.ts:
    config:
      # 片段遮罩
      fragmentMasking: true
      # 片段变量
      fragmentVariables: true
      # 全局片段
      globalFragments: true
```

```typescript
// 生成的类型
export type UserBaseFragment = {
  __typename?: 'User';
  id: string;
  name: string;
  email: string;
};

export type UserWithPostsFragment = {
  __typename?: 'User';
  posts: Array<{
    __typename?: 'Post';
    id: string;
    title: string;
  }>;
} & UserBaseFragment;

// 使用片段
function UserProfile() {
  const { data } = useUserWithPostsQuery();
  const user: UserWithPostsFragment = data?.user;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <ul>
        {user.posts.map(post => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 4.5 多Schema整合

```yaml
# codegen.yml
schema:
  # 多个Schema源
  - http://localhost:4000/graphql:
      headers:
        Authorization: Bearer ${API_TOKEN}
  - ./local-schema.graphql
  - https://api.example.com/graphql

generates:
  # 分别生成类型
  ./src/generated/api1.ts:
    schema: http://localhost:4000/graphql
    plugins:
      - typescript
      - typescript-operations
      
  ./src/generated/api2.ts:
    schema: https://api.example.com/graphql
    plugins:
      - typescript
      - typescript-operations

  # 合并生成
  ./src/generated/combined.ts:
    schema:
      - http://localhost:4000/graphql
      - https://api.example.com/graphql
    plugins:
      - typescript
    config:
      # 避免类型冲突
      namingConvention:
        typeNames: pascal-case#pascalCase
        enumValues: upper-case#upperCase
      # 添加前缀
      typesPrefix: 'I'
      # 添加后缀
      typesSuffix: 'Type'
```

### 4.6 代码生成优化

```yaml
# codegen.yml
schema: './schema.graphql'
documents: './src/**/*.graphql'
config:
  # 1. 性能优化
  skipTypename: false
  skipDocumentsValidation: false
  
  # 2. 树摇优化
  onlyOperationTypes: true
  preResolveTypes: false
  
  # 3. 并发生成
  numericEnums: true
  
generates:
  ./src/generated/:
    preset: client
    presetConfig:
      # 按需导入
      gqlTagName: 'gql'
      # 懒加载
      lazy: true
    plugins:
      - typescript
      - typescript-operations
    config:
      # 优化导入
      useTypeImports: true
      # 去除未使用类型
      onlyOperationTypes: true
      # 合并片段
      inlineFragmentTypes: 'combine'
```

```typescript
// 优化后的使用
import { gql } from './generated';
import type { UserQuery, UserQueryVariables } from './generated/graphql';

// 自动类型推断
const USER_QUERY = gql(`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`);

// 完全类型安全
const { data } = useQuery<UserQuery, UserQueryVariables>(USER_QUERY, {
  variables: { id: '1' }
});
```

### 4.7 Watc模式和CI/CD集成

```json
// package.json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.yml",
    "codegen:watch": "graphql-codegen --config codegen.yml --watch",
    "codegen:check": "graphql-codegen --config codegen.yml --check",
    "pre-commit": "npm run codegen:check",
    "pre-push": "npm run codegen && git add src/generated/"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run pre-commit",
      "pre-push": "npm run pre-push"
    }
  }
}
```

```yaml
# .github/workflows/codegen.yml
name: GraphQL Codegen

on:
  pull_request:
    paths:
      - '**/*.graphql'
      - 'schema.graphql'
      - 'codegen.yml'

jobs:
  codegen:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run codegen
        run: npm run codegen
        
      - name: Check for changes
        run: |
          git diff --exit-code src/generated/ || \
          (echo "Generated files are out of date. Please run 'npm run codegen'" && exit 1)
          
      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: codegen-diff
          path: src/generated/
```

### 4.8 自定义插件开发

```typescript
// my-custom-plugin.ts
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers';

export const plugin: PluginFunction = (
  schema,
  documents,
  config
) => {
  return {
    prepend: [
      '// Generated by custom plugin',
      '// DO NOT EDIT'
    ],
    content: documents
      .map(doc => {
        // 自定义代码生成逻辑
        const operations = doc.document?.definitions || [];
        
        return operations
          .filter(def => def.kind === 'OperationDefinition')
          .map(op => {
            const name = op.name?.value;
            return `export const ${name}Document = gql\`${op}\`;`;
          })
          .join('\n');
      })
      .join('\n')
  };
};

export default { plugin };
```

```yaml
# codegen.yml
generates:
  ./src/generated/custom.ts:
    plugins:
      - ./my-custom-plugin.ts
    config:
      customConfig: value
```

## GraphQL Codegen最佳实践总结

```
1. 类型安全
   ✅ 完整Schema类型
   ✅ 操作类型生成
   ✅ 片段类型继承
   ✅ 自定义标量映射

2. 代码组织
   ✅ Near-operation-file
   ✅ 按需生成
   ✅ 模块化配置
   ✅ 命名规范

3. 性能优化
   ✅ 树摇优化
   ✅ 类型导入
   ✅ 片段合并
   ✅ 并发生成

4. 工程化
   ✅ Watch模式
   ✅ CI/CD集成
   ✅ Git Hooks
   ✅ 版本控制

5. 扩展性
   ✅ 自定义插件
   ✅ 多Schema支持
   ✅ 验证集成
   ✅ 高级配置
```

GraphQL Codegen是TypeScript + GraphQL项目的必备工具，极大提升了开发效率和类型安全性。
