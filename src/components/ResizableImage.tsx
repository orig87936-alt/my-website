import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef, useEffect } from 'react';

// React 组件用于渲染可调整大小的图片
const ResizableImageComponent = ({ node, updateAttributes, deleteNode, selected }: any) => {
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(node.attrs.width || 'auto');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = imgRef.current?.offsetWidth || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(100, startWidth + deltaX);
      setWidth(newWidth);
      updateAttributes({ width: newWidth });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <NodeViewWrapper className="resizable-image-wrapper">
      <div
        ref={containerRef}
        className={`image-resizer ${selected ? 'ProseMirror-selectednode' : ''}`}
        style={{ width: width === 'auto' ? 'auto' : `${width}px`, maxWidth: '100%' }}
      >
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
        
        {selected && (
          <>
            {/* 删除按钮 */}
            <button
              className="delete-button"
              onClick={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              title="删除图片"
            >
              ×
            </button>

            {/* 调整大小手柄 */}
            <div
              className="resize-handle bottom-right"
              onMouseDown={startResize}
              title="拖拽调整大小"
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// TipTap 扩展定义
export const ResizableImage = Node.create({
  name: 'resizableImage',

  group: 'block',

  draggable: false,  // 禁用拖拽，避免复制图片

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: 'auto',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  // 添加 Markdown 序列化支持
  renderMarkdown(node: any) {
    const { src, alt, title, width } = node.attrs;

    // 如果有自定义宽度，使用 HTML img 标签以保留尺寸信息
    if (width && width !== 'auto') {
      let html = `<img src="${src}"`;
      if (alt) html += ` alt="${alt}"`;
      if (title) html += ` title="${title}"`;
      html += ` width="${width}"`;
      html += ' />';
      return html;
    }

    // 否则使用标准 Markdown 图片语法: ![alt](src "title")
    let markdown = `![${alt || ''}](${src}`;
    if (title) {
      markdown += ` "${title}"`;
    }
    markdown += ')';
    return markdown;
  },
});

