/**
 * 新闻创建表单组件
 * 用于创建新的新闻文章
 */

import React, { useState, useEffect } from 'react';
import { NEWS_CATEGORIES } from '../constants/newsCategories';
import { ImageUploader } from './ImageUploader';
import { articlesAPI, ArticleCreate, ContentBlock, batchTranslate } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslateButton } from './TranslateButton';
import { toast } from 'sonner';
import { Languages, Loader2 } from 'lucide-react';

interface NewsCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any; // Data from document upload
}

interface FormData {
  category: string;
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  lead_zh: string;
  lead_en: string;
  author: string;
  image_url: string;
  content_zh: string;
  content_en: string;
  status: 'draft' | 'published';
}

export const NewsCreateForm: React.FC<NewsCreateFormProps> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const { language } = useLanguage();

  // Helper function to convert content blocks to text
  const contentBlocksToText = (blocks: any[]): string => {
    if (!blocks || blocks.length === 0) return '';

    return blocks.map(block => {
      // Get content from either 'content', 'text', or other fields
      const getContent = () => block.content || block.text || '';

      if (block.type === 'heading') {
        const prefix = '#'.repeat(block.level || 1);
        return `${prefix} ${getContent()}`;
      } else if (block.type === 'paragraph') {
        return getContent();
      } else if (block.type === 'image') {
        const alt = block.alt || block.caption || '';
        const url = block.url || getContent();
        return `![${alt}](${url})`;
      } else if (block.type === 'code') {
        const lang = block.language || '';
        return `\`\`\`${lang}\n${getContent()}\n\`\`\``;
      } else if (block.type === 'quote') {
        return `> ${getContent()}`;
      } else if (block.type === 'list') {
        if (block.items && Array.isArray(block.items)) {
          return block.items.map((item: string) => `- ${item}`).join('\n');
        }
        // If content is a string with newlines, split it
        const content = getContent();
        if (content.includes('\n')) {
          return content.split('\n').map((item: string) => `- ${item.trim()}`).join('\n');
        }
        return `- ${content}`;
      }
      return getContent();
    }).filter(text => text.trim()).join('\n\n');
  };

  // Initialize form data from uploaded document or empty
  const getInitialFormData = (): FormData => {
    if (initialData?.parse_result) {
      const { parse_result } = initialData;

      console.log('📄 Initializing form from uploaded document:', parse_result);

      return {
        category: parse_result.category || 'headline',
        title_zh: parse_result.title || '',
        title_en: parse_result.title_en || '', // Use translated title if available
        summary_zh: parse_result.summary || '',
        summary_en: parse_result.summary_en || '', // Use translated summary if available
        lead_zh: '',
        lead_en: '',
        author: '',
        image_url: parse_result.images_uploaded?.[0]?.uploaded_url || '',
        content_zh: contentBlocksToText(parse_result.content_zh || []),
        content_en: parse_result.content_en ? contentBlocksToText(parse_result.content_en) : '',
        status: 'draft'
      };
    }
    return {
      category: 'headline',
      title_zh: '',
      title_en: '',
      summary_zh: '',
      summary_en: '',
      lead_zh: '',
      lead_en: '',
      author: '',
      image_url: '',
      content_zh: '',
      content_en: '',
      status: 'draft'
    };
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData());

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isBatchTranslating, setIsBatchTranslating] = useState(false);

  // Debug: Monitor formData changes
  useEffect(() => {
    console.log('🔄 formData changed:', formData);
  }, [formData]);

  // 处理表单字段变化
  const handleChange = (field: keyof FormData, value: string) => {
    console.log('📝 handleChange called:', { field, value, currentValue: formData[field] });

    // Force update by creating a completely new object
    const newFormData = {
      ...formData,
      [field]: value
    };

    console.log('📝 Setting new formData:', newFormData);
    setFormData(newFormData);

    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // 必填字段
    if (!formData.title_zh.trim()) {
      newErrors.title_zh = '请输入中文标题';
    }
    if (!formData.title_en.trim()) {
      newErrors.title_en = '请输入英文标题';
    }
    if (!formData.summary_zh.trim()) {
      newErrors.summary_zh = '请输入中文摘要';
    } else if (formData.summary_zh.length < 20 || formData.summary_zh.length > 150) {
      newErrors.summary_zh = '中文摘要长度应在 20-150 字符之间';
    }
    if (!formData.summary_en.trim()) {
      newErrors.summary_en = '请输入英文摘要';
    } else if (formData.summary_en.length < 20 || formData.summary_en.length > 300) {
      newErrors.summary_en = '英文摘要长度应在 20-300 字符之间';
    }
    if (!formData.content_zh.trim()) {
      newErrors.content_zh = '请输入中文内容';
    }
    if (!formData.content_en.trim()) {
      newErrors.content_en = '请输入英文内容';
    }
    if (!formData.category) {
      newErrors.category = '请选择模块';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 批量翻译所有字段（中文 → 英文）
  const handleBatchTranslate = async () => {
    // 验证中文字段是否已填写
    if (!formData.title_zh.trim()) {
      toast.error('请先填写中文标题');
      return;
    }
    if (!formData.summary_zh.trim()) {
      toast.error('请先填写中文摘要');
      return;
    }
    if (!formData.content_zh.trim()) {
      toast.error('请先填写中文内容');
      return;
    }

    setIsBatchTranslating(true);

    try {
      const fields = [
        { field_name: 'title_zh', text: formData.title_zh.trim() },
        { field_name: 'summary_zh', text: formData.summary_zh.trim() },
        { field_name: 'content_zh', text: formData.content_zh.trim() },
      ];

      // 如果有中文导语，也翻译
      if (formData.lead_zh.trim()) {
        fields.push({ field_name: 'lead_zh', text: formData.lead_zh.trim() });
      }

      const result = await batchTranslate({
        fields,
        source_lang: 'zh',
        target_lang: 'en',
      });

      // 更新表单数据
      const updates: Partial<FormData> = {};
      result.results.forEach(item => {
        if (item.field_name === 'title_zh') {
          updates.title_en = item.translated_text;
        } else if (item.field_name === 'summary_zh') {
          updates.summary_en = item.translated_text;
        } else if (item.field_name === 'content_zh') {
          updates.content_en = item.translated_text;
        } else if (item.field_name === 'lead_zh') {
          updates.lead_en = item.translated_text;
        }
      });

      setFormData(prev => ({ ...prev, ...updates }));

      toast.success(
        `批量翻译完成！共翻译 ${result.total_fields} 个字段，${result.cached_count} 个来自缓存`
      );
    } catch (error: any) {
      console.error('Batch translation error:', error);
      toast.error(error.message || '批量翻译失败，请重试');
    } finally {
      setIsBatchTranslating(false);
    }
  };

  // 将文本内容转换为内容块（支持 Markdown 语法）
  const textToContentBlocks = (text: string): ContentBlock[] => {
    const lines = text.split('\n');
    const blocks: ContentBlock[] = [];
    let i = 0;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let codeLanguage = '';

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip empty lines (unless in code block)
      if (!trimmedLine && !inCodeBlock) {
        i++;
        continue;
      }

      // T067: 代码块检测 (```)
      if (trimmedLine.startsWith('```')) {
        if (!inCodeBlock) {
          // 开始代码块
          inCodeBlock = true;
          codeLanguage = trimmedLine.substring(3).trim() || 'text';
          codeBlockLines = [];
        } else {
          // 结束代码块
          inCodeBlock = false;
          blocks.push({
            type: 'code' as const,
            text: codeBlockLines.join('\n'),
            language: codeLanguage
          });
          codeBlockLines = [];
          codeLanguage = '';
        }
        i++;
        continue;
      }

      // 如果在代码块中，收集代码行
      if (inCodeBlock) {
        codeBlockLines.push(line);
        i++;
        continue;
      }

      // T066: 多级标题检测 (####, ###, ##, #)
      const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        blocks.push({
          type: 'heading' as const,
          text,
          level
        });
        i++;
        continue;
      }

      // T068: 引用检测 (>)
      if (trimmedLine.startsWith('>')) {
        const quoteText = trimmedLine.substring(1).trim();
        blocks.push({
          type: 'quote' as const,
          text: quoteText
        });
        i++;
        continue;
      }

      // T065: 图片检测 ![alt](url)
      const imageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        const alt = imageMatch[1];
        const url = imageMatch[2];
        blocks.push({
          type: 'image' as const,
          url,
          alt,
          caption: alt
        });
        i++;
        continue;
      }

      // 列表检测 (- 或 * 或 数字.)
      const unorderedListMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
      const orderedListMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);

      if (unorderedListMatch || orderedListMatch) {
        const items: string[] = [];

        // 收集连续的列表项
        while (i < lines.length) {
          const currentLine = lines[i].trim();
          const unorderedMatch = currentLine.match(/^[-*]\s+(.+)$/);
          const orderedMatch = currentLine.match(/^\d+\.\s+(.+)$/);

          if (unorderedMatch) {
            items.push(unorderedMatch[1]);
            i++;
          } else if (orderedMatch) {
            items.push(orderedMatch[1]);
            i++;
          } else if (!currentLine) {
            // 空行，继续检查下一行
            i++;
            if (i < lines.length && lines[i].trim().match(/^[-*\d]/)) {
              continue;
            } else {
              break;
            }
          } else {
            break;
          }
        }

        if (items.length > 0) {
          blocks.push({
            type: 'list' as const,
            items
          });
        }
        continue;
      }

      // 默认：段落
      if (trimmedLine) {
        blocks.push({
          type: 'paragraph' as const,
          text: trimmedLine
        });
      }

      i++;
    }

    // 如果代码块没有关闭，添加剩余的代码
    if (inCodeBlock && codeBlockLines.length > 0) {
      blocks.push({
        type: 'code' as const,
        text: codeBlockLines.join('\n'),
        language: codeLanguage
      });
    }

    return blocks;
  };

  // 提交表单
  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const articleData: ArticleCreate = {
        category: formData.category,
        title_zh: formData.title_zh.trim(),
        title_en: formData.title_en.trim(),
        summary_zh: formData.summary_zh.trim(),
        summary_en: formData.summary_en.trim(),
        content_zh: textToContentBlocks(formData.content_zh),
        content_en: textToContentBlocks(formData.content_en),
        author: formData.author.trim() || '匿名',
        image_url: formData.image_url || undefined,
        status: status
      };

      await articlesAPI.create(articleData);
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '创建文章失败';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="news-create-form-overlay">
      <div className="news-create-form-container">
        <div className="form-header">
          <h2>{language === 'zh' ? '创建新文章' : 'Create New Article'}</h2>
          <button
            type="button"
            onClick={onCancel}
            className="btn-close"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="form-content">
          {submitError && (
            <div className="alert alert-error">
              {submitError}
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            {/* 模块选择 */}
            <div className="form-group">
              <label className="form-label required">
                {language === 'zh' ? '模块分类' : 'Category'}
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className={`form-select ${errors.category ? 'error' : ''}`}
              >
                {NEWS_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.labelEn} / {cat.labelZh}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            {/* 中文标题 */}
            <div className="form-group">
              <label className="form-label required">
                {language === 'zh' ? '中文标题' : 'Chinese Title'}
              </label>
              <input
                type="text"
                value={formData.title_zh}
                onChange={(e) => handleChange('title_zh', e.target.value)}
                className={`form-input ${errors.title_zh ? 'error' : ''}`}
                placeholder="请输入中文标题"
              />
              {errors.title_zh && <span className="error-text">{errors.title_zh}</span>}
            </div>

            {/* 英文标题 */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label required">
                  {language === 'zh' ? '英文标题' : 'English Title'}
                </label>
                <TranslateButton
                  text={formData.title_zh}
                  sourceLang="zh"
                  targetLang="en"
                  onTranslated={(translated) => handleChange('title_en', translated)}
                  size="sm"
                  variant="outline"
                />
              </div>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => handleChange('title_en', e.target.value)}
                className={`form-input ${errors.title_en ? 'error' : ''}`}
                placeholder="Enter English title"
              />
              {errors.title_en && <span className="error-text">{errors.title_en}</span>}
            </div>

            {/* 中文摘要 */}
            <div className="form-group">
              <label className="form-label required">
                {language === 'zh' ? '中文摘要' : 'Chinese Summary'} (20-150字符)
              </label>
              <textarea
                value={formData.summary_zh}
                onChange={(e) => handleChange('summary_zh', e.target.value)}
                className={`form-textarea ${errors.summary_zh ? 'error' : ''}`}
                placeholder="请输入中文摘要（20-150字符）"
                rows={3}
              />
              <div className="char-count">
                {formData.summary_zh.length} / 150
              </div>
              {errors.summary_zh && <span className="error-text">{errors.summary_zh}</span>}
            </div>

            {/* 英文摘要 */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label required">
                  {language === 'zh' ? '英文摘要' : 'English Summary'} (20-300 characters)
                </label>
                <TranslateButton
                  text={formData.summary_zh}
                  sourceLang="zh"
                  targetLang="en"
                  onTranslated={(translated) => handleChange('summary_en', translated)}
                  size="sm"
                  variant="outline"
                />
              </div>
              <textarea
                value={formData.summary_en}
                onChange={(e) => handleChange('summary_en', e.target.value)}
                className={`form-textarea ${errors.summary_en ? 'error' : ''}`}
                placeholder="Enter English summary (20-300 characters)"
                rows={4}
              />
              <div className="char-count">
                {formData.summary_en.length} / 300
              </div>
              {errors.summary_en && <span className="error-text">{errors.summary_en}</span>}
            </div>

            {/* 图片上传 */}
            <div className="form-group">
              <label className="form-label">
                {language === 'zh' ? '文章图片' : 'Article Image'}
              </label>
              <ImageUploader
                currentImageUrl={formData.image_url}
                onUploadSuccess={(url) => handleChange('image_url', url)}
                onUploadError={(error) => setSubmitError(error)}
              />
            </div>

            {/* 作者 */}
            <div className="form-group">
              <label className="form-label">
                {language === 'zh' ? '作者' : 'Author'}
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                className="form-input"
                placeholder={language === 'zh' ? '请输入作者名称（可选）' : 'Enter author name (optional)'}
              />
            </div>

            {/* 中文导语 */}
            <div className="form-group">
              <label className="form-label">
                {language === 'zh' ? '中文导语' : 'Chinese Lead'}
              </label>
              <textarea
                value={formData.lead_zh}
                onChange={(e) => handleChange('lead_zh', e.target.value)}
                className="form-textarea"
                placeholder="请输入中文导语（可选）"
                rows={3}
              />
            </div>

            {/* 英文导语 */}
            <div className="form-group">
              <label className="form-label">
                {language === 'zh' ? '英文导语' : 'English Lead'}
              </label>
              <textarea
                value={formData.lead_en}
                onChange={(e) => handleChange('lead_en', e.target.value)}
                className="form-textarea"
                placeholder="Enter English lead (optional)"
                rows={3}
              />
            </div>

            {/* 中文内容 */}
            <div className="form-group">
              <label className="form-label required">
                {language === 'zh' ? '中文内容' : 'Chinese Content'}
              </label>
              <textarea
                value={formData.content_zh}
                onChange={(e) => handleChange('content_zh', e.target.value)}
                className={`form-textarea ${errors.content_zh ? 'error' : ''}`}
                placeholder="请输入中文内容。支持简单的 Markdown 格式：&#10;# 一级标题&#10;## 二级标题&#10;普通段落"
                rows={10}
              />
              {errors.content_zh && <span className="error-text">{errors.content_zh}</span>}
            </div>

            {/* 英文内容 */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-2">
                <label className="form-label required">
                  {language === 'zh' ? '英文内容' : 'English Content'}
                </label>
                <TranslateButton
                  text={formData.content_zh}
                  sourceLang="zh"
                  targetLang="en"
                  onTranslated={(translated) => handleChange('content_en', translated)}
                  size="sm"
                  variant="outline"
                />
              </div>
              <textarea
                value={formData.content_en}
                onChange={(e) => handleChange('content_en', e.target.value)}
                className={`form-textarea ${errors.content_en ? 'error' : ''}`}
                placeholder="Enter English content. Supports simple Markdown:&#10;# Heading 1&#10;## Heading 2&#10;Normal paragraph"
                rows={10}
              />
              {errors.content_en && <span className="error-text">{errors.content_en}</span>}
            </div>

            {/* 批量翻译按钮 */}
            <div className="form-group">
              <button
                type="button"
                onClick={handleBatchTranslate}
                disabled={isBatchTranslating || !formData.title_zh || !formData.summary_zh || !formData.content_zh}
                className="btn btn-outline w-full"
              >
                {isBatchTranslating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    批量翻译中...
                  </>
                ) : (
                  <>
                    <Languages className="mr-2 h-4 w-4" />
                    全部翻译（中文 → 英文）
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2">
                一键翻译所有中文字段到英文（标题、摘要、内容、导语）
              </p>
            </div>
          </form>
        </div>

        <div className="form-footer">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting || isBatchTranslating}
          >
            {language === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            className="btn btn-outline"
            disabled={isSubmitting || isBatchTranslating}
          >
            {isSubmitting ? (language === 'zh' ? '保存中...' : 'Saving...') : (language === 'zh' ? '保存为草稿' : 'Save as Draft')}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            className="btn btn-primary"
            disabled={isSubmitting || isBatchTranslating}
          >
            {isSubmitting ? (language === 'zh' ? '发布中...' : 'Publishing...') : (language === 'zh' ? '发布文章' : 'Publish Article')}
          </button>
        </div>
      </div>

      <style>{`
        .news-create-form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .news-create-form-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .form-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }

        .btn-close {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          font-size: 32px;
          line-height: 1;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s;
        }

        .btn-close:hover {
          color: #111827;
        }

        .form-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-label.required::after {
          content: ' *';
          color: #dc2626;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          color: #111827;
          background-color: #ffffff;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #9ca3af;
          opacity: 1;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #00a4e4;
          box-shadow: 0 0 0 3px rgba(0, 164, 228, 0.1);
        }

        .form-input.error,
        .form-select.error,
        .form-textarea.error {
          border-color: #dc2626;
        }

        .form-textarea {
          resize: vertical;
          font-family: inherit;
        }

        .char-count {
          text-align: right;
          font-size: 12px;
          color: #6b7280;
          margin-top: 4px;
        }

        .error-text {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #dc2626;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .alert-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background-color: #00a4e4;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #0284c7;
        }

        .btn-outline {
          background-color: white;
          color: #00a4e4;
          border: 1px solid #00a4e4;
        }

        .btn-outline:hover:not(:disabled) {
          background-color: #f0f9ff;
        }

        .btn-secondary {
          background-color: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e5e7eb;
        }
      `}</style>
    </div>
  );
};

export default NewsCreateForm;

