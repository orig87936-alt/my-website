/**
 * Multi-Language Translate Button Component
 * T032-T050: Translate text to multiple languages at once
 */

import React, { useState } from 'react';
import { Languages, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Language } from '../i18n/translations';

type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'es' | 'fr' | 'ar' | 'hi';

interface MultiLangTranslateButtonProps {
  /** Text to translate */
  text: string;
  /** Source language (auto-detect if not provided) */
  sourceLang?: SupportedLanguage;
  /** Target languages to translate to */
  targetLangs: SupportedLanguage[];
  /** Callback when translation completes */
  onTranslated: (results: Record<string, string>) => void;
  /** Button size */
  size?: 'default' | 'sm' | 'lg';
  /** Custom className */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Button text */
  buttonText?: string;
}

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

// Helper function to convert backend language codes to frontend format
const convertLangToFrontend = (lang: string): string => {
  const mapping: Record<string, string> = {
    'zh': 'zh-CN',
    'zh-tw': 'zh-TW',
    'en': 'en',
    'ja': 'ja',
    'es': 'es',
    'fr': 'fr',
    'ar': 'ar',
    'hi': 'hi',
  };
  return mapping[lang] || lang;
};

export const MultiLangTranslateButton: React.FC<MultiLangTranslateButtonProps> = ({
  text,
  sourceLang,
  targetLangs,
  onTranslated,
  size = 'sm',
  className = '',
  disabled = false,
  buttonText = '翻译到所有语言',
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<Record<string, 'pending' | 'success' | 'error'>>({});

  const handleTranslate = async () => {
    if (!text || !text.trim()) {
      toast.error('请先输入要翻译的文本');
      return;
    }

    if (targetLangs.length === 0) {
      toast.error('请选择至少一种目标语言');
      return;
    }

    setIsTranslating(true);
    setProgress({});

    try {
      // Import API function dynamically
      const { translateToMultipleLanguages } = await import('../services/api');

      // Convert frontend language codes to backend format
      const backendSourceLang = sourceLang ? convertLangToBackend(sourceLang) : undefined;
      const backendTargetLangs = targetLangs.map(convertLangToBackend);

      console.log('🌐 Multi-language translation:', {
        textLength: text.trim().length,
        sourceLang: backendSourceLang,
        targetLangs: backendTargetLangs,
        originalTargetLangs: targetLangs,
        textPreview: text.trim().substring(0, 100) + '...'
      });

      // Initialize progress
      const initialProgress: Record<string, 'pending' | 'success' | 'error'> = {};
      targetLangs.forEach(lang => {
        initialProgress[lang] = 'pending';
      });
      setProgress(initialProgress);

      const result = await translateToMultipleLanguages({
        text: text.trim(),
        source_lang: backendSourceLang,
        target_langs: backendTargetLangs,
        force_translate: true,  // 强制翻译，即使检测到的语言与目标语言相同
      });

      console.log('✅ Multi-language translation result:', {
        totalLangs: result.total_langs,
        successCount: result.success_count,
        failedCount: result.failed_count,
        results: result.results,
      });

      // Update progress and collect successful translations
      // Convert backend language codes back to frontend format
      const translations: Record<string, string> = {};
      const updatedProgress: Record<string, 'pending' | 'success' | 'error'> = {};

      Object.entries(result.results).forEach(([backendLang, langResult]) => {
        const frontendLang = convertLangToFrontend(backendLang);

        if (langResult.translated_text) {
          translations[frontendLang] = langResult.translated_text;
          updatedProgress[frontendLang] = 'success';
        } else {
          updatedProgress[frontendLang] = 'error';
        }
      });

      setProgress(updatedProgress);

      // Call callback with successful translations
      if (Object.keys(translations).length > 0) {
        onTranslated(translations);
      }

      // Show result message
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

      if (result.failed_count === 0) {
        toast.success(`✅ 成功翻译到 ${result.success_count} 种语言`);
      } else if (result.success_count > 0) {
        toast.warning(`⚠️ 翻译完成：${result.success_count} 成功，${result.failed_count} 失败`);
      } else {
        toast.error('❌ 所有语言翻译失败');
      }
    } catch (error: any) {
      console.error('❌ Multi-language translation error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        response: error.response
      });

      // Better error message
      let errorMessage = '批量翻译失败，请重试';
      if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);

      // Mark all as error
      const errorProgress: Record<string, 'pending' | 'success' | 'error'> = {};
      targetLangs.forEach(lang => {
        errorProgress[lang] = 'error';
      });
      setProgress(errorProgress);
    } finally {
      setIsTranslating(false);
    }
  };

  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleTranslate}
        disabled={isTranslating}
        className={`
          inline-flex items-center gap-2 rounded-lg font-medium
          transition-all duration-200
          ${sizeClasses[size]}
          ${
            isTranslating
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : !text?.trim()
              ? 'bg-[#00a4e4]/50 hover:bg-[#00a4e4]/70 text-white/80 shadow-sm hover:shadow-md'
              : 'bg-[#00a4e4] hover:bg-[#0090cc] text-white shadow-sm hover:shadow-md'
          }
          ${className}
        `}
        title={!text?.trim() ? '请先输入要翻译的文本' : ''}
      >
        {isTranslating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>翻译中...</span>
          </>
        ) : (
          <>
            <Languages className="w-4 h-4" />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Progress indicators */}
      {Object.keys(progress).length > 0 && (
        <div className="flex items-center gap-1">
          {Object.entries(progress).map(([lang, status]) => {
            const langNames: Record<string, string> = {
              'zh-CN': '简',
              'zh-TW': '繁',
              en: 'EN',
              ja: '日',
              es: 'ES',
              fr: 'FR',
              ar: 'AR',
              hi: 'HI'
            };

            return (
              <div
                key={lang}
                className={`
                  flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs
                  ${status === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                  ${status === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                  ${status === 'pending' ? 'bg-gray-500/20 text-gray-400' : ''}
                `}
                title={`${langNames[lang]}: ${status}`}
              >
                {status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                {status === 'error' && <XCircle className="w-3 h-3" />}
                {status === 'pending' && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>{langNames[lang]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

