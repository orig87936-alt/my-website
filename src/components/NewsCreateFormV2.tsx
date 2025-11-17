/**
 * News Create Form Component (V2)
 * T079-T081: Support 8 languages with auto-translation
 */

import React, { useState, useEffect } from 'react';
import { NEWS_CATEGORIES } from '../constants/newsCategories';
import { ImageUploader } from './ImageUploader';
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
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-start justify-center overflow-y-auto py-8">
      <div className="bg-[#0a2540] rounded-2xl border border-white/10 w-full max-w-6xl mx-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0a2540] z-10">
          <h2 className="text-2xl font-light text-white">
            {t('news.createArticle')}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
              {submitError}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('news.category')} <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-[#1a3a5a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
            >
              {NEWS_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('news.author')} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full bg-[#1a3a5a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              placeholder={t('news.authorPlaceholder')}
            />
            {errors.author && <p className="text-red-400 text-sm mt-1">{errors.author}</p>}
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('news.imageUrl')}
            </label>
            <ImageUploader
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              onUpload={uploadImage}
            />
          </div>

          {/* Title - Multi-language */}
          <MultiLangInput
            label={t('news.title')}
            values={formData.title}
            onChange={(values) => setFormData({ ...formData, title: values })}
            required
            error={errors.title_zh}
            InputComponent={(props) => (
              <input
                {...props}
                type="text"
                className="w-full bg-[#1a3a5a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
              />
            )}
          />

          {/* Summary - Multi-language */}
          <MultiLangInput
            label={t('news.summary')}
            values={formData.summary}
            onChange={(values) => setFormData({ ...formData, summary: values })}
            InputComponent={(props) => (
              <textarea
                {...props}
                rows={3}
                className="w-full bg-[#1a3a5a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] resize-none"
              />
            )}
          />

          {/* Content - Multi-language */}
          <MultiLangInput
            label={t('news.content')}
            values={formData.content}
            onChange={(values) => setFormData({ ...formData, content: values })}
            required
            error={errors.content_zh}
            InputComponent={(props) => (
              <textarea
                {...props}
                rows={15}
                className="w-full bg-[#1a3a5a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4] font-mono text-sm resize-none"
                placeholder="支持 Markdown 格式：# 标题、**粗体**、- 列表、![图片](url) 等"
              />
            )}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-white/10 sticky bottom-0 bg-[#0a2540]">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('news.saveAsDraft')}
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#00a4e4] hover:bg-[#0090cc] text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('news.publish')}
          </button>
        </div>
      </div>
    </div>
  );
};

