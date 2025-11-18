# 权限控制(RBAC) - 基于角色的访问控制完整指南

## 1. RBAC核心概念

### 1.1 什么是RBAC

RBAC(Role-Based Access Control)是一种基于角色的访问控制模型,通过将权限分配给角色,再将角色分配给用户,实现灵活的权限管理。

**核心组件:**
- **用户(User)**: 系统的使用者
- **角色(Role)**: 权限的集合
- **权限(Permission)**: 对资源的操作能力
- **资源(Resource)**: 需要保护的对象

**关系:**
```
用户 -> 角色 -> 权限 -> 资源
User -> Role -> Permission -> Resource
```

### 1.2 RBAC的优势

```typescript
// 传统ACL (Access Control List)
user1.permissions = ['user:read', 'user:write', 'post:read', 'post:write']
user2.permissions = ['user:read', 'user:write', 'post:read', 'post:write']
// 每个用户都要单独配置,维护困难

// RBAC
role_editor = ['user:read', 'post:read', 'post:write']
user1.roles = ['editor']
user2.roles = ['editor']
// 角色统一配置,用户只需分配角色
```

**优势:**
- **简化权限管理**: 通过角色批量分配权限
- **易于维护**: 修改角色权限,所有该角色用户自动更新
- **职责分离**: 符合最小权限原则
- **可扩展性**: 易于添加新角色和权限

### 1.3 RBAC模型分类

```typescript
// RBAC0 - 基础模型
User -> Role -> Permission

// RBAC1 - 角色继承
AdminRole extends EditorRole extends ViewerRole

// RBAC2 - 角色约束
- 互斥角色: 用户不能同时拥有会计和审计角色
- 基数约束: 最多3个管理员
- 先决条件: 必须是员工才能是经理

// RBAC3 - 统一模型 (RBAC1 + RBAC2)
```

## 2. 数据库模型设计

### 2.1 基础RBAC模型

```typescript
// models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: String,
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
```

```typescript
// models/Role.ts
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'editor', 'viewer', 'moderator']
  },
  displayName: String,
  description: String,
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  createdAt: { type: Date, default: Date.now }
});

export const Role = mongoose.model('Role', roleSchema);
```

```typescript
// models/Permission.ts
const permissionSchema = new mongoose.Schema({
  resource: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'manage']
  },
  description: String
});

// 唯一索引
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const Permission = mongoose.model('Permission', permissionSchema);
```

### 2.2 关系型数据库设计（PostgreSQL）

```sql
-- 用户表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 角色表
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  description TEXT,
  UNIQUE(resource, action)
);

-- 用户-角色关联表
CREATE TABLE user_roles (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

-- 角色-权限关联表
CREATE TABLE role_permissions (
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);
```

### 2.3 初始化权限数据

```typescript
// seeds/permissions.seed.ts
const permissions = [
  // 用户管理
  { resource: 'user', action: 'create', description: '创建用户' },
  { resource: 'user', action: 'read', description: '查看用户' },
  { resource: 'user', action: 'update', description: '更新用户' },
  { resource: 'user', action: 'delete', description: '删除用户' },
  { resource: 'user', action: 'manage', description: '管理用户' },
  
  // 文章管理
  { resource: 'post', action: 'create', description: '创建文章' },
  { resource: 'post', action: 'read', description: '查看文章' },
  { resource: 'post', action: 'update', description: '更新文章' },
  { resource: 'post', action: 'delete', description: '删除文章' },
  { resource: 'post', action: 'publish', description: '发布文章' },
  
  // 评论管理
  { resource: 'comment', action: 'create', description: '创建评论' },
  { resource: 'comment', action: 'read', description: '查看评论' },
  { resource: 'comment', action: 'update', description: '更新评论' },
  { resource: 'comment', action: 'delete', description: '删除评论' },
  { resource: 'comment', action: 'moderate', description: '审核评论' }
];

async function seedPermissions() {
  await Permission.insertMany(permissions);
  console.log('Permissions seeded');
}
```

```typescript
// seeds/roles.seed.ts
async function seedRoles() {
  // 获取权限
  const userRead = await Permission.findOne({ resource: 'user', action: 'read' });
  const postAll = await Permission.find({ resource: 'post' });
  const commentAll = await Permission.find({ resource: 'comment' });
  
  // 创建角色
  const viewer = await Role.create({
    name: 'viewer',
    displayName: '访客',
    description: '只能查看内容',
    permissions: [userRead?._id]
  });
  
  const editor = await Role.create({
    name: 'editor',
    displayName: '编辑',
    description: '可以管理文章',
    permissions: [
      userRead?._id,
      ...postAll.map(p => p._id)
    ]
  });
  
  const moderator = await Role.create({
    name: 'moderator',
    displayName: '版主',
    description: '可以审核评论',
    permissions: [
      userRead?._id,
      ...commentAll.map(p => p._id)
    ]
  });
  
  const admin = await Role.create({
    name: 'admin',
    displayName: '管理员',
    description: '拥有所有权限',
    permissions: await Permission.find().then(perms => perms.map(p => p._id))
  });
  
  console.log('Roles seeded');
}
```

## 3. 权限检查实现

### 3.1 权限检查服务

```typescript
// services/permission.service.ts
export class PermissionService {
  /**
   * 检查用户是否有指定权限
   */
  static async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const user = await User.findById(userId).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
    
    if (!user || !user.isActive) {
      return false;
    }
    
    // 检查所有角色的权限
    for (const role of user.roles) {
      const hasPermission = role.permissions.some(
        (perm: any) => perm.resource === resource && perm.action === action
      );
      
      if (hasPermission) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * 检查用户是否有角色
   */
  static async hasRole(userId: string, roleName: string): Promise<boolean> {
    const user = await User.findById(userId).populate('roles');
    
    if (!user || !user.isActive) {
      return false;
    }
    
    return user.roles.some((role: any) => role.name === roleName);
  }
  
  /**
   * 获取用户所有权限
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    const user = await User.findById(userId).populate({
      path: 'roles',
      populate: {
        path: 'permissions'
      }
    });
    
    if (!user) {
      return [];
    }
    
    const permissions = new Set<string>();
    
    for (const role of user.roles) {
      for (const perm of role.permissions) {
        permissions.add(`${perm.resource}:${perm.action}`);
      }
    }
    
    return Array.from(permissions);
  }
}
```

### 3.2 Express中间件

```typescript
// middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';

/**
 * 检查权限中间件
 */
export function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const hasPermission = await PermissionService.hasPermission(
      userId,
      resource,
      action
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `需要权限: ${resource}:${action}`
      });
    }
    
    next();
  };
}

/**
 * 检查角色中间件
 */
export function requireRole(roleName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const hasRole = await PermissionService.hasRole(userId, roleName);
    
    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `需要角色: ${roleName}`
      });
    }
    
    next();
  };
}

/**
 * 检查多个角色(任一)
 */
export function requireAnyRole(...roleNames: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    for (const roleName of roleNames) {
      const hasRole = await PermissionService.hasRole(userId, roleName);
      if (hasRole) {
        return next();
      }
    }
    
    return res.status(403).json({
      error: 'Forbidden',
      message: `需要以下任一角色: ${roleNames.join(', ')}`
    });
  };
}
```

### 3.3 路由使用示例

```typescript
// routes/posts.ts
import express from 'express';
import { requirePermission, requireRole } from '../middleware/auth.middleware';
import { authenticate } from '../middleware/authenticate';

const router = express.Router();

// 查看文章 - 所有人都可以
router.get('/', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// 创建文章 - 需要post:create权限
router.post('/',
  authenticate,
  requirePermission('post', 'create'),
  async (req, res) => {
    const post = await Post.create({
      ...req.body,
      authorId: req.user.id
    });
    res.json(post);
  }
);

// 更新文章 - 需要post:update权限
router.put('/:id',
  authenticate,
  requirePermission('post', 'update'),
  async (req, res) => {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(post);
  }
);

// 删除文章 - 需要admin角色
router.delete('/:id',
  authenticate,
  requireRole('admin'),
  async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  }
);

export default router;
```

## 4. 前端权限控制

### 4.1 权限Context

```tsx
// contexts/PermissionContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';

interface PermissionContextType {
  permissions: string[];
  roles: string[];
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
  loading: boolean;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserPermissions();
  }, []);
  
  const fetchUserPermissions = async () => {
    try {
      const response = await fetch('/api/user/permissions');
      const data = await response.json();
      
      setPermissions(data.permissions || []);
      setRoles(data.roles || []);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const hasPermission = (resource: string, action: string) => {
    return permissions.includes(`${resource}:${action}`);
  };
  
  const hasRole = (role: string) => {
    return roles.includes(role);
  };
  
  return (
    <PermissionContext.Provider value={{
      permissions,
      roles,
      hasPermission,
      hasRole,
      loading
    }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within PermissionProvider');
  }
  return context;
}
```

### 4.2 权限组件

```tsx
// components/Can.tsx
import { usePermission } from '../contexts/PermissionContext';

interface CanProps {
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ resource, action, fallback = null, children }: CanProps) {
  const { hasPermission, loading } = usePermission();
  
  if (loading) {
    return null;
  }
  
  if (hasPermission(resource, action)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
```

```tsx
// components/HasRole.tsx
interface HasRoleProps {
  role: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function HasRole({ role, fallback = null, children }: HasRoleProps) {
  const { hasRole, loading } = usePermission();
  
  if (loading) {
    return null;
  }
  
  if (hasRole(role)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
```

### 4.3 使用示例

```tsx
// App.tsx
import { PermissionProvider } from './contexts/PermissionContext';
import { Can, HasRole } from './components';

function App() {
  return (
    <PermissionProvider>
      <div>
        {/* 基于权限显示 */}
        <Can resource="post" action="create">
          <button>创建文章</button>
        </Can>
        
        {/* 基于角色显示 */}
        <HasRole role="admin">
          <button>管理面板</button>
        </HasRole>
        
        {/* 使用Hook */}
        <PostList />
      </div>
    </PermissionProvider>
  );
}

function PostList() {
  const { hasPermission } = usePermission();
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          
          {hasPermission('post', 'update') && (
            <button>编辑</button>
          )}
          
          {hasPermission('post', 'delete') && (
            <button>删除</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 5. 高级功能

### 5.1 资源所有权检查

```typescript
// 检查资源所有权
export async function canAccessResource(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string
): Promise<boolean> {
  // 首先检查基础权限
  const hasBasePermission = await PermissionService.hasPermission(
    userId,
    resourceType,
    action
  );
  
  if (!hasBasePermission) {
    return false;
  }
  
  // 如果是更新或删除操作,检查所有权
  if (action === 'update' || action === 'delete') {
    const resource = await getResource(resourceType, resourceId);
    
    // 如果是资源所有者,允许操作
    if (resource.authorId?.toString() === userId) {
      return true;
    }
    
    // 如果是管理员,允许操作
    const isAdmin = await PermissionService.hasRole(userId, 'admin');
    return isAdmin;
  }
  
  return true;
}

// 使用示例
router.put('/posts/:id',
  authenticate,
  async (req, res) => {
    const canAccess = await canAccessResource(
      req.user.id,
      'post',
      req.params.id,
      'update'
    );
    
    if (!canAccess) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // 执行更新...
  }
);
```

### 5.2 动态权限

```typescript
// models/DynamicPermission.ts
const dynamicPermissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resource: String,
  resourceId: String,
  action: String,
  expiresAt: Date
});

export const DynamicPermission = mongoose.model('DynamicPermission', dynamicPermissionSchema);

// 授予临时权限
export async function grantTemporaryPermission(
  userId: string,
  resource: string,
  resourceId: string,
  action: string,
  expiresInHours: number = 24
) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);
  
  await DynamicPermission.create({
    userId,
    resource,
    resourceId,
    action,
    expiresAt
  });
}

// 检查动态权限
export async function hasDynamicPermission(
  userId: string,
  resource: string,
  resourceId: string,
  action: string
): Promise<boolean> {
  const permission = await DynamicPermission.findOne({
    userId,
    resource,
    resourceId,
    action,
    expiresAt: { $gt: new Date() }
  });
  
  return !!permission;
}
```

### 5.3 权限缓存

```typescript
// services/permission-cache.service.ts
import Redis from 'ioredis';

const redis = new Redis();

export class PermissionCacheService {
  /**
   * 缓存用户权限
   */
  static async cacheUserPermissions(userId: string, permissions: string[]) {
    const key = `user:${userId}:permissions`;
    await redis.set(key, JSON.stringify(permissions), 'EX', 3600); // 1小时过期
  }
  
  /**
   * 获取缓存的权限
   */
  static async getCachedPermissions(userId: string): Promise<string[] | null> {
    const key = `user:${userId}:permissions`;
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    return null;
  }
  
  /**
   * 清除用户权限缓存
   */
  static async clearUserPermissions(userId: string) {
    const key = `user:${userId}:permissions`;
    await redis.del(key);
  }
  
  /**
   * 带缓存的权限检查
   */
  static async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    // 尝试从缓存获取
    let permissions = await this.getCachedPermissions(userId);
    
    if (!permissions) {
      // 从数据库获取并缓存
      permissions = await PermissionService.getUserPermissions(userId);
      await this.cacheUserPermissions(userId, permissions);
    }
    
    return permissions.includes(`${resource}:${action}`);
  }
}
```

## 6. 权限管理界面

### 6.1 角色管理

```tsx
// RoleManager.tsx
export function RoleManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);
  
  const updateRolePermissions = async (roleId: string, permissionIds: string[]) => {
    await fetch(`/api/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissionIds })
    });
    
    fetchRoles();
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* 角色列表 */}
      <div>
        <h2>角色列表</h2>
        {roles.map(role => (
          <div
            key={role.id}
            onClick={() => setSelectedRole(role)}
            className={selectedRole?.id === role.id ? 'selected' : ''}
          >
            <h3>{role.displayName}</h3>
            <p>{role.description}</p>
          </div>
        ))}
      </div>
      
      {/* 权限配置 */}
      {selectedRole && (
        <div>
          <h2>{selectedRole.displayName} 的权限</h2>
          <PermissionCheckboxGroup
            permissions={permissions}
            selectedIds={selectedRole.permissions.map(p => p.id)}
            onChange={(ids) => updateRolePermissions(selectedRole.id, ids)}
          />
        </div>
      )}
    </div>
  );
}
```

### 6.2 用户角色分配

```tsx
// UserRoleAssignment.tsx
export function UserRoleAssignment({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  
  useEffect(() => {
    fetchUser();
    fetchRoles();
  }, [userId]);
  
  const assignRole = async (roleId: string) => {
    await fetch(`/api/users/${userId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId })
    });
    
    fetchUser();
  };
  
  const removeRole = async (roleId: string) => {
    await fetch(`/api/users/${userId}/roles/${roleId}`, {
      method: 'DELETE'
    });
    
    fetchUser();
  };
  
  return (
    <div>
      <h2>{user?.username} 的角色</h2>
      
      <div className="current-roles">
        <h3>当前角色</h3>
        {user?.roles.map(role => (
          <div key={role.id}>
            <span>{role.displayName}</span>
            <button onClick={() => removeRole(role.id)}>移除</button>
          </div>
        ))}
      </div>
      
      <div className="available-roles">
        <h3>可分配角色</h3>
        {allRoles
          .filter(role => !user?.roles.some(r => r.id === role.id))
          .map(role => (
            <div key={role.id}>
              <span>{role.displayName}</span>
              <button onClick={() => assignRole(role.id)}>分配</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}
```

## 7. 审计日志

```typescript
// models/AuditLog.ts
const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: String,
  resource: String,
  resourceId: String,
  details: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// 记录审计日志
export async function logAudit(req: Request, action: string, resource: string, resourceId?: string) {
  await AuditLog.create({
    userId: req.user?.id,
    action,
    resource,
    resourceId,
    details: req.body,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
}

// 在路由中使用
router.put('/posts/:id',
  authenticate,
  requirePermission('post', 'update'),
  async (req, res) => {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // 记录审计日志
    await logAudit(req, 'update', 'post', req.params.id);
    
    res.json(post);
  }
);
```

## 8. 测试

```typescript
// permission.test.ts
describe('Permission Service', () => {
  let adminUser: any;
  let editorUser: any;
  let viewerUser: any;
  
  beforeEach(async () => {
    // 创建测试用户
    const adminRole = await Role.findOne({ name: 'admin' });
    const editorRole = await Role.findOne({ name: 'editor' });
    const viewerRole = await Role.findOne({ name: 'viewer' });
    
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      roles: [adminRole._id]
    });
    
    editorUser = await User.create({
      username: 'editor',
      email: 'editor@test.com',
      roles: [editorRole._id]
    });
    
    viewerUser = await User.create({
      username: 'viewer',
      email: 'viewer@test.com',
      roles: [viewerRole._id]
    });
  });
  
  it('admin should have all permissions', async () => {
    const hasPermission = await PermissionService.hasPermission(
      adminUser._id,
      'user',
      'delete'
    );
    
    expect(hasPermission).toBe(true);
  });
  
  it('editor should have post permissions', async () => {
    const canCreate = await PermissionService.hasPermission(
      editorUser._id,
      'post',
      'create'
    );
    
    const canDeleteUser = await PermissionService.hasPermission(
      editorUser._id,
      'user',
      'delete'
    );
    
    expect(canCreate).toBe(true);
    expect(canDeleteUser).toBe(false);
  });
  
  it('viewer should only have read permissions', async () => {
    const canRead = await PermissionService.hasPermission(
      viewerUser._id,
      'user',
      'read'
    );
    
    const canWrite = await PermissionService.hasPermission(
      viewerUser._id,
      'user',
      'create'
    );
    
    expect(canRead).toBe(true);
    expect(canWrite).toBe(false);
  });
});
```

## 9. 最佳实践

### 9.1 权限粒度

```typescript
// ✅ 细粒度权限
'user:create'
'user:read'
'user:update'
'user:delete'

// ❌ 粗粒度权限
'user:all'
```

### 9.2 默认拒绝

```typescript
// ✅ 默认拒绝,明确允许
if (!hasPermission) {
  return res.status(403).json({ error: 'Forbidden' });
}

// ❌ 默认允许
if (hasPermission) {
  // 允许访问
}
```

### 9.3 最小权限原则

```typescript
// 给用户分配完成工作所需的最小权限集
const editorPermissions = [
  'post:create',
  'post:read',
  'post:update',
  'post:delete' // 只能删除自己的文章
];

// 而不是
const editorPermissions = [
  'post:manage' // 过于宽泛
];
```

## 10. 总结

RBAC权限控制的关键要点:

1. **合理的角色设计**: 基于实际业务需求设计角色
2. **细粒度权限**: 权限应该足够细化,但不过度
3. **性能优化**: 使用缓存减少数据库查询
4. **安全审计**: 记录所有权限变更和敏感操作
5. **前后端结合**: 前端控制显示,后端控制访问
6. **灵活扩展**: 支持动态权限和资源所有权

通过正确实施RBAC,可以构建安全、灵活、易维护的权限系统。

