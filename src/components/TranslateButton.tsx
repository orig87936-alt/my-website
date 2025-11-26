/**
 * Translation button component
 * Provides a button to translate text fields with loading state
 */
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// T032-T050: Support 8 languages
type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'es' | 'fr' | 'ar' | 'hi';

// Helper function to convert frontend language codes to backend format
const convertLangToBackend = (lang: string): string => {
  const mapping: Record<string, string> = {
    'zh-CN': 'zh',
    'zh-TW': 'zh-tw',
    'en': 'en',
    'ja': 'ja',
    'es': 'es',
    'fr': 'fr',
    'ar': 'ar',
    'hi': 'hi',
  };
  return mapping[lang] || lang;
};

interface TranslateButtonProps {
  /** Text to translate */
  text: string;
  /** Source language (auto-detect if not provided) */
  sourceLang?: SupportedLanguage;
  /** Target language */
  targetLang: SupportedLanguage;
  /** Callback when translation completes */
  onTranslated: (translatedText: string) => void;
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const TranslateButton: React.FC<TranslateButtonProps> = ({
  text,
  sourceLang,
  targetLang,
  onTranslated,
  size = 'sm',
  variant = 'outline',
  className = '',
  disabled = false,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    // Validate text
    if (!text || text.trim().length === 0) {
      toast.error('请输入要翻译的文本');
      return;
    }

    if (text.length > 50000) {
      toast.error('文本长度不能超过 50000 字符');
      return;
    }

    setIsTranslating(true);

    try {
      // Import API function dynamically to avoid circular dependencies
      const { translateText } = await import('../services/api');

      // Convert frontend language codes to backend format
      const backendSourceLang = sourceLang ? convertLangToBackend(sourceLang) : undefined;
      const backendTargetLang = convertLangToBackend(targetLang);

      const textLength = text.trim().length;
      console.log('🔄 Translating:', {
        textLength,
        sourceLang: backendSourceLang,
        targetLang: backendTargetLang,
        originalSourceLang: sourceLang,
        originalTargetLang: targetLang,
        textPreview: text.trim().substring(0, 100) + '...'
      });

      const result = await translateText({
        text: text.trim(),
        source_lang: backendSourceLang as any,
        target_lang: backendTargetLang as any,
      });

      console.log('✅ Translation result:', {
        translatedLength: result.translated_text?.length,
        sourceLang: result.source_lang,
        targetLang: result.target_lang,
        cached: result.cached,
        translatedPreview: result.translated_text?.substring(0, 100) + '...'
      });

      // Validate result
      if (!result.translated_text) {
        throw new Error('翻译结果为空');
      }

      // Call callback with translated text
      console.log('📝 Calling onTranslated with text length:', result.translated_text.length);
      onTranslated(result.translated_text);

      // Show success message (T032-T050: 8 languages)
      const langNames: Record<string, string> = {
        'zh-CN': '简体中文',
        'zh-TW': '繁体中文',
        en: '英文',
        ja: '日语',
        es: '西班牙语',
        fr: '法语',
        ar: '阿拉伯语',
        hi: '印地语'
      };
      const sourceName = langNames[result.source_lang] || result.source_lang;
      const targetName = langNames[result.target_lang] || result.target_lang;

      if (result.cached) {
        toast.success(`翻译完成 (${sourceName} → ${targetName}) - 来自缓存`);
      } else {
        toast.success(`翻译完成 (${sourceName} → ${targetName})`);
      }
    } catch (error: any) {
      console.error('❌ Translation error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      toast.error(error.message || '翻译失败，请重试');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={`${className} ${!text || text.trim().length === 0 ? 'opacity-60' : ''}`}
      onClick={handleTranslate}
      disabled={disabled || isTranslating}
      title={!text || text.trim().length === 0 ? '请先输入要翻译的文本' : ''}
    >
      {isTranslating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          翻译中...
        </>
      ) : (
        <>
          <Languages className="mr-2 h-4 w-4" />
          翻译
        </>
      )}
    </Button>
  );
};

export default TranslateButton;

