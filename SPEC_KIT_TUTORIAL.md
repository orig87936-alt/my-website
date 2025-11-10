# Spec-Kit 使用教程 - 主页设计项目

## ✅ 已完成步骤

### 第一步：建立项目原则 (Constitution) ✓

我已经为你创建了项目宪章文件：`.specify/memory/constitution.md`

这个文件定义了项目的核心原则：
1. **用户体验优先** - 所有决策以用户体验为中心
2. **现代技术栈** - 使用 React + TypeScript + Vite
3. **性能与可访问性** - 强制要求，不可妥协
4. **响应式设计** - 支持所有设备尺寸
5. **代码质量** - 可维护、可读的代码

---

## 📋 接下来的步骤

### 第二步：创建功能规格说明 (Specification)

使用 `/speckit.specify` 命令来描述你想要构建的功能。

#### 如何操作：

1. **打开 GitHub Copilot Chat** 或你的 AI 助手
2. **输入命令**：`/speckit.specify`
3. **描述你的需求**（专注于"是什么"和"为什么"，而不是技术细节）

#### 示例提示：

```
/speckit.specify 

我想创建一个现代化的个人主页，包含以下功能：

1. **首屏区域**：
   - 大标题展示个人名字/品牌
   - 简短的个人介绍（1-2句话）
   - 社交媒体链接图标（GitHub, Twitter, LinkedIn等）
   - 平滑滚动到下一部分的指示器

2. **关于我部分**：
   - 详细的个人介绍
   - 技能标签云或列表
   - 个人照片或头像

3. **项目展示部分**：
   - 卡片式布局展示3-6个项目
   - 每个项目包含：标题、描述、技术栈标签、预览图、链接
   - 悬停效果和动画

4. **联系方式部分**：
   - 联系表单（姓名、邮箱、消息）
   - 或者显示联系方式（邮箱、社交媒体）

5. **导航栏**：
   - 固定在顶部
   - 平滑滚动到各个部分
   - 移动端响应式菜单

设计风格：现代、简洁、专业，使用深色主题或可切换的明暗主题。
```

#### 这一步会生成什么：

- 创建一个新的 Git 分支（例如：`001-homepage-feature`）
- 在 `.specify/specs/001-homepage-feature/` 目录下创建 `spec.md` 文件
- 包含详细的用户故事和功能需求

---

### 第三步：澄清需求（可选但推荐）

在创建技术计划之前，使用 `/speckit.clarify` 来澄清任何模糊的需求。

#### 如何操作：

```
/speckit.clarify
```

AI 助手会问你一系列问题来确保需求清晰，例如：
- "项目展示部分应该支持过滤或分类吗？"
- "联系表单提交后数据应该发送到哪里？"
- "主题切换功能应该记住用户的选择吗？"

回答这些问题后，规格说明会更新。

---

### 第四步：创建技术实现计划 (Plan)

使用 `/speckit.plan` 命令来指定技术栈和架构选择。

#### 如何操作：

```
/speckit.plan

使用以下技术栈：
- React 18 + TypeScript
- Vite 作为构建工具
- CSS Modules 或 Tailwind CSS 用于样式
- Framer Motion 用于动画效果
- React Hook Form 用于表单处理
- 响应式设计，移动优先
- 部署到 Vercel 或 Netlify

架构要求：
- 组件化设计，每个部分是独立组件
- 使用 React Context 管理主题状态
- 图片使用懒加载
- 代码分割优化性能
```

#### 这一步会生成什么：

在 `.specify/specs/001-homepage-feature/` 目录下创建：
- `plan.md` - 实现计划
- `data-model.md` - 数据模型（如果需要）
- `research.md` - 技术研究
- `contracts/` - API 规范（如果需要）

---

### 第五步：生成任务分解 (Tasks)

使用 `/speckit.tasks` 命令自动生成详细的任务列表。

#### 如何操作：

```
/speckit.tasks
```

#### 这一步会生成什么：

在 `.specify/specs/001-homepage-feature/` 目录下创建 `tasks.md`，包含：
- 按用户故事组织的任务
- 任务依赖关系
- 可并行执行的任务标记
- 每个任务的具体文件路径

---

### 第六步：执行实现 (Implementation)

使用 `/speckit.implement` 命令执行实现计划。

#### 如何操作：

```
/speckit.implement
```

#### 这一步会做什么：

- 验证所有前置条件（constitution、spec、plan、tasks）
- 按正确顺序执行任务
- 遵循 TDD 方法（如果在任务中定义）
- 提供进度更新
- 处理错误

**重要提示**：AI 助手会执行本地 CLI 命令（如 `npm install`、`npm run dev` 等），确保你的机器上已安装所需工具。

---

## 🎯 可选的增强命令

### `/speckit.analyze`
在 `/speckit.tasks` 之后、`/speckit.implement` 之前运行，用于：
- 跨文档一致性检查
- 覆盖率分析
- 发现潜在问题

### `/speckit.checklist`
在 `/speckit.plan` 之后运行，用于：
- 生成质量检查清单
- 验证需求完整性
- 确保清晰度和一致性

---

## 📁 项目结构

初始化后，你的项目结构如下：

```
主页设计/
├── .specify/                    # Spec-Kit 配置和模板
│   ├── memory/
│   │   └── constitution.md      # ✅ 项目宪章（已创建）
│   ├── scripts/                 # 辅助脚本
│   ├── templates/               # 文档模板
│   └── specs/                   # 功能规格（将在第二步创建）
│       └── 001-homepage-feature/
│           ├── spec.md          # 功能规格
│           ├── plan.md          # 实现计划
│           ├── tasks.md         # 任务列表
│           └── ...
├── .github/
│   └── prompts/                 # AI 助手命令定义
│       ├── speckit.constitution.prompt.md
│       ├── speckit.specify.prompt.md
│       ├── speckit.plan.prompt.md
│       └── ...
├── src/                         # 源代码（将在实现阶段创建）
├── public/                      # 静态资源
└── package.json                 # 项目配置
```

---

## 🚀 快速开始下一步

现在你可以：

1. **打开 GitHub Copilot Chat** 或你的 AI 编码助手
2. **输入命令**：`/speckit.specify`
3. **描述你想要的主页功能**（参考上面的示例）

AI 助手会引导你完成整个过程！

---

## 💡 提示和最佳实践

### 编写好的规格说明：
- ✅ 专注于用户需求和业务价值
- ✅ 描述"是什么"和"为什么"，而不是"怎么做"
- ✅ 使用具体的例子和场景
- ❌ 不要在这个阶段指定技术细节

### 编写好的技术计划：
- ✅ 明确技术栈选择
- ✅ 说明架构决策的理由
- ✅ 考虑性能和可扩展性
- ✅ 遵循 constitution 中的原则

### 任务执行：
- ✅ 按顺序执行任务
- ✅ 测试每个功能后再继续
- ✅ 遇到问题及时向 AI 助手反馈
- ✅ 保持代码质量和文档更新

---

## 🔍 故障排除

### 如果命令不可用：
1. 确保你在项目根目录
2. 检查 `.github/prompts/` 目录是否存在
3. 重启你的 AI 助手

### 如果 AI 助手不理解命令：
1. 确保使用的是支持的 AI 助手（GitHub Copilot、Claude Code 等）
2. 尝试完整输入命令，包括参数
3. 查看 `.github/prompts/` 中的命令定义

### 如果生成的代码有问题：
1. 将错误信息复制给 AI 助手
2. 要求 AI 助手修复
3. 检查是否遵循了 constitution 中的原则

---

## 📚 更多资源

- [Spec-Kit 官方文档](https://github.com/github/spec-kit)
- [Spec-Driven Development 方法论](./spec-kit/spec-driven.md)
- 项目 Constitution：`.specify/memory/constitution.md`

---

**准备好了吗？开始第二步：`/speckit.specify`** 🚀

