/**
 * Multi-Language Input Component
 * T032-T050: Input field with support for 8 languages and auto-translation
 */

import React, { useState } from 'react';
import { Language } from '../i18n/translations';
import { TranslateButton } from './TranslateButton';
import { MultiLangTranslateButton } from './MultiLangTranslateButton';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SupportedLanguage = 'zh' | 'zh-tw' | 'en' | 'ja' | 'es' | 'fr' | 'ar' | 'hi';

interface MultiLangInputProps {
  /** Field label */
  label: string;
  /** Current values for all languages */
  values: Record<string, string | undefined>;
  /** Callback when values change */
  onChange: (values: Record<string, string>) => void;
  /** Input type */
  type?: 'text' | 'textarea';
  /** Placeholder text */
  placeholder?: string;
  /** Required languages (must have value) */
  requiredLangs?: SupportedLanguage[];
  /** Show all languages by default */
  expandedByDefault?: boolean;
  /** Textarea rows */
  rows?: number;
}

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'zh': '简体中文',
  'zh-tw': '繁体中文',
  'en': 'English',
  'ja': '日本語',
  'es': 'Español',
  'fr': 'Français',
  'ar': 'العربية',
  'hi': 'हिन्दी',
};

const LANGUAGE_CODES: SupportedLanguage[] = ['zh', 'zh-tw', 'en', 'ja', 'es', 'fr', 'ar', 'hi'];

export const MultiLangInput: React.FC<MultiLangInputProps> = ({
  label,
  values,
  onChange,
  type = 'text',
  placeholder = '',
  requiredLangs = ['zh', 'en'],
  expandedByDefault = false,
  rows = 3,
}) => {
  const [isExpanded, setIsExpanded] = useState(expandedByDefault);

  // Get primary language (first required language with value)
  const primaryLang = requiredLangs.find(lang => values[lang]) || requiredLangs[0];
  const primaryValue = values[primaryLang] || '';

  // Handle single field change
  const handleFieldChange = (lang: SupportedLanguage, value: string) => {
    onChange({
      ...values,
      [lang]: value,
    });
  };

  // Handle translation to single language
  const handleTranslate = (sourceLang: SupportedLanguage, targetLang: SupportedLanguage, translatedText: string) => {
    onChange({
      ...values,
      [targetLang]: translatedText,
    });
  };

  // Handle batch translation to all languages
  const handleBatchTranslate = (translations: Record<string, string>) => {
    onChange({
      ...values,
      ...translations,
    });
  };

  // Get languages to translate to (exclude languages that already have values)
  const getTargetLangs = (): SupportedLanguage[] => {
    return LANGUAGE_CODES.filter(lang => lang !== primaryLang && !values[lang]);
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      {/* Label and Batch Translate Button */}
      <div className="flex items-center justify-between">
        <label className="block text-sm text-gray-300">
          {label}
          {requiredLangs.length > 0 && <span className="text-red-400 ml-1">*</span>}
        </label>
        
        {primaryValue && getTargetLangs().length > 0 && (
          <MultiLangTranslateButton
            text={primaryValue}
            sourceLang={primaryLang}
            targetLangs={getTargetLangs()}
            onTranslated={handleBatchTranslate}
            size="sm"
            buttonText={`翻译到其他 ${getTargetLangs().length} 种语言`}
          />
        )}
      </div>

      {/* Primary Language Input (Always Visible) */}
      <div className="space-y-2">
        <div className="text-xs text-gray-400">{LANGUAGE_LABELS[primaryLang]}</div>
        <InputComponent
          type={type === 'text' ? 'text' : undefined}
          value={primaryValue}
          onChange={(e) => handleFieldChange(primaryLang, e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00a4e4]"
          placeholder={placeholder}
          rows={type === 'textarea' ? rows : undefined}
        />
      </div>

      {/* Expand/Collapse Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>收起其他语言</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>展开其他 {LANGUAGE_CODES.length - 1} 种语言</span>
          </>
        )}
      </button>

      {/* Other Languages (Collapsible) */}
      {isExpanded && (
        <div className="space-y-3 pl-4 border-l-2 border-white/10">
          {LANGUAGE_CODES.filter(lang => lang !== primaryLang).map((lang) => (
            <div key={lang} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-400">{LANGUAGE_LABELS[lang]}</div>
                {primaryValue && !values[lang] && (
                  <TranslateButton
                    text={primaryValue}
                    sourceLang={primaryLang}
                    targetLang={lang}
                    onTranslated={(translated) => handleTranslate(primaryLang, lang, translated)}
                    size="sm"
                    variant="ghost"
                  />
                )}
              </div>
              <InputComponent
                type={type === 'text' ? 'text' : undefined}
                value={values[lang] || ''}
                onChange={(e) => handleFieldChange(lang, e.target.value)}
                className={`
                  w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white 
                  focus:outline-none focus:ring-2 focus:ring-[#00a4e4]
                  ${lang === 'ar' ? 'text-right' : ''}
                `}
                placeholder={placeholder}
                rows={type === 'textarea' ? rows : undefined}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          ))}
        </div>
      )}

      {/* Required Languages Validation */}
      {requiredLangs.some(lang => !values[lang]) && (
        <div className="text-xs text-red-400">
          必填语言: {requiredLangs.filter(lang => !values[lang]).map(lang => LANGUAGE_LABELS[lang]).join(', ')}
        </div>
      )}
    </div>
  );
};

