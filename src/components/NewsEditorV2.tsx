import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, X, AlertCircle, Languages, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { getNewsArticle, updateNewsArticle, createNewsArticle, NewsArticle } from '../data/newsData';
import { TipTapEditor } from './TipTapEditor';
import { MultiLangInput } from './MultiLangInput';
import { articlesAPI, translateText, translateToMultipleLanguages, SupportedLanguage } from '../services/api';
import { uploadImage as uploadImageAPI } from '../services/uploadAPI';
import { toast } from 'sonner';

interface NewsEditorV2Props {
  articleId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

// Helper function to convert content blocks to plain text
const contentBlocksToText = (blocks: any[]): string => {
  if (!blocks || blocks.length === 0) {
    console.log('⚠️ contentBlocksToText - No blocks provided');
    return '';
  }

  // Debug: Log the first block to see its structure
  if (blocks.length > 0) {
    console.log('🔍 contentBlocksToText - Total blocks:', blocks.length);
    console.log('🔍 contentBlocksToText - First block:', JSON.stringify(blocks[0], null, 2));
    console.log('🔍 contentBlocksToText - Block keys:', Object.keys(blocks[0]));
  }

  const result = blocks.map((block, index) => {
    // Try multiple possible field names for the text content
    // Backend might use 'text', 'content', 'data', or other field names
    let text = '';

    if (block.type === 'list' && block.items) {
      // For list blocks, join items
      text = block.items.map((item: string) => `• ${item}`).join('\n');
    } else {
      // For other blocks, try to find text content
      text = block.text || block.content || block.data || '';

      // If still no text, try to extract from any string field
      if (!text) {
        const stringFields = Object.entries(block)
          .filter(([key, value]) => typeof value === 'string' && key !== 'type' && key !== 'url')
          .map(([_, value]) => value as string);
        text = stringFields[0] || '';
      }
    }

    if (!text && index === 0) {
      console.warn(`⚠️ Block ${index} has no text content:`, block);
    }

    return text;
  }).join('\n\n');

  console.log('🔍 contentBlocksToText - Result length:', result.length);
  console.log('🔍 contentBlocksToText - Result preview:', result.substring(0, 100));

  return result;
};

// Helper function to convert plain text to content blocks
const textToContentBlocks = (text: string): any[] => {
  if (!text || text.trim().length === 0) return [];

  // 如果文本包含 HTML 标签，将其作为 markdown 类型保存
  if (text.includes('<') && text.includes('>')) {
    return [{
      type: 'markdown',
      text: text.trim()
    }];
  }

  // 否则按段落分割
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  return paragraphs.map(p => ({
    type: 'paragraph',
    text: p.trim()
  }));
};

export function NewsEditorV2({ articleId, onClose, onSuccess }: NewsEditorV2Props) {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [translatingContent, setTranslatingContent] = useState<Record<string, boolean>>({});
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);

  // Form data state (8 languages)
  const [formData, setFormData] = useState({
    title: {} as Record<string, string>,
    summary: {} as Record<string, string>,
    content: {} as Record<string, string>,
    author: '',
    image: '',
    category: 'headline'
  });

  useEffect(() => {
    async function loadArticle() {
      try {
        // Check if articleId is a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId);
        let apiArticleId = articleId;

        // If not a UUID, check for ID mapping
        if (!isUUID) {
          const idMapping = JSON.parse(localStorage.getItem('article_id_mapping') || '{}');
          if (idMapping[articleId]) {
            apiArticleId = idMapping[articleId];
            console.log(`🔄 Loading article with mapped ID: ${articleId} -> ${apiArticleId}`);
          } else {
            console.log(`⚠️ No UUID mapping found for ${articleId}, skipping API load`);
            throw new Error('No UUID mapping found');
          }
        }

        // Try to load from API first (only if we have a valid UUID)
        const apiArticle = await articlesAPI.get(apiArticleId);
        if (apiArticle) {
          console.log('✅ Loaded article from API:', apiArticleId);
          console.log('📦 API Article content_zh:', apiArticle.content_zh);
          console.log('📦 API Article content_en:', apiArticle.content_en);
          if (apiArticle.content_zh && apiArticle.content_zh.length > 0) {
            console.log('📦 First content_zh block:', JSON.stringify(apiArticle.content_zh[0], null, 2));
          }
          // Convert API article to form data
          setFormData({
            title: {
              'zh-CN': apiArticle.title_zh || '',
              'zh-TW': apiArticle.title_zh_tw || '',
              en: apiArticle.title_en || '',
              ja: apiArticle.title_ja || '',
              es: apiArticle.title_es || '',
              fr: apiArticle.title_fr || '',
              ar: apiArticle.title_ar || '',
              hi: apiArticle.title_hi || ''
            },
            summary: {
              'zh-CN': apiArticle.summary_zh || '',
              'zh-TW': apiArticle.summary_zh_tw || '',
              en: apiArticle.summary_en || '',
              ja: apiArticle.summary_ja || '',
              es: apiArticle.summary_es || '',
              fr: apiArticle.summary_fr || '',
              ar: apiArticle.summary_ar || '',
              hi: apiArticle.summary_hi || ''
            },
            content: {
              'zh-CN': contentBlocksToText(apiArticle.content_zh || []),
              'zh-TW': contentBlocksToText(apiArticle.content_zh_tw || []),
              en: contentBlocksToText(apiArticle.content_en || []),
              ja: contentBlocksToText(apiArticle.content_ja || []),
              es: contentBlocksToText(apiArticle.content_es || []),
              fr: contentBlocksToText(apiArticle.content_fr || []),
              ar: contentBlocksToText(apiArticle.content_ar || []),
              hi: contentBlocksToText(apiArticle.content_hi || [])
            },
            author: apiArticle.author || '',
            image: apiArticle.image_url || '',
            category: apiArticle.category || 'headline'
          });
          return;
        }
      } catch (error) {
        console.log('ℹ️ Loading from local storage instead:', error);
      }

      // Fallback to local storage
      const loadedArticle = await getNewsArticle(articleId);
      if (loadedArticle) {
        setArticle(loadedArticle);
        setFormData({
          title: {
            'zh-CN': loadedArticle.titleZh || '',
            en: loadedArticle.titleEn || ''
          },
          summary: {
            'zh-CN': loadedArticle.leadZh || '',
            en: loadedArticle.leadEn || ''
          },
          content: {
            'zh-CN': contentBlocksToText(loadedArticle.contentZh || []),
            en: contentBlocksToText(loadedArticle.contentEn || [])
          },
          author: loadedArticle.author || '',
          image: loadedArticle.image || '',
          category: 'headline'
        });
      }
    }
    loadArticle();
  }, [articleId]);

  if (!isAdmin()) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 max-w-md">
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-xl font-medium">
              {language === 'zh-CN' ? '权限不足' : 'Access Denied'}
            </h3>
          </div>
          <p className="text-gray-300 mb-6">
            {language === 'zh-CN'
              ? '只有管理员可以编辑新闻内容'
              : 'Only administrators can edit news content'}
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#00a4e4] hover:bg-[#0088c2] text-white rounded-lg transition-colors"
          >
            {language === 'zh-CN' ? '关闭' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    // Validation
    if (!formData.title['zh-CN']?.trim()) {
      toast.error(language === 'zh-CN' ? '请填写中文标题' : 'Please enter Chinese title');
      return;
    }

    if (!formData.content['zh-CN']?.trim()) {
      toast.error(language === 'zh-CN' ? '请填写中文内容' : 'Please enter Chinese content');
      return;
    }

    setIsSaving(true);

    try {
      console.log('💾 Saving article with formData:', formData);

      // Helper function to convert empty strings to undefined
      const emptyToUndefined = (value: string | undefined): string | undefined => {
        const trimmed = value?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : undefined;
      };

      // Prepare article data for API
      const articleData = {
        category: formData.category,
        title_zh: formData.title['zh-CN']?.trim() || '',
        title_zh_tw: emptyToUndefined(formData.title['zh-TW']),
        title_en: emptyToUndefined(formData.title.en),
        title_ja: emptyToUndefined(formData.title.ja),
        title_es: emptyToUndefined(formData.title.es),
        title_fr: emptyToUndefined(formData.title.fr),
        title_ar: emptyToUndefined(formData.title.ar),
        title_hi: emptyToUndefined(formData.title.hi),
        summary_zh: formData.summary['zh-CN']?.trim() || '',
        summary_zh_tw: emptyToUndefined(formData.summary['zh-TW']),
        summary_en: emptyToUndefined(formData.summary.en),
        summary_ja: emptyToUndefined(formData.summary.ja),
        summary_es: emptyToUndefined(formData.summary.es),
        summary_fr: emptyToUndefined(formData.summary.fr),
        summary_ar: emptyToUndefined(formData.summary.ar),
        summary_hi: emptyToUndefined(formData.summary.hi),
        content_zh: textToContentBlocks(formData.content['zh-CN'] || ''),
        content_zh_tw: formData.content['zh-TW']?.trim() ? textToContentBlocks(formData.content['zh-TW']) : undefined,
        content_en: formData.content.en?.trim() ? textToContentBlocks(formData.content.en) : undefined,
        content_ja: formData.content.ja?.trim() ? textToContentBlocks(formData.content.ja) : undefined,
        content_es: formData.content.es?.trim() ? textToContentBlocks(formData.content.es) : undefined,
        content_fr: formData.content.fr?.trim() ? textToContentBlocks(formData.content.fr) : undefined,
        content_ar: formData.content.ar?.trim() ? textToContentBlocks(formData.content.ar) : undefined,
        content_hi: formData.content.hi?.trim() ? textToContentBlocks(formData.content.hi) : undefined,
        author: formData.author.trim() || '匿名',
        image_url: formData.image || undefined,
        status: 'published' as const
      };

      console.log('📤 Article data to be saved:', articleData);

      // Check if articleId is a UUID or needs to be created/mapped
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId);

      if (isUUID) {
        // Update existing article with UUID
        console.log('📝 Updating article with UUID:', articleId);
        await articlesAPI.update(articleId, articleData);
      } else {
        // Check if we have a mapping for this non-UUID ID
        const idMapping = JSON.parse(localStorage.getItem('article_id_mapping') || '{}');

        if (idMapping[articleId]) {
          // Update using mapped UUID
          const mappedId = idMapping[articleId];
          console.log(`🔄 Using mapped ID: ${articleId} -> ${mappedId}`);
          await articlesAPI.update(mappedId, articleData);
        } else {
          // Create new article and save mapping
          console.log('✨ Creating new article for ID:', articleId);
          const createdArticle = await articlesAPI.create(articleData as any);

          // Save ID mapping
          idMapping[articleId] = createdArticle.id;
          localStorage.setItem('article_id_mapping', JSON.stringify(idMapping));
          console.log(`✅ Saved ID mapping: ${articleId} -> ${createdArticle.id}`);
        }
      }

      setSaveSuccess(true);
      toast.success(language === 'zh-CN' ? '保存成功！' : 'Saved successfully!');

      setTimeout(() => {
        setSaveSuccess(false);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to save article:', error);
      toast.error(language === 'zh-CN' ? '保存失败，请重试' : 'Failed to save, please try again');
    } finally {
      setIsSaving(false);
    }
  };

  // Translate content from Chinese to target language
  const handleTranslateContent = async (targetLang: string) => {
    const sourceText = formData.content['zh-CN'];

    if (!sourceText || sourceText.trim().length === 0) {
      toast.error('请先输入简体中文内容');
      return;
    }

    setTranslatingContent({ ...translatingContent, [targetLang]: true });

    try {
      // Map language codes
      const langMap: Record<string, SupportedLanguage> = {
        'zh-TW': 'zh-tw',
        'en': 'en',
        'ja': 'ja',
        'es': 'es',
        'fr': 'fr',
        'ar': 'ar',
        'hi': 'hi'
      };

      const result = await translateText({
        text: sourceText,
        source_lang: 'zh',
        target_lang: langMap[targetLang],
      });

      if (result.translated_text) {
        setFormData({
          ...formData,
          content: {
            ...formData.content,
            [targetLang]: result.translated_text
          }
        });
        toast.success(`${targetLang.toUpperCase()} 内容翻译完成`);
      }
    } catch (error) {
      console.error(`Translation to ${targetLang} failed:`, error);
      toast.error(`${targetLang.toUpperCase()} 翻译失败`);
    } finally {
      setTranslatingContent({ ...translatingContent, [targetLang]: false });
    }
  };

  // Translate content to all languages at once
  const handleTranslateAllContent = async () => {
    const sourceText = formData.content['zh-CN'];

    if (!sourceText || sourceText.trim().length === 0) {
      toast.error('请先输入简体中文内容');
      return;
    }

    setIsTranslatingAll(true);
    toast.info('开始翻译正文到所有语言...');

    try {
      const result = await translateToMultipleLanguages({
        text: sourceText,
        source_lang: 'zh',
        target_langs: ['zh-tw', 'en', 'ja', 'es', 'fr', 'ar', 'hi'],
        force_translate: true,
      });

      console.log('✅ Multi-language translation result:', result);

      // Map backend language codes to frontend codes
      const langMap: Record<string, string> = {
        'zh-tw': 'zh-TW',
        'en': 'en',
        'ja': 'ja',
        'es': 'es',
        'fr': 'fr',
        'ar': 'ar',
        'hi': 'hi'
      };

      // Update all translated content
      let successCount = 0;
      let failCount = 0;

      // Use functional update to ensure we're working with the latest state
      setFormData(prevFormData => {
        const newContent = { ...prevFormData.content };

        for (const [backendLang, frontendLang] of Object.entries(langMap)) {
          if (result.results[backendLang] && result.results[backendLang].translated_text) {
            newContent[frontendLang] = result.results[backendLang].translated_text;
            successCount++;
          } else {
            failCount++;
          }
        }

        console.log('📝 Updated content after translation:', newContent);

        return {
          ...prevFormData,
          content: newContent
        };
      });

      if (successCount > 0) {
        toast.success(`成功翻译 ${successCount} 种语言！${failCount > 0 ? ` (${failCount} 种失败)` : ''}`);
      } else {
        toast.error('翻译失败，请重试');
      }
    } catch (error) {
      console.error('Multi-language translation failed:', error);
      toast.error('批量翻译失败，请重试');
    } finally {
      setIsTranslatingAll(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      console.log('📤 Uploading image:', file.name, file.size, 'bytes');
      const url = await uploadImageAPI(file);
      console.log('✅ Image uploaded successfully:', url);
      return url;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      toast.error(language === 'zh-CN' ? '图片上传失败' : 'Image upload failed');
      throw error;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-[#0a2540] rounded-2xl border border-white/10 shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-[#0a2540] rounded-t-2xl">
          <h2 className="text-xl md:text-2xl font-light text-white">
            {language === 'zh-CN' ? '编辑文章' : 'Edit Article'}
          </h2>
          <div className="flex items-center gap-2 md:gap-3">
            {saveSuccess && (
              <span className="text-xs md:text-sm text-green-400">
                {language === 'zh-CN' ? '保存成功！' : 'Saved!'}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#00a4e4] hover:bg-[#0088c2] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              <Save className="w-4 h-4" />
              {isSaving
                ? (language === 'zh-CN' ? '保存中...' : 'Saving...')
                : (language === 'zh-CN' ? '保存' : 'Save')}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh-CN' ? '作者' : 'Author'}
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                placeholder={language === 'zh-CN' ? '输入作者名称' : 'Enter author name'}
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {language === 'zh-CN' ? '图片URL' : 'Image URL'}
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Title - Multi-language */}
          <MultiLangInput
            label={language === 'zh-CN' ? '标题' : 'Title'}
            values={formData.title}
            onChange={(values) => setFormData({ ...formData, title: values })}
            type="text"
            placeholder={language === 'zh-CN' ? '输入文章标题' : 'Enter article title'}
            requiredLangs={['zh-CN']}
            expandedByDefault={false}
            theme="dark"
          />

          {/* Summary - Multi-language */}
          <MultiLangInput
            label={language === 'zh-CN' ? '摘要' : 'Summary'}
            values={formData.summary}
            onChange={(values) => setFormData({ ...formData, summary: values })}
            type="textarea"
            placeholder={language === 'zh-CN' ? '输入文章摘要' : 'Enter article summary'}
            requiredLangs={['zh-CN']}
            expandedByDefault={false}
            rows={3}
            theme="dark"
          />

          {/* Content - Multi-language with TipTapEditor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">
                {language === 'zh-CN' ? '正文内容' : 'Content'}
              </label>
              <button
                type="button"
                onClick={handleTranslateAllContent}
                disabled={isTranslatingAll || !formData.content['zh-CN']}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-[#00a4e4] to-[#0088c2] hover:from-[#0088c2] hover:to-[#006a9a] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                title="将简体中文正文翻译到所有其他语言"
              >
                {isTranslatingAll ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    翻译中...
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4" />
                    翻译到所有语言
                  </>
                )}
              </button>
            </div>

            {/* Chinese Content */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-400">简体中文 *</div>
              <TipTapEditor
                value={formData.content['zh-CN'] || ''}
                onChange={(value) => setFormData({ ...formData, content: { ...formData.content, 'zh-CN': value } })}
                placeholder="简体中文内容"
                minHeight="300px"
                onImageUpload={async (file) => {
                  const url = await uploadImage(file);
                  return url;
                }}
              />
            </div>

            {/* Traditional Chinese */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400">繁體中文</div>
                <button
                  type="button"
                  onClick={() => handleTranslateContent('zh-TW')}
                  disabled={translatingContent['zh-TW'] || !formData.content['zh-CN']}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="从简体中文翻译"
                >
                  {translatingContent['zh-TW'] ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      翻译
                    </>
                  )}
                </button>
              </div>
              <TipTapEditor
                value={formData.content['zh-TW'] || ''}
                onChange={(value) => setFormData({ ...formData, content: { ...formData.content, 'zh-TW': value } })}
                placeholder="繁體中文內容"
                minHeight="300px"
                onImageUpload={async (file) => {
                  const url = await uploadImage(file);
                  return url;
                }}
              />
            </div>

            {/* English */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400">English</div>
                <button
                  type="button"
                  onClick={() => handleTranslateContent('en')}
                  disabled={translatingContent['en'] || !formData.content['zh-CN']}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="从简体中文翻译"
                >
                  {translatingContent['en'] ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      翻译
                    </>
                  )}
                </button>
              </div>
              <TipTapEditor
                value={formData.content.en || ''}
                onChange={(value) => setFormData({ ...formData, content: { ...formData.content, en: value } })}
                placeholder="English content"
                minHeight="300px"
                onImageUpload={async (file) => {
                  const url = await uploadImage(file);
                  return url;
                }}
              />
            </div>

            {/* Japanese */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400">日本語</div>
                <button
                  type="button"
                  onClick={() => handleTranslateContent('ja')}
                  disabled={translatingContent['ja'] || !formData.content['zh-CN']}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="从简体中文翻译"
                >
                  {translatingContent['ja'] ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      翻译
                    </>
                  )}
                </button>
              </div>
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
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400">Español</div>
                <button
                  type="button"
                  onClick={() => handleTranslateContent('es')}
                  disabled={translatingContent['es'] || !formData.content['zh-CN']}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="从简体中文翻译"
                >
                  {translatingContent['es'] ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      翻译
                    </>
                  )}
                </button>
              </div>
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
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400">Français</div>
                <button
                  type="button"
                  onClick={() => handleTranslateContent('fr')}
                  disabled={translatingContent['fr'] || !formData.content['zh-CN']}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="从简体中文翻译"
                >
                  {translatingContent['fr'] ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      翻译
                    </>
                  )}
                </button>
              </div>
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
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400">العربية</div>
                <button
                  type="button"
                  onClick={() => handleTranslateContent('ar')}
                  disabled={translatingContent['ar'] || !formData.content['zh-CN']}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="从简体中文翻译"
                >
                  {translatingContent['ar'] ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      翻译
                    </>
                  )}
                </button>
              </div>
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
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400">हिन्दी</div>
                <button
                  type="button"
                  onClick={() => handleTranslateContent('hi')}
                  disabled={translatingContent['hi'] || !formData.content['zh-CN']}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="从简体中文翻译"
                >
                  {translatingContent['hi'] ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      翻译中...
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      翻译
                    </>
                  )}
                </button>
              </div>
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

          {/* Tips */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-gray-400 text-center">
              {language === 'zh-CN'
                ? '💡 提示：只有简体中文是必填的，其他语言可选填'
                : '💡 Tip: Only Simplified Chinese is required, other languages are optional'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

