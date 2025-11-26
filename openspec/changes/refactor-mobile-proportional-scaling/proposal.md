# Change: 重构移动端为完全等比例缩放显示

## Why
当前移动端使用响应式布局（`mobile.css`），会改变元素的排版和布局结构。用户需要移动端显示与桌面端**完全相同的布局**，只是等比例缩小，以保持视觉一致性。

现有的 `mobile-scale.css` 提供了缩放功能，但需要手动启用，且与 `mobile.css` 可能存在冲突。

## What Changes
- 创建新的移动端等比例缩放系统，完全独立于桌面端代码
- 使用 CSS `transform: scale()` 实现等比例缩放
- 确保桌面端样式和组件完全不受影响
- 提供智能设备检测和自动缩放比例调整
- 优化触摸交互和性能

## Impact
- **Affected specs**: mobile-display (新增)
- **Affected code**: 
  - `src/styles/mobile-proportional.css` (新增)
  - `src/main.tsx` (引入新样式)
  - `index.html` (viewport 配置)
  - 不修改任何现有组件文件
  - 不修改 `mobile.css` 和 `mobile-scale.css`

## Non-Goals
- ❌ 不修改桌面端组件代码
- ❌ 不修改现有的 `mobile.css`
- ❌ 不使用 Tailwind 响应式类名（`sm:`, `md:`, `lg:`）
- ❌ 不改变桌面端任何样式或行为

