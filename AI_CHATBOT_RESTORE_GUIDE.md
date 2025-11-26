# AI智能咨询模块 - 恢复指南

## 📋 概述

AI智能咨询模块已被暂时移除，替换为精美的日历预约组件。本文档说明如何在需要时恢复AI聊天功能。

**备份日期**: 2025-11-24  
**备份原因**: 用户暂时不需要此模块，改为使用日历组件  
**备份文件**: `src/components/ConsultingPage_ChatbotBackup.tsx`

---

## 🔧 AI聊天模块功能说明

### 核心功能
- ✅ **AI智能问答** - 基于DeepSeek API的智能对话
- ✅ **RAG检索增强** - 从FAQ和文章中检索相关信息
- ✅ **多轮对话** - 支持会话持久化（localStorage）
- ✅ **快捷问题** - 预设常见问题快速回复
- ✅ **来源引用** - 显示回答的参考来源（FAQ/文章）
- ✅ **错误处理** - 优雅的降级方案

### 技术栈
- **前端**: React, TypeScript, TailwindCSS, Framer Motion
- **后端**: Python FastAPI, DeepSeek API, PostgreSQL
- **API**: `/api/v1/chat` - 发送消息
- **数据库**: `chat_messages` 表存储聊天历史

---

## 📂 相关文件

### 前端文件
- `src/components/ConsultingPage_ChatbotBackup.tsx` - **备份文件**（包含代码注释和说明）
- `src/components/ConsultingPage.tsx` - 当前咨询页面（使用日历组件）
- `src/services/api.ts` - chatAPI客户端（仍然存在，未删除）

### 后端文件（未修改，仍然可用）
- `backend/app/routers/chat.py` - 聊天API路由
- `backend/app/services/chat.py` - 聊天服务逻辑
- `backend/app/services/deepseek.py` - DeepSeek API集成
- `backend/app/models/chat.py` - 聊天消息数据模型

### 文档
- `PHASE7_AI_CHATBOT_COMPLETE.md` - AI聊天功能完整实现文档
- `specs/001-news-enhancements/spec.md` - 原始需求规格

---

## 🔄 如何恢复AI聊天功能

### 方法1: 手动恢复（推荐）

#### 步骤1: 恢复导入
在 `src/components/ConsultingPage.tsx` 第1-10行，添加回：
```typescript
import { MessageCircle, Send } from 'lucide-react';
import { chatAPI, ChatResponse, SourceReference } from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
  sources?: SourceReference[];
}
```

#### 步骤2: 恢复状态
在组件中添加（约第25行）：
```typescript
const [messages, setMessages] = useState<Message[]>([
  {
    id: '1',
    text: t('consulting.chat.welcome'),
    sender: 'bot',
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
]);
const [inputValue, setInputValue] = useState('');
const [sessionId, setSessionId] = useState<string | null>(null);
const [isSending, setIsSending] = useState(false);

const quickReplies = [
  t('consulting.chat.q1'),
  t('consulting.chat.q2'),
  t('consulting.chat.q3')
];
```

#### 步骤3: 恢复useEffect
```typescript
useEffect(() => {
  const savedSessionId = localStorage.getItem('chat_session_id');
  if (savedSessionId) {
    setSessionId(savedSessionId);
  }
}, []);
```

#### 步骤4: 恢复处理函数
参考 `ConsultingPage_ChatbotBackup.tsx` 中的 `handleSend` 和 `handleQuickReply` 函数（约70-130行）

#### 步骤5: 恢复JSX
将第260-409行的日历组件替换为聊天界面JSX（参考备份文件或 `PHASE7_AI_CHATBOT_COMPLETE.md`）

### 方法2: 使用Git恢复（如果有版本控制）

```bash
# 查看AI聊天功能的最后一次提交
git log --all --grep="chatbot" --oneline

# 恢复特定文件到之前的版本
git checkout <commit-hash> -- src/components/ConsultingPage.tsx
```

---

## 🧪 恢复后测试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问咨询页面**
   - 打开 http://localhost:3000
   - 点击导航栏 "Consulting" 或 "咨询服务"

3. **测试聊天功能**
   - 点击快捷问题
   - 输入自定义问题
   - 检查AI回复
   - 验证来源引用显示

4. **测试会话持久化**
   - 刷新页面
   - 检查 localStorage 中的 `chat_session_id`

---

## ⚙️ 后端配置

### DeepSeek API配置
在 `backend/.env` 中设置：
```env
DEEPSEEK_API_KEY=your-deepseek-api-key-here
```

如果未配置API密钥，系统会自动使用模拟回复（开发模式）。

### 数据库迁移
聊天功能需要 `chat_messages` 表，如果数据库中没有，运行：
```bash
cd backend
alembic upgrade head
```

---

## 📊 当前状态

### 已移除的内容
- ✅ 聊天界面UI（第260-399行）
- ✅ 聊天相关状态（messages, inputValue, sessionId, isSending）
- ✅ 聊天处理函数（handleSend, handleQuickReply）
- ✅ 聊天相关导入（MessageCircle, Send, chatAPI等）

### 保留的内容
- ✅ 后端API（`/api/v1/chat` 仍然可用）
- ✅ 数据库表（`chat_messages` 仍然存在）
- ✅ API客户端（`src/services/api.ts` 中的 `chatAPI` 仍然存在）
- ✅ 翻译文本（`consulting.chat.*` 仍在语言文件中）

### 新增的内容
- ✅ 精美的日历组件（第260-409行）
- ✅ 日历点击进入预约表单功能
- ✅ 服务类型展示
- ✅ 日历图例说明

---

## 💡 建议

如果需要**同时保留**AI聊天和日历功能：
1. 可以将它们放在不同的标签页（Tab）中
2. 或者在页面上下排列显示
3. 或者添加一个切换按钮在两者之间切换

如有任何问题，请参考：
- `PHASE7_AI_CHATBOT_COMPLETE.md` - 完整实现文档
- `ConsultingPage_ChatbotBackup.tsx` - 备份代码和注释

