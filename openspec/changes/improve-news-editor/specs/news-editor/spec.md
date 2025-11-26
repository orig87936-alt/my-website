# Delta for News Editor

## ADDED Requirements

### Requirement: 图片上传进度反馈
编辑器 SHALL 在图片上传过程中显示实时进度。

#### Scenario: 上传进度显示
- **WHEN** 用户选择图片上传
- **THEN** 显示上传进度条（0-100%）
- **AND** 上传完成后显示预览

#### Scenario: 上传失败处理
- **WHEN** 图片上传失败
- **THEN** 显示错误提示信息
- **AND** 提供重试按钮

### Requirement: 自动保存草稿
编辑器 MUST 自动保存用户编辑的内容为草稿。

#### Scenario: 定时自动保存
- **WHEN** 用户编辑内容超过 30 秒
- **THEN** 自动保存草稿到服务器
- **AND** 显示"已保存"状态提示

#### Scenario: 草稿恢复
- **WHEN** 用户重新打开编辑器
- **THEN** 检测是否有未发布的草稿
- **AND** 提示用户是否恢复草稿内容

#### Scenario: 保存失败处理
- **WHEN** 自动保存失败（网络错误）
- **THEN** 显示"保存失败"警告
- **AND** 将草稿保存到本地存储作为备份

### Requirement: 编辑模式切换优化
编辑器 SHALL 提供流畅的 Markdown 和富文本模式切换体验。

#### Scenario: 模式切换动画
- **WHEN** 用户切换编辑模式
- **THEN** 显示平滑的过渡动画
- **AND** 保留当前编辑内容

#### Scenario: 模式状态指示
- **WHEN** 编辑器处于任一模式
- **THEN** 清晰显示当前模式（高亮按钮）
- **AND** 提供模式说明提示

### Requirement: 移动端编辑优化
编辑器 MUST 在移动设备上提供良好的编辑体验。

#### Scenario: 响应式工具栏
- **WHEN** 在移动设备上打开编辑器
- **THEN** 工具栏自动适配屏幕宽度
- **AND** 常用功能优先显示

#### Scenario: 触摸操作优化
- **WHEN** 用户使用触摸操作
- **THEN** 按钮点击区域足够大（最小 44x44px）
- **AND** 支持常见手势操作

#### Scenario: 虚拟键盘适配
- **WHEN** 虚拟键盘弹出
- **THEN** 编辑区域自动调整避免被遮挡
- **AND** 保持工具栏可见

### Requirement: 字数统计显示
编辑器 SHALL 实时显示文章字数统计。

#### Scenario: 实时字数更新
- **WHEN** 用户输入或删除内容
- **THEN** 实时更新字数统计
- **AND** 显示格式为"字数: XXX"

#### Scenario: 中英文混合计数
- **WHEN** 内容包含中英文混合
- **THEN** 中文按字符计数
- **AND** 英文按单词计数

#### Scenario: 字数限制提示
- **WHEN** 字数超过建议上限（如 5000 字）
- **THEN** 显示警告提示
- **AND** 不阻止继续输入

