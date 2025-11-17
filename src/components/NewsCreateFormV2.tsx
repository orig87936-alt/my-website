/**
 * News Create Form Component (V2)
 * T079-T081: Support 8 languages with auto-translation
 */

import React, { useState, useEffect } from 'react';
import { NEWS_CATEGORIES } from '../constants/newsCategories';
import { ImageUploader } from './ImageUploader';
import { TipTapEditor } from './TipTapEditor';
import { articlesAPI, ArticleCreate, ContentBlock } from '../services/api';
import { uploadImage } from '../services/uploadAPI';
import { useLanguage } from '../contexts/LanguageContext';
import { MultiLangInput } from './MultiLangInput';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';

interface NewsCreateFormV2Props {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any; // Data from document upload
}

// Multi-language content type
type MultiLangContent = {
  zh?: string;
  'zh-tw'?: string;
  en?: string;
  ja?: string;
  es?: string;
  fr?: string;
  ar?: string;
  hi?: string;
};

interface FormData {
  category: string;
  title: MultiLangContent;
  summary: MultiLangContent;
  lead: MultiLangContent;
  author: string;
  image_url: string;
  content: MultiLangContent;
  status: 'draft' | 'published';
}

export const NewsCreateFormV2: React.FC<NewsCreateFormV2Props> = ({
  onSuccess,
  onCancel,
  initialData
}) => {
  const { language, t } = useLanguage();

  // Helper function to convert content blocks to text
  const contentBlocksToText = (blocks: any[]): string => {
    if (!blocks || blocks.length === 0) return '';

    return blocks.map(block => {
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
      
      // Extract translations if available
      const translations = initialData.translations || {};

      return {
        category: parse_result.category || 'headline',
        title: {
          zh: parse_result.title || '',
          ...Object.fromEntries(
            Object.entries(translations).map(([lang, data]: [string, any]) => [
              lang === 'zh-tw' ? 'zh-tw' : lang,
              data.title || ''
            ])
          )
        },
        summary: {
          zh: parse_result.summary || '',
          ...Object.fromEntries(
            Object.entries(translations).map(([lang, data]: [string, any]) => [
              lang === 'zh-tw' ? 'zh-tw' : lang,
              data.summary || ''
            ])
          )
        },
        lead: {},
        author: '',
        image_url: parse_result.images_uploaded?.[0]?.uploaded_url || '',
        content: {
          zh: contentBlocksToText(parse_result.content_zh || []),
          ...Object.fromEntries(
            Object.entries(translations).map(([lang, data]: [string, any]) => [
              lang === 'zh-tw' ? 'zh-tw' : lang,
              data.content_zh ? contentBlocksToText(data.content_zh) : ''
            ])
          )
        },
        status: 'draft'
      };
    }

    return {
      category: 'headline',
      title: {},
      summary: {},
      lead: {},
      author: '',
      image_url: '',
      content: {},
      status: 'draft'
    };
  };

  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Helper function to convert text to content blocks
  const textToContentBlocks = (text: string): ContentBlock[] => {
    if (!text || !text.trim()) return [];

    const blocks: ContentBlock[] = [];
    const lines = text.split('\n');
    let currentParagraph = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Heading
      if (trimmedLine.startsWith('#')) {
        if (currentParagraph) {
          blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
        const match = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          blocks.push({
            type: 'heading',
            level: match[1].length,
            content: match[2]
          });
        }
      }
      // Image
      else if (trimmedLine.startsWith('![')) {
        if (currentParagraph) {
          blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
        const match = trimmedLine.match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (match) {
          blocks.push({
            type: 'image',
            url: match[2],
            alt: match[1] || '',
            caption: match[1] || ''
          });
        }
      }
      // Quote
      else if (trimmedLine.startsWith('>')) {
        if (currentParagraph) {
          blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
        blocks.push({
          type: 'quote',
          content: trimmedLine.substring(1).trim()
        });
      }
      // List item
      else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        if (currentParagraph) {
          blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
        blocks.push({
          type: 'list',
          content: trimmedLine.substring(1).trim()
        });
      }
      // Empty line
      else if (!trimmedLine) {
        if (currentParagraph) {
          blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
          currentParagraph = '';
        }
      }
      // Regular text
      else {
        currentParagraph += (currentParagraph ? ' ' : '') + trimmedLine;
      }
    }

    // Add remaining paragraph
    if (currentParagraph) {
      blocks.push({ type: 'paragraph', content: currentParagraph.trim() });
    }

    return blocks;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category) {
      newErrors.category = t('news.errors.categoryRequired');
    }

    if (!formData.title.zh?.trim()) {
      newErrors.title_zh = t('news.errors.titleRequired');
    }

    if (!formData.content.zh?.trim()) {
      newErrors.content_zh = t('news.errors.contentRequired');
    }

    if (!formData.author?.trim()) {
      newErrors.author = t('news.errors.authorRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validateForm()) {
      toast.error(t('news.errors.validationFailed'));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const articleData: ArticleCreate = {
        category: formData.category,
        title_zh: formData.title.zh?.trim() || '',
        title_zh_tw: formData.title['zh-tw']?.trim() || '',
        title_en: formData.title.en?.trim() || '',
        title_ja: formData.title.ja?.trim() || '',
        title_es: formData.title.es?.trim() || '',
        title_fr: formData.title.fr?.trim() || '',
        title_ar: formData.title.ar?.trim() || '',
        title_hi: formData.title.hi?.trim() || '',
        summary_zh: formData.summary.zh?.trim() || '',
        summary_zh_tw: formData.summary['zh-tw']?.trim() || '',
        summary_en: formData.summary.en?.trim() || '',
        summary_ja: formData.summary.ja?.trim() || '',
        summary_es: formData.summary.es?.trim() || '',
        summary_fr: formData.summary.fr?.trim() || '',
        summary_ar: formData.summary.ar?.trim() || '',
        summary_hi: formData.summary.hi?.trim() || '',
        content_zh: textToContentBlocks(formData.content.zh || ''),
        content_zh_tw: textToContentBlocks(formData.content['zh-tw'] || ''),
        content_en: textToContentBlocks(formData.content.en || ''),
        content_ja: textToContentBlocks(formData.content.ja || ''),
        content_es: textToContentBlocks(formData.content.es || ''),
        content_fr: textToContentBlocks(formData.content.fr || ''),
        content_ar: textToContentBlocks(formData.content.ar || ''),
        content_hi: textToContentBlocks(formData.content.hi || ''),
        author: formData.author.trim() || '匿名',
        image_url: formData.image_url || undefined,
        status: status
      };

      await articlesAPI.create(articleData);
      toast.success(status === 'published' ? t('news.publishSuccess') : t('news.draftSaved'));
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('news.errors.createFailed');
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="news-create-form-overlay">
      <div className="news-create-form-container">
        {/* Header */}
        <div className="form-header">
          <h2>{t('news.createArticle')}</h2>
          <button
            onClick={onCancel}
            className="btn-close"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="form-content">
          <form>
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mb-4">
                {submitError}
              </div>
            )}

            {/* Category */}
            <div className="form-group">
              <label className="form-label required">
                {t('news.category')}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-select"
              >
                {NEWS_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            {/* Author */}
            <div className="form-group">
              <label className="form-label required">
                {t('news.author')}
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="form-input"
                placeholder={t('news.authorPlaceholder')}
              />
              {errors.author && <span className="error-text">{errors.author}</span>}
            </div>

            {/* Image URL */}
            <div className="form-group">
              <label className="form-label">
                {t('news.imageUrl')}
              </label>
              <ImageUploader
                currentImageUrl={formData.image_url}
                onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
                onUploadError={(error) => setSubmitError(error)}
              />
            </div>

            {/* Title - Multi-language (8 languages) */}
            <div className="form-group">
              <MultiLangInput
                label={t('news.title')}
                values={formData.title}
                onChange={(values) => setFormData({ ...formData, title: values })}
                type="text"
                placeholder={t('news.title')}
                requiredLangs={['zh']}
                expandedByDefault={false}
              />
              {errors.title_zh && <span className="error-text">{errors.title_zh}</span>}
            </div>

            {/* Summary - Multi-language (8 languages) */}
            <div className="form-group">
              <MultiLangInput
                label={t('news.summary')}
                values={formData.summary}
                onChange={(values) => setFormData({ ...formData, summary: values })}
                type="textarea"
                placeholder={t('news.summary')}
                requiredLangs={['zh']}
                expandedByDefault={false}
                rows={3}
              />
            </div>

            {/* Content - Multi-language with Rich Text Editor (8 languages) */}
            <div className="form-group">
              <label className="form-label required">
                {t('news.content')}
              </label>

              {/* Chinese Content (Primary) */}
              <div className="space-y-2 mb-4">
                <div className="text-xs text-gray-500">简体中文</div>
                <TipTapEditor
                  value={formData.content.zh || ''}
                  onChange={(value) => setFormData({ ...formData, content: { ...formData.content, zh: value } })}
                  placeholder={t('news.content')}
                  minHeight="400px"
                  onImageUpload={async (file) => {
                    const url = await uploadImage(file);
                    return url;
                  }}
                />
                {errors.content_zh && <span className="error-text">{errors.content_zh}</span>}
              </div>

              {/* Other Languages - Use MultiLangInput for text-based content */}
              <MultiLangInput
                label="其他语言内容"
                values={Object.fromEntries(
                  Object.entries(formData.content).filter(([lang]) => lang !== 'zh')
                )}
                onChange={(values) => setFormData({
                  ...formData,
                  content: { ...formData.content, ...values }
                })}
                type="textarea"
                placeholder={t('news.content')}
                requiredLangs={[]}
                expandedByDefault={false}
                rows={15}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="form-footer">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="btn btn-outline"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                {t('news.saveAsDraft')}...
              </>
            ) : (
              t('news.saveAsDraft')
            )}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                {t('news.publish')}...
              </>
            ) : (
              t('news.publish')
            )}
          </button>
        </div>
      </div>

      {/* Styles */}
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
          font-weight: 600;
          color: #111827;
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

        .error-text {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #dc2626;
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
          background-color: #0090cc;
        }

        .btn-outline {
          background-color: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-outline:hover:not(:disabled) {
          background-color: #f9fafb;
          border-color: #9ca3af;
        }

        .btn-secondary {
          background-color: transparent;
          color: #6b7280;
        }

        .btn-secondary:hover:not(:disabled) {
          color: #374151;
        }
      `}</style>
    </div>
  );
};

