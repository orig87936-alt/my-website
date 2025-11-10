# 全局错误处理和加载状态使用指南

本指南介绍如何在应用中使用新的全局错误处理、加载状态和重试逻辑功能。

---

## 📋 目录

1. [功能概述](#功能概述)
2. [Toast 通知系统](#toast-通知系统)
3. [全局加载状态](#全局加载状态)
4. [API 调用 Hooks](#api-调用-hooks)
5. [自动重试逻辑](#自动重试逻辑)
6. [使用示例](#使用示例)

---

## 功能概述

### ✅ 已实现的功能

1. **Toast 通知系统** (`ToastContext`)
   - 成功、错误、警告、信息四种类型
   - 自动消失（可配置时长）
   - 支持手动关闭
   - 动画效果

2. **全局加载状态** (`LoadingContext`)
   - 全屏加载遮罩
   - 自定义加载消息
   - 支持多个并发加载（计数器）

3. **API 自动重试**
   - GET 请求自动重试（最多 3 次）
   - 指数退避策略
   - 可重试的状态码：408, 429, 500, 502, 503, 504

4. **用户友好的错误消息**
   - 自动将 HTTP 状态码转换为可读消息
   - 支持中英文
   - 网络错误提示

---

## Toast 通知系统

### 基本用法

```tsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleAction = () => {
    // 显示成功消息
    showSuccess('操作成功！');
    
    // 显示错误消息
    showError('操作失败，请重试');
    
    // 显示警告消息
    showWarning('请注意：此操作不可撤销');
    
    // 显示信息消息
    showInfo('正在处理您的请求...');
  };

  return <button onClick={handleAction}>执行操作</button>;
}
```

### 自定义 Toast

```tsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showToast } = useToast();

  const handleAction = () => {
    // 自定义类型和持续时间
    showToast('自定义消息', 'success', 3000); // 3秒后消失
  };

  return <button onClick={handleAction}>执行操作</button>;
}
```

---

## 全局加载状态

### 基本用法

```tsx
import { useLoading } from '../contexts/LoadingContext';

function MyComponent() {
  const { startLoading, stopLoading } = useLoading();

  const handleLongOperation = async () => {
    startLoading('正在处理...');
    
    try {
      await someAsyncOperation();
    } finally {
      stopLoading();
    }
  };

  return <button onClick={handleLongOperation}>开始操作</button>;
}
```

### 多个并发加载

```tsx
// 加载状态使用计数器，支持多个并发操作
startLoading('加载数据 1...');
startLoading('加载数据 2...');

// 只有当所有 stopLoading() 都被调用后，加载遮罩才会消失
stopLoading(); // 计数器: 2 -> 1
stopLoading(); // 计数器: 1 -> 0 (遮罩消失)
```

---

## API 调用 Hooks

### useApiCall - 通用 Hook

```tsx
import { useApiCall } from '../hooks/useApiCall';
import { articlesAPI } from '../services/api';

function ArticleList() {
  const { data, error, isLoading, execute } = useApiCall(
    articlesAPI.list,
    {
      showLoading: true,
      showErrorToast: true,
      loadingMessage: '加载文章列表...',
    }
  );

  useEffect(() => {
    execute({ page: 1, page_size: 10 });
  }, []);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.detail}</div>;

  return (
    <div>
      {data?.items.map(article => (
        <div key={article.id}>{article.title_zh}</div>
      ))}
    </div>
  );
}
```

### useApiMutation - 用于数据修改

```tsx
import { useApiMutation } from '../hooks/useApiCall';
import { articlesAPI } from '../services/api';

function CreateArticle() {
  const { execute, isLoading } = useApiMutation(
    articlesAPI.create,
    {
      showSuccessToast: true,
      successMessage: '文章创建成功！',
      onSuccess: (data) => {
        console.log('Created article:', data);
        // 跳转到文章详情页
      },
    }
  );

  const handleSubmit = async (articleData) => {
    const result = await execute(articleData);
    if (result) {
      // 成功处理
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? '创建中...' : '创建文章'}
      </button>
    </form>
  );
}
```

### useApiQuery - 用于数据查询

```tsx
import { useApiQuery } from '../hooks/useApiCall';
import { articlesAPI } from '../services/api';

function ArticleDetail({ id }) {
  const { data, isLoading, execute } = useApiQuery(articlesAPI.get);

  useEffect(() => {
    execute(id);
  }, [id]);

  if (isLoading) return <div>加载中...</div>;
  if (!data) return <div>未找到文章</div>;

  return (
    <div>
      <h1>{data.title_zh}</h1>
      <p>{data.summary_zh}</p>
    </div>
  );
}
```

---

## 自动重试逻辑

### 配置

在 `src/services/api.ts` 中配置：

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,              // 最大重试次数
  retryDelay: 1000,           // 初始延迟（毫秒）
  retryableStatuses: [        // 可重试的 HTTP 状态码
    408,  // Request Timeout
    429,  // Too Many Requests
    500,  // Internal Server Error
    502,  // Bad Gateway
    503,  // Service Unavailable
    504,  // Gateway Timeout
  ],
};
```

### 重试策略

- **指数退避**: 每次重试的延迟时间翻倍
  - 第 1 次重试: 1 秒后
  - 第 2 次重试: 2 秒后
  - 第 3 次重试: 4 秒后

- **仅重试安全方法**: 只有 GET 请求会自动重试
  - POST/PUT/DELETE 不会自动重试（避免重复操作）

- **网络错误重试**: 网络连接失败也会自动重试

---

## 使用示例

### 示例 1: 登录页面（已实现）

```tsx
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const success = await login(username, password);
      
      if (success) {
        showSuccess('登录成功！');
        onLoginSuccess();
      } else {
        showError('用户名或密码错误');
      }
    } catch (error) {
      // API 错误已经是用户友好的消息
      showError(error?.detail || '登录失败，请稍后重试');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 示例 2: 文章列表加载

```tsx
import { useApiQuery } from '../hooks/useApiCall';
import { articlesAPI } from '../services/api';

function NewsPage() {
  const { data, isLoading, execute } = useApiQuery(articlesAPI.list);

  useEffect(() => {
    execute({ page: 1, page_size: 10, category: 'news' });
  }, []);

  return (
    <div>
      {isLoading && <Spinner />}
      {data?.items.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
```

### 示例 3: 表单提交

```tsx
import { useApiMutation } from '../hooks/useApiCall';
import { appointmentsAPI } from '../services/api';

function BookingForm() {
  const { execute, isLoading } = useApiMutation(
    appointmentsAPI.create,
    {
      showSuccessToast: true,
      successMessage: '预约成功！',
      onSuccess: () => {
        // 关闭表单，显示确认页面
      },
    }
  );

  const handleSubmit = async (formData) => {
    await execute(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? '提交中...' : '提交预约'}
      </button>
    </form>
  );
}
```

---

## 错误消息映射

### HTTP 状态码 → 用户友好消息

| 状态码 | 中文消息 | 英文消息 |
|--------|----------|----------|
| 0 | 网络错误。请检查您的网络连接。 | Network error. Please check your internet connection. |
| 400 | 无效的请求。请检查您的输入。 | Invalid request. Please check your input. |
| 401 | 需要身份验证。请登录。 | Authentication required. Please log in. |
| 403 | 访问被拒绝。您没有权限。 | Access denied. You do not have permission. |
| 404 | 未找到资源。 | Resource not found. |
| 408 | 请求超时。请重试。 | Request timeout. Please try again. |
| 409 | 冲突。资源已存在。 | Conflict. The resource already exists. |
| 422 | 验证错误。请检查您的输入。 | Validation error. Please check your input. |
| 429 | 请求过多。请稍等片刻。 | Too many requests. Please wait a moment. |
| 500+ | 服务器错误。请稍后重试。 | Server error. Please try again later. |

---

## 最佳实践

### ✅ 推荐做法

1. **使用 useApiMutation 进行数据修改**
   ```tsx
   const { execute } = useApiMutation(articlesAPI.create);
   ```

2. **使用 useApiQuery 进行数据查询**
   ```tsx
   const { data, execute } = useApiQuery(articlesAPI.list);
   ```

3. **在 Toast 中显示操作结果**
   ```tsx
   showSuccess('操作成功！');
   showError('操作失败');
   ```

4. **长时间操作显示加载遮罩**
   ```tsx
   const { execute } = useApiMutation(api.longOperation, {
     showLoading: true,
     loadingMessage: '正在处理，请稍候...',
   });
   ```

### ❌ 避免做法

1. **不要手动管理所有加载状态**
   ```tsx
   // ❌ 不推荐
   const [isLoading, setIsLoading] = useState(false);
   setIsLoading(true);
   await api.call();
   setIsLoading(false);
   
   // ✅ 推荐
   const { execute, isLoading } = useApiMutation(api.call);
   ```

2. **不要忽略错误处理**
   ```tsx
   // ❌ 不推荐
   await api.call(); // 没有 try-catch
   
   // ✅ 推荐
   const { execute } = useApiMutation(api.call, {
     showErrorToast: true,
   });
   ```

---

## 总结

通过使用这些新功能，您可以：

- ✅ 自动处理 API 错误并显示友好消息
- ✅ 自动重试失败的请求
- ✅ 统一管理加载状态
- ✅ 提供更好的用户体验
- ✅ 减少重复代码

**下一步**: 将现有组件迁移到使用这些新的 Hooks 和 Context！

