/**
 * News Create Form Component (V2)
 * T079-T081: Support 8 languages with auto-translation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NEWS_CATEGORIES } from '../constants/newsCategories';
import { ImageUploader } from './ImageUploader';
import { TipTapEditor } from './TipTapEditor';
import { articlesAPI, ArticleCreate, ContentBlock, translateText } from '../services/api';
import { uploadImage } from '../services/uploadAPI';
import { useLanguage } from '../contexts/LanguageContext';
import { MultiLangInput } from './MultiLangInput';
import { toast } from 'sonner';
import { X, Loader2, Languages } from 'lucide-react';

interface NewsCreateFormV2Props {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any; // Data from document upload
}

// Multi-language content type
type MultiLangContent = {
  'zh-CN'?: string;
  'zh-TW'?: string;
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
  console.log('🚀 NewsCreateFormV2 rendered with initialData:', {
    has_initialData: !!initialData,
    has_parse_result: !!initialData?.parse_result,
    initialData_keys: initialData ? Object.keys(initialData) : [],
    parse_result_keys: initialData?.parse_result ? Object.keys(initialData.parse_result) : [],
    translations_keys: initialData?.parse_result?.translations ? Object.keys(initialData.parse_result.translations) : []
  });

  const { language, t } = useLanguage();

  // Helper function to convert content blocks to text
  const contentBlocksToText = (blocks: any[], debugLang?: string): string => {
    if (!blocks || blocks.length === 0) {
      console.log(`⚠️ contentBlocksToText [${debugLang || 'unknown'}] - No blocks provided:`, blocks);
      return '';
    }

    console.log(`📝 contentBlocksToText [${debugLang || 'unknown'}] - Processing ${blocks.length} blocks`);
    console.log(`📝 First block [${debugLang || 'unknown'}]:`, JSON.stringify(blocks[0], null, 2));

    const result = blocks.map((block, index) => {
      // Try to get content from multiple possible fields
      const getContent = () => {
        // Priority: content > text > data
        const content = block.content || block.text || block.data || '';
        if (!content && index === 0) {
          console.warn(`⚠️ Block ${index} [${debugLang || 'unknown'}] has no content:`, block);
        }
        return content;
      };

      const content = getContent();

      // 详细日志，特别是对于 zh-TW
      if (debugLang === 'zh-TW' && index < 3) {
        console.log(`  🔍 Block ${index} [${debugLang}] - DETAILED:`, {
          type: block.type,
          content_length: content.length,
          content_preview: content.substring(0, 100),
          has_content_field: !!block.content,
          has_text_field: !!block.text,
          has_data_field: !!block.data,
          full_block: block
        });
      } else {
        console.log(`  Block ${index} [${debugLang || 'unknown'}] - type: ${block.type}, content length: ${content.length}`);
      }

      if (block.type === 'heading') {
        const prefix = '#'.repeat(block.level || 1);
        return `${prefix} ${content}`;
      } else if (block.type === 'paragraph') {
        return content;
      } else if (block.type === 'image') {
        const alt = block.alt || block.caption || '';
        const url = block.url || content;
        console.log(`📸 Image block [${debugLang || 'unknown'}]:`, {
          has_url: !!block.url,
          has_content: !!content,
          url: url,
          alt: alt,
          full_block: block
        });
        return `![${alt}](${url})`;
      } else if (block.type === 'code') {
        const lang = block.language || '';
        return `\`\`\`${lang}\n${content}\n\`\`\``;
      } else if (block.type === 'quote') {
        return `> ${content}`;
      } else if (block.type === 'list') {
        if (block.items && Array.isArray(block.items)) {
          return block.items.map((item: string) => `- ${item}`).join('\n');
        }
        if (content.includes('\n')) {
          return content.split('\n').map((item: string) => `- ${item.trim()}`).join('\n');
        }
        return `- ${content}`;
      }
      return content;
    }).filter(text => text && text.trim()).join('\n\n');

    console.log(`✅ contentBlocksToText [${debugLang || 'unknown'}] - Result length: ${result.length}`);
    console.log(`✅ contentBlocksToText [${debugLang || 'unknown'}] - Preview:`, result.substring(0, 200));

    // 特别为 zh-TW 添加额外日志
    if (debugLang === 'zh-TW') {
      console.log(`🔍 zh-TW FINAL RESULT:`, {
        length: result.length,
        first_100_chars: result.substring(0, 100),
        last_100_chars: result.substring(result.length - 100),
        is_empty: !result || !result.trim()
      });
    }

    return result;
  };

  // Initialize form data from uploaded document or empty
  const getInitialFormData = useCallback((): FormData => {
    if (initialData?.parse_result) {
      const { parse_result } = initialData;

      console.log('🔍 Raw parse_result:', parse_result);
      console.log('🔍 parse_result.translations:', parse_result.translations);

      // Extract translations if available (from parse_result.translations)
      const translations = parse_result.translations || {};

      console.log('📄 Initializing form from uploaded document:', {
        title: parse_result.title,
        summary: parse_result.summary,
        category: parse_result.category,
        translations: Object.keys(translations),
        translationData: translations,
        translationsType: typeof translations,
        translationsIsArray: Array.isArray(translations)
      });

      console.log('🔍 DETAILED translations object:', JSON.stringify(translations, null, 2));

      // Debug: Log each translation's content
      Object.entries(translations).forEach(([lang, data]: [string, any]) => {
        console.log(`🌐 Translation for ${lang}:`, {
          title: data.title?.substring(0, 50),
          summary: data.summary?.substring(0, 50),
          content: data.content ? `${data.content.length} blocks` : 'no content',
          firstBlock: data.content?.[0],
          fullData: data  // 打印完整数据以便调试
        });
      });

      // Helper function to map backend language codes to frontend codes
      const mapLangCode = (lang: string): string => {
        if (lang === 'zh-tw') return 'zh-TW'; // Map 'zh-tw' to 'zh-TW'
        if (lang === 'zh') return 'zh-CN'; // Map 'zh' to 'zh-CN'
        return lang;
      };

      // 先构造简体中文内容，后面 zh-TW 兜底也会用到
      const zhCNContent = contentBlocksToText(parse_result.content_zh || [], 'zh-CN');

      // 从 translations 构造多语言内容
      const translatedContentEntries = Object.entries(translations).map(([lang, data]: [string, any]) => {
        console.log(`🔍 RAW translation entry: lang="${lang}", data keys:`, Object.keys(data));
        const mappedLang = mapLangCode(lang);
        console.log(`🔍 Processing translation for ${lang} -> ${mappedLang}:`, {
          has_content: !!data.content,
          content_type: typeof data.content,
          content_is_array: Array.isArray(data.content),
          content_length: data.content?.length,
          raw_content: data.content
        });

        const contentText = data.content ? contentBlocksToText(data.content, mappedLang) : '';
        console.log(`📝 Content for ${mappedLang}:`, {
          blocks_count: data.content ? data.content.length : 0,
          text_length: contentText.length,
          text_preview: contentText.substring(0, 200)
        });
        return [mappedLang, contentText];
      });

      const content: MultiLangContent = {
        'zh-CN': zhCNContent,
        ...Object.fromEntries(translatedContentEntries)
      };

      // ★ 为 zh-TW 做兜底：如果后端没有返回 zh-tw，或者内容为空，就回退到 zh-CN
      if (!content['zh-TW'] || !content['zh-TW']!.trim()) {
        console.log('⚠️ zh-TW content is empty or missing, falling back to zh-CN');
        content['zh-TW'] = zhCNContent;
      }

      return {
        category: parse_result.category || 'headline',
        title: {
          'zh-CN': parse_result.title || '', // Use 'zh-CN' instead of 'zh'
          ...Object.fromEntries(
            Object.entries(translations).map(([lang, data]: [string, any]) => [
              mapLangCode(lang),
              data.title || ''
            ])
          )
        },
        summary: {
          'zh-CN': parse_result.summary || '', // Use 'zh-CN' instead of 'zh'
          ...Object.fromEntries(
            Object.entries(translations).map(([lang, data]: [string, any]) => [
              mapLangCode(lang),
              data.summary || ''
            ])
          )
        },
        lead: {},
        author: '',
        image_url: '', // 不自动填充封面图片，让用户手动选择
        content,
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
  }, [initialData]);

  console.log('🚀 NewsCreateFormV2 component rendering with initialData:', initialData);
  console.log('🚀 Has parse_result?', !!initialData?.parse_result);
  console.log('🚀 Calling getInitialFormData() for useState initialization...');

  const [formData, setFormData] = useState<FormData>(() => {
    const data = getInitialFormData();
    console.log('🚀 useState initialized with formData:', data);
    console.log('🚀 Content keys:', Object.keys(data.content));
    console.log('🚀 Content lengths:', Object.entries(data.content).map(([k, v]) => `${k}: ${v?.length || 0}`));
    console.log('🚀 zh-CN content length:', data.content['zh-CN']?.length || 0);
    console.log('🚀 zh-TW content length:', data.content['zh-TW']?.length || 0);
    console.log('🚀 zh-TW content preview:', data.content['zh-TW']?.substring(0, 100));
    console.log('🚀 zh-TW content full:', data.content['zh-TW']);
    return data;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    console.log('🔄 useEffect triggered, initialData:', initialData);
    if (initialData?.parse_result) {
      console.log('📄 initialData changed, updating form data:', initialData);

      // Call getInitialFormData to get the latest data
      const newFormData = getInitialFormData();

      console.log('📝 New form data:', newFormData);
      console.log('📝 Content fields:', newFormData.content);
      console.log('📝 zh-TW content length:', newFormData.content['zh-TW']?.length || 0);
      console.log('📝 zh-TW content preview:', newFormData.content['zh-TW']?.substring(0, 200));
      setFormData(newFormData);
    }
  }, [initialData, getInitialFormData]);

  // Helper function to translate a multi-language field
  const translateField = async (
    fieldName: string,
    sourceText: string,
    currentValues: MultiLangContent
  ): Promise<MultiLangContent> => {
    // Backend language codes (lowercase)
    const targetLangs = ['en', 'zh-tw', 'ja', 'es', 'fr', 'ar', 'hi'];
    // Frontend language codes (with proper casing)
    const langCodeMap: Record<string, keyof MultiLangContent> = {
      'en': 'en',
      'zh-tw': 'zh-TW',
      'ja': 'ja',
      'es': 'es',
      'fr': 'fr',
      'ar': 'ar',
      'hi': 'hi'
    };

    const translatedContent: MultiLangContent = { ...currentValues };

    for (const targetLang of targetLangs) {
      try {
        const result = await translateText({
          text: sourceText,
          source_lang: 'zh',
          target_lang: targetLang as any,
        });

        if (result.translated_text) {
          const frontendLangCode = langCodeMap[targetLang];
          translatedContent[frontendLangCode] = result.translated_text;
          toast.success(`${fieldName} - ${targetLang.toUpperCase()} 翻译完成`);
        }
      } catch (error) {
        console.error(`Translation to ${targetLang} failed:`, error);
        toast.error(`${fieldName} - ${targetLang.toUpperCase()} 翻译失败`);
      }
    }

    return translatedContent;
  };

  // Translate all fields (title, summary, content)
  const handleTranslateAll = async () => {
    const zhTitle = formData.title['zh-CN'];
    const zhSummary = formData.summary['zh-CN'];
    const zhContent = formData.content['zh-CN'];

    if (!zhTitle || !zhTitle.trim()) {
      toast.error('请先填写中文标题');
      return;
    }

    setIsTranslatingAll(true);

    try {
      toast.info('开始翻译所有内容到其他语言...');

      // Translate title
      const translatedTitle = await translateField('标题', zhTitle, formData.title);
      setFormData(prev => ({ ...prev, title: translatedTitle }));

      // Translate summary if exists
      if (zhSummary && zhSummary.trim()) {
        const translatedSummary = await translateField('摘要', zhSummary, formData.summary);
        setFormData(prev => ({ ...prev, summary: translatedSummary }));
      }

      // Translate content if exists
      if (zhContent && zhContent.trim()) {
        const translatedContent = await translateField('内容', zhContent, formData.content);
        setFormData(prev => ({ ...prev, content: translatedContent }));
      }

      toast.success('所有内容翻译完成！');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('翻译失败，请重试');
    } finally {
      setIsTranslatingAll(false);
    }
  };

  // Translation handler for content only
  const handleTranslateContent = async () => {
    const zhContent = formData.content['zh-CN'];
    if (!zhContent || !zhContent.trim()) {
      toast.error('请先填写中文内容');
      return;
    }

    setIsTranslating(true);
    // Backend language codes (lowercase)
    const targetLangs = ['en', 'zh-tw', 'ja', 'es', 'fr', 'ar', 'hi'];
    // Frontend language codes (with proper casing)
    const langCodeMap: Record<string, keyof MultiLangContent> = {
      'en': 'en',
      'zh-tw': 'zh-TW',
      'ja': 'ja',
      'es': 'es',
      'fr': 'fr',
      'ar': 'ar',
      'hi': 'hi'
    };

    const translatedContent: MultiLangContent = { ...formData.content };

    try {
      toast.info('开始翻译内容到其他语言...');

      // Translate to each language
      for (const targetLang of targetLangs) {
        try {
          const result = await translateText({
            text: zhContent,
            source_lang: 'zh',
            target_lang: targetLang as any,
          });

          if (result.translated_text) {
            const frontendLangCode = langCodeMap[targetLang];
            translatedContent[frontendLangCode] = result.translated_text;
            toast.success(`${targetLang.toUpperCase()} 翻译完成`);
          }
        } catch (error) {
          console.error(`Translation to ${targetLang} failed:`, error);
          toast.error(`${targetLang.toUpperCase()} 翻译失败`);
        }
      }

      setFormData({ ...formData, content: translatedContent });
      toast.success('所有语言翻译完成！');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('翻译失败，请重试');
    } finally {
      setIsTranslating(false);
    }
  };

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

    if (!formData.title['zh-CN']?.trim()) {
      newErrors.title_zh = t('news.errors.titleRequired');
    }

    if (!formData.content['zh-CN']?.trim()) {
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
      // Helper function to convert empty strings to undefined
      const emptyToUndefined = (value: string | undefined): string | undefined => {
        const trimmed = value?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : undefined;
      };

      // Helper function to provide fallback for required fields
      const getFallbackValue = (value: string | undefined, fallback: string): string => {
        const trimmed = value?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : fallback;
      };

      // Debug: Log form data before creating article
      console.log('📝 Form data before creating article:', {
        content_zh_CN: formData.content['zh-CN']?.substring(0, 100),
        content_zh_TW: formData.content['zh-TW']?.substring(0, 100),
        content_en: formData.content.en?.substring(0, 100),
        content_ja: formData.content.ja?.substring(0, 100),
        content_es: formData.content.es?.substring(0, 100),
        content_fr: formData.content.fr?.substring(0, 100),
        content_ar: formData.content.ar?.substring(0, 100),
        content_hi: formData.content.hi?.substring(0, 100),
      });

      const articleData: ArticleCreate = {
        category: formData.category,
        title_zh: formData.title['zh-CN']?.trim() || '',
        title_zh_tw: emptyToUndefined(formData.title['zh-TW']),
        title_en: getFallbackValue(formData.title.en, formData.title['zh-CN']?.trim() || ''),
        title_ja: emptyToUndefined(formData.title.ja),
        title_es: emptyToUndefined(formData.title.es),
        title_fr: emptyToUndefined(formData.title.fr),
        title_ar: emptyToUndefined(formData.title.ar),
        title_hi: emptyToUndefined(formData.title.hi),
        summary_zh: formData.summary['zh-CN']?.trim() || '',
        summary_zh_tw: emptyToUndefined(formData.summary['zh-TW']),
        summary_en: getFallbackValue(formData.summary.en, formData.summary['zh-CN']?.trim() || ''),
        summary_ja: emptyToUndefined(formData.summary.ja),
        summary_es: emptyToUndefined(formData.summary.es),
        summary_fr: emptyToUndefined(formData.summary.fr),
        summary_ar: emptyToUndefined(formData.summary.ar),
        summary_hi: emptyToUndefined(formData.summary.hi),
        content_zh: textToContentBlocks(formData.content['zh-CN'] || ''),
        content_zh_tw: formData.content['zh-TW']?.trim() ? textToContentBlocks(formData.content['zh-TW']) : undefined,
        content_en: formData.content.en?.trim() ? textToContentBlocks(formData.content.en) : textToContentBlocks(formData.content['zh-CN'] || ''),
        content_ja: formData.content.ja?.trim() ? textToContentBlocks(formData.content.ja) : undefined,
        content_es: formData.content.es?.trim() ? textToContentBlocks(formData.content.es) : undefined,
        content_fr: formData.content.fr?.trim() ? textToContentBlocks(formData.content.fr) : undefined,
        content_ar: formData.content.ar?.trim() ? textToContentBlocks(formData.content.ar) : undefined,
        content_hi: formData.content.hi?.trim() ? textToContentBlocks(formData.content.hi) : undefined,
        author: formData.author.trim() || '匿名',
        image_url: formData.image_url || undefined,
        status: status
      };

      // Debug: Log article data to be sent to API
      console.log('📤 Article data to be sent to API:', {
        ...articleData,
        content_zh: articleData.content_zh?.length + ' blocks',
        content_zh_tw: articleData.content_zh_tw ? articleData.content_zh_tw.length + ' blocks' : 'undefined',
        content_en: articleData.content_en?.length + ' blocks',
        content_ja: articleData.content_ja ? articleData.content_ja.length + ' blocks' : 'undefined',
        content_es: articleData.content_es ? articleData.content_es.length + ' blocks' : 'undefined',
        content_fr: articleData.content_fr ? articleData.content_fr.length + ' blocks' : 'undefined',
        content_ar: articleData.content_ar ? articleData.content_ar.length + ' blocks' : 'undefined',
        content_hi: articleData.content_hi ? articleData.content_hi.length + ' blocks' : 'undefined',
      });

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
                  <option key={cat.value} value={cat.value}>
                    {language === 'zh' ? `${cat.labelEn} / ${cat.labelZh}` : cat.labelEn}
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
                requiredLangs={['zh-CN']}
                expandedByDefault={false}
                theme="light"
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
                requiredLangs={['zh-CN']}
                expandedByDefault={false}
                rows={3}
                theme="light"
              />
            </div>

            {/* Content - Multi-language with Rich Text Editor (8 languages) */}
            <div className="form-group">
              <div className="flex items-center justify-between mb-3">
                <label className="form-label required">
                  {t('news.content')}
                </label>
                <button
                  type="button"
                  onClick={handleTranslateContent}
                  disabled={isTranslating || !formData.content['zh-CN']}
                  className="btn btn-sm btn-outline flex items-center gap-2"
                  title="将中文内容翻译到其他语言"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4" />
                      一键翻译
                    </>
                  )}
                </button>
              </div>

              {/* All Languages with Rich Text Editor */}
              <div className="space-y-4">
                {/* Chinese Content (Primary) */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">简体中文 *</div>
                  <TipTapEditor
                    value={formData.content['zh-CN'] || ''}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, 'zh-CN': value } })}
                    placeholder={t('news.content')}
                    minHeight="400px"
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      return url;
                    }}
                  />
                  {errors.content_zh && <span className="error-text">{errors.content_zh}</span>}
                </div>

                {/* English */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">English</div>
                  <TipTapEditor
                    value={formData.content.en || ''}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, en: value } })}
                    placeholder="Content in English"
                    minHeight="300px"
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      return url;
                    }}
                  />
                </div>

                {/* Traditional Chinese */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">繁體中文</div>
                  {(() => {
                    const zhTWValue = formData.content['zh-TW'] || '';
                    console.log('🎯 Rendering zh-TW TipTapEditor:', {
                      value_length: zhTWValue.length,
                      value_preview: zhTWValue.substring(0, 200),
                      formData_content_keys: Object.keys(formData.content),
                      all_content_lengths: Object.entries(formData.content).map(([k, v]) => `${k}: ${v?.length || 0}`)
                    });
                    return (
                      <TipTapEditor
                        value={zhTWValue}
                        onChange={(value) => setFormData({ ...formData, content: { ...formData.content, 'zh-TW': value } })}
                        placeholder="繁體中文內容"
                        minHeight="300px"
                        onImageUpload={async (file) => {
                          const url = await uploadImage(file);
                          return url;
                        }}
                      />
                    );
                  })()}
                </div>

                {/* Japanese */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">日本語</div>
                  <TipTapEditor
                    value={formData.content.ja || ''}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, ja: value } })}
                    placeholder="日本語の内容"
                    minHeight="300px"
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      return url;
                    }}
                  />
                </div>

                {/* Spanish */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">Español</div>
                  <TipTapEditor
                    value={formData.content.es || ''}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, es: value } })}
                    placeholder="Contenido en español"
                    minHeight="300px"
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      return url;
                    }}
                  />
                </div>

                {/* French */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">Français</div>
                  <TipTapEditor
                    value={formData.content.fr || ''}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, fr: value } })}
                    placeholder="Contenu en français"
                    minHeight="300px"
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      return url;
                    }}
                  />
                </div>

                {/* Arabic */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">العربية</div>
                  <TipTapEditor
                    value={formData.content.ar || ''}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, ar: value } })}
                    placeholder="المحتوى بالعربية"
                    minHeight="300px"
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      return url;
                    }}
                  />
                </div>

                {/* Hindi */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-900">हिन्दी</div>
                  <TipTapEditor
                    value={formData.content.hi || ''}
                    onChange={(value) => setFormData({ ...formData, content: { ...formData.content, hi: value } })}
                    placeholder="हिन्दी में सामग्री"
                    minHeight="300px"
                    onImageUpload={async (file) => {
                      const url = await uploadImage(file);
                      return url;
                    }}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="form-footer">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting || isTranslatingAll}
              className="btn btn-secondary"
            >
              {t('common.cancel')}
            </button>

            {/* Translate All Button */}
            <button
              type="button"
              onClick={handleTranslateAll}
              disabled={isSubmitting || isTranslatingAll || !formData.title['zh-CN']}
              className="btn btn-outline flex items-center gap-2"
              title="一键翻译标题、摘要和内容到其他7种语言"
            >
              {isTranslatingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  翻译中...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  一键翻译全部
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={isSubmitting || isTranslatingAll}
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
              disabled={isSubmitting || isTranslatingAll}
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

        /* Force dark text color for all labels and text in the form */
        .news-create-form-container label,
        .news-create-form-container .form-label,
        .news-create-form-container .text-gray-900,
        .news-create-form-container .text-gray-800,
        .news-create-form-container div[class*="text-gray"] {
          color: #111827 !important;
        }

        /* Force dark text for inputs and always show border */
        .news-create-form-container input,
        .news-create-form-container textarea,
        .news-create-form-container select {
          color: #111827 !important;
          background-color: #ffffff !important;
          border: 1px solid #d1d5db !important;
        }

        /* Dropdown options */
        .news-create-form-container select option {
          color: #111827 !important;
          background-color: #ffffff !important;
        }

        /* Placeholder text should be gray */
        .news-create-form-container input::placeholder,
        .news-create-form-container textarea::placeholder {
          color: #9ca3af !important;
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
          border: 1px solid #d1d5db !important;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          color: #111827 !important;
          background-color: #ffffff !important;
        }

        /* Dropdown options - force dark text on white background */
        .form-select option {
          color: #111827 !important;
          background-color: #ffffff !important;
          padding: 8px 12px;
        }

        /* Additional specificity for select options */
        .news-create-form-container select option {
          color: #111827 !important;
          background-color: #ffffff !important;
        }

        /* Ensure select dropdown is visible */
        .news-create-form-container select {
          color: #111827 !important;
          background-color: #ffffff !important;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #9ca3af !important;
          opacity: 1;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #00a4e4 !important;
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
          justify-content: space-between;
          align-items: center;
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

