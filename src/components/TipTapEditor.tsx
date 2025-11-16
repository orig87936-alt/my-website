/**
 * TipTap 富文本编辑器组件
 * 支持 Markdown 输入输出，工具栏，图片上传等功能
 */

import React, { useEffect } from 'react';
import './TipTapEditor.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ResizableImage } from './ResizableImage';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Code2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  onImageUpload?: (file: File) => Promise<string>;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  value,
  onChange,
  placeholder,
  minHeight = '300px',
  onImageUpload,
}) => {
  const { language } = useLanguage();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ResizableImage,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || (language === 'zh' ? '开始输入内容...' : 'Start typing...'),
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none p-4',
      },
      // 处理粘贴事件
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items || !onImageUpload) return false;

        // 查找图片
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf('image') === 0) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              // 上传图片
              onImageUpload(file)
                .then((url) => {
                  const { schema } = view.state;
                  const node = schema.nodes.resizableImage.create({ src: url });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                })
                .catch((error) => {
                  console.error('Image upload failed:', error);
                  alert(language === 'zh' ? '图片上传失败' : 'Image upload failed');
                });
            }
            return true;
          }
        }
        return false;
      },
      // 处理拖拽事件
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          const files = event.dataTransfer.files;
          const images = Array.from(files).filter((file) => file.type.indexOf('image') === 0);

          if (images.length > 0 && onImageUpload) {
            event.preventDefault();

            const { schema } = view.state;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

            images.forEach((image) => {
              onImageUpload(image)
                .then((url) => {
                  const node = schema.nodes.resizableImage.create({ src: url });
                  const transaction = view.state.tr.insert(coordinates?.pos || 0, node);
                  view.dispatch(transaction);
                })
                .catch((error) => {
                  console.error('Image upload failed:', error);
                  alert(language === 'zh' ? '图片上传失败' : 'Image upload failed');
                });
            });

            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      onChange(markdown);
    },
  });

  // 同步外部 value 变化
  useEffect(() => {
    if (editor && value !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  // 工具栏按钮组件
  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        p-2 rounded hover:bg-gray-100 transition-colors
        ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  );

  // 添加链接
  const addLink = () => {
    const url = window.prompt(language === 'zh' ? '输入链接地址:' : 'Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // 添加图片
  const addImage = async () => {
    if (onImageUpload) {
      // 使用文件上传
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const url = await onImageUpload(file);
            editor.chain().focus().setImage({ src: url }).run();
          } catch (error) {
            console.error('Image upload failed:', error);
            alert(language === 'zh' ? '图片上传失败' : 'Image upload failed');
          }
        }
      };
      input.click();
    } else {
      // 使用 URL
      const url = window.prompt(language === 'zh' ? '输入图片地址:' : 'Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  return (
    <div className="tiptap-editor border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* 工具栏 */}
      <div className="toolbar flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* 撤销/重做 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title={language === 'zh' ? '撤销' : 'Undo'}
          >
            <Undo size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title={language === 'zh' ? '重做' : 'Redo'}
          >
            <Redo size={18} />
          </ToolbarButton>
        </div>

        {/* 标题 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title={language === 'zh' ? '一级标题' : 'Heading 1'}
          >
            <Heading1 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title={language === 'zh' ? '二级标题' : 'Heading 2'}
          >
            <Heading2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title={language === 'zh' ? '三级标题' : 'Heading 3'}
          >
            <Heading3 size={18} />
          </ToolbarButton>
        </div>

        {/* 文本格式 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title={language === 'zh' ? '粗体' : 'Bold'}
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title={language === 'zh' ? '斜体' : 'Italic'}
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title={language === 'zh' ? '删除线' : 'Strikethrough'}
          >
            <Strikethrough size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title={language === 'zh' ? '行内代码' : 'Inline Code'}
          >
            <Code size={18} />
          </ToolbarButton>
        </div>

        {/* 列表 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title={language === 'zh' ? '无序列表' : 'Bullet List'}
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title={language === 'zh' ? '有序列表' : 'Ordered List'}
          >
            <ListOrdered size={18} />
          </ToolbarButton>
        </div>

        {/* 引用和代码块 */}
        <div className="flex gap-1 border-r border-gray-300 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title={language === 'zh' ? '引用' : 'Quote'}
          >
            <Quote size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title={language === 'zh' ? '代码块' : 'Code Block'}
          >
            <Code2 size={18} />
          </ToolbarButton>
        </div>

        {/* 链接和图片 */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive('link')}
            title={language === 'zh' ? '添加链接' : 'Add Link'}
          >
            <Link2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={addImage}
            title={language === 'zh' ? '插入图片' : 'Insert Image'}
          >
            <ImageIcon size={18} />
          </ToolbarButton>
        </div>
      </div>

      {/* 编辑器内容区 */}
      <div
        className="editor-content overflow-y-auto"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
        {language === 'zh' ? '支持 Markdown 语法' : 'Markdown syntax supported'} •{' '}
        {language === 'zh' ? '字符数' : 'Characters'}: {editor.storage.markdown.getMarkdown().length}
      </div>
    </div>
  );
};

