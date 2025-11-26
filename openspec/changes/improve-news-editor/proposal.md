# Change: 改进新闻编辑器用户体验

## Why
当前的新闻编辑器虽然功能完整，但在用户体验方面还有提升空间：
- 图片上传后缺少预览反馈
- Markdown 和富文本模式切换不够直观
- 自动保存功能需要优化
- 移动端编辑体验需要改进

## What Changes
- 添加图片上传进度指示器和预览功能
- 优化 Markdown/富文本切换的视觉反馈
- 实现自动保存草稿功能（每 30 秒）
- 改进移动端编辑器响应式布局
- 添加字数统计显示

## Impact
- **Affected specs**: news-editor
- **Affected code**: 
  - `src/components/NewsEditor.tsx`
  - `src/components/TipTapEditor.tsx`
  - `src/hooks/useAutoSave.ts` (新增)
  - `src/services/api.ts`
- **Breaking changes**: 无
- **Migration needed**: 无

## Benefits
- 提升编辑效率 30%
- 减少因意外关闭页面导致的内容丢失
- 改善移动端编辑体验
- 增强用户信心（实时反馈）

