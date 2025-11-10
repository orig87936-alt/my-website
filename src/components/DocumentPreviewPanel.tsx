import React from 'react';
import { FileText, Image, Tag, FolderOpen, CheckCircle2 } from 'lucide-react';

interface DocumentPreviewPanelProps {
  result: {
    upload_id: string;
    filename: string;
    file_type: string;
    parse_result: {
      title: string;
      summary: string;
      category: string;
      tags: string[];
      content_zh: Array<{
        type: string;
        content?: string;
        text?: string;
        level?: number;
        language?: string;
        caption?: string;
      }>;
      content_en?: Array<{
        type: string;
        content?: string;
        text?: string;
        level?: number;
        language?: string;
        caption?: string;
      }>;
      images_uploaded: Array<{
        original_name: string;
        uploaded_url: string;
        size: number;
      }>;
      metadata: {
        word_count: number;
        paragraph_count: number;
        image_count: number;
        parse_time: number;
        translation_time?: number;
      };
    };
  };
}

const DocumentPreviewPanel: React.FC<DocumentPreviewPanelProps> = ({ result }) => {
  const { parse_result } = result;
  const { title, summary, category, tags, content_zh, content_en, images_uploaded, metadata } = parse_result;

  const content_blocks = content_zh || [];
  const hasTranslation = content_en && content_en.length > 0;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-400">文档解析成功</p>
          <p className="text-xs text-gray-400">
            已提取 {content_blocks.length} 个内容块，{images_uploaded.length} 张图片
            {hasTranslation && ' · 已翻译'}
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          标题
        </label>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white font-semibold">{title}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            分类
          </label>
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <span className="text-[#00a4e4] font-medium">{category}</span>
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              标签
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#00a4e4]/10 text-[#00a4e4] text-sm rounded-full border border-[#00a4e4]/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400">摘要</label>
          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* Images */}
      {images_uploaded.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Image className="w-4 h-4" />
            图片 ({images_uploaded.length})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images_uploaded.map((image, index) => (
              <div
                key={index}
                className="relative aspect-video bg-white/5 rounded-lg border border-white/10 overflow-hidden group"
              >
                <img
                  src={image.uploaded_url}
                  alt={image.original_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-xs text-white text-center px-2">{image.original_name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Preview */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-400">内容预览</label>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 max-h-64 overflow-y-auto space-y-3">
          {content_blocks.slice(0, 5).map((block, index) => {
            const blockContent = block.content || block.text || '';
            return (
              <div key={index} className="space-y-1">
                {block.type === 'heading' && (
                  <h3
                    className={`font-semibold text-white ${
                      block.level === 1
                        ? 'text-xl'
                        : block.level === 2
                        ? 'text-lg'
                        : 'text-base'
                    }`}
                  >
                    {blockContent}
                  </h3>
                )}
                {block.type === 'paragraph' && (
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {blockContent.length > 200
                      ? blockContent.substring(0, 200) + '...'
                      : blockContent}
                  </p>
                )}
                {block.type === 'image' && (
                  <div className="flex items-center gap-2 text-sm text-[#00a4e4]">
                    <Image className="w-4 h-4" />
                    <span>图片: {blockContent}</span>
                  </div>
                )}
                {block.type === 'code' && (
                  <pre className="p-3 bg-black/30 rounded text-xs text-gray-300 overflow-x-auto">
                    <code>{blockContent}</code>
                  </pre>
                )}
                {block.type === 'quote' && (
                  <blockquote className="border-l-4 border-[#00a4e4] pl-4 text-gray-300 text-sm italic">
                    {blockContent}
                  </blockquote>
                )}
                {block.type === 'list' && (
                  <div className="text-gray-300 text-sm">
                    {blockContent.split('\n').map((item: string, i: number) => (
                      <div key={i} className="flex gap-2">
                        <span>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {content_blocks.length > 5 && (
            <p className="text-sm text-gray-500 text-center pt-2">
              ... 还有 {content_blocks.length - 5} 个内容块
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#00a4e4]">{metadata.word_count}</p>
          <p className="text-xs text-gray-400">字数</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#00a4e4]">{content_blocks.length}</p>
          <p className="text-xs text-gray-400">内容块</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#00a4e4]">{images_uploaded.length}</p>
          <p className="text-xs text-gray-400">图片</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#00a4e4]">
            {tags?.length || 0}
          </p>
          <p className="text-xs text-gray-400">标签</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewPanel;

