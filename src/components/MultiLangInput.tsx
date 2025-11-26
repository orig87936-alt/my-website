/**
 * Multi-Language Input Component
 * T032-T050: Input field with support for 8 languages and auto-translation
 * Updated: 2025-11-17 - Added theme support for light/dark backgrounds
 */

import React, { useState } from 'react';
import { Language } from '../i18n/translations';
import { TranslateButton } from './TranslateButton';
import { MultiLangTranslateButton } from './MultiLangTranslateButton';
import { ChevronDown, ChevronUp } from 'lucide-react';

type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en' | 'ja' | 'es' | 'fr' | 'ar' | 'hi';

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
  /** Theme: 'light' for white background, 'dark' for dark background */
  theme?: 'light' | 'dark';
}

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  'zh-CN': '简体中文',
  'zh-TW': '繁体中文',
  'en': 'English',
  'ja': '日本語',
  'es': 'Español',
  'fr': 'Français',
  'ar': 'العربية',
  'hi': 'हिन्दी',
};

const LANGUAGE_CODES: SupportedLanguage[] = ['zh-CN', 'zh-TW', 'en', 'ja', 'es', 'fr', 'ar', 'hi'];

export const MultiLangInput: React.FC<MultiLangInputProps> = ({
  label,
  values,
  onChange,
  type = 'text',
  placeholder = '',
  requiredLangs = ['zh-CN', 'en'],
  expandedByDefault = false,
  rows = 3,
  theme = 'light',
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

  // Get languages to translate to (all languages except primary)
  const getTargetLangs = (): SupportedLanguage[] => {
    return LANGUAGE_CODES.filter(lang => lang !== primaryLang);
  };

  // Get languages that don't have values yet
  const getEmptyTargetLangs = (): SupportedLanguage[] => {
    return LANGUAGE_CODES.filter(lang => lang !== primaryLang && !values[lang]);
  };

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  // Theme-based styles with inline styles for light theme to override global CSS
  const isDarkTheme = theme === 'dark';

  const labelStyle = isDarkTheme ? {} : { color: '#111827' };
  const subLabelStyle = isDarkTheme ? {} : { color: '#1f2937' };
  const inputStyle = isDarkTheme
    ? {}
    : {
        color: '#111827',
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db'
      };
  const buttonStyle = isDarkTheme ? {} : { color: '#2563eb' };

  const labelClass = isDarkTheme ? 'text-gray-200' : '';
  const subLabelClass = isDarkTheme ? 'text-gray-300' : '';
  const inputClass = isDarkTheme
    ? 'border-white/20 bg-white/10 text-white placeholder:text-gray-400 focus:bg-white/15'
    : 'bg-white placeholder:text-gray-400';
  const buttonClass = isDarkTheme ? 'text-[#00a4e4] hover:text-[#0090cc]' : 'hover:text-blue-800';
  const borderClass = isDarkTheme ? 'border-white/20' : 'border-gray-300';
  const errorClass = isDarkTheme ? 'text-red-400' : '';
  const errorStyle = isDarkTheme ? {} : { color: '#dc2626' };
  const requiredStyle = isDarkTheme ? {} : { color: '#dc2626' };

  return (
    <div className="space-y-2 multilang-input-wrapper">
      {/* Label and Batch Translate Button */}
      <div className="flex items-center justify-between">
        <label className={`block text-sm font-semibold ${labelClass}`} style={labelStyle}>
          {label}
          {requiredLangs.length > 0 && <span className="ml-1" style={requiredStyle}>*</span>}
        </label>

        {getTargetLangs().length > 0 && (
          <MultiLangTranslateButton
            text={primaryValue}
            sourceLang={primaryLang}
            targetLangs={getTargetLangs()}
            onTranslated={handleBatchTranslate}
            size="sm"
            buttonText={`翻译到其他 ${getTargetLangs().length} 种语言`}
            disabled={!primaryValue}
          />
        )}
      </div>

      {/* Primary Language Input (Always Visible) */}
      <div className="space-y-2">
        <div className={`text-sm font-semibold ${subLabelClass}`} style={subLabelStyle}>
          {LANGUAGE_LABELS[primaryLang]}
        </div>
        <InputComponent
          type={type === 'text' ? 'text' : undefined}
          value={primaryValue}
          onChange={(e) => handleFieldChange(primaryLang, e.target.value)}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a4e4] focus:border-[#00a4e4] ${inputClass}`}
          style={inputStyle}
          placeholder={placeholder}
          rows={type === 'textarea' ? rows : undefined}
        />
      </div>

      {/* Expand/Collapse Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-1 text-sm font-semibold ${buttonClass} transition-colors`}
        style={buttonStyle}
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
        <div className={`space-y-3 pl-4 border-l-2 ${borderClass}`}>
          {LANGUAGE_CODES.filter(lang => lang !== primaryLang).map((lang) => (
            <div key={lang} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`text-sm font-semibold ${subLabelClass}`} style={subLabelStyle}>
                  {LANGUAGE_LABELS[lang]}
                </div>
                <TranslateButton
                  text={primaryValue}
                  sourceLang={primaryLang}
                  targetLang={lang}
                  onTranslated={(translated) => handleTranslate(primaryLang, lang, translated)}
                  size="sm"
                  variant="ghost"
                  disabled={!primaryValue}
                />
              </div>
              <InputComponent
                type={type === 'text' ? 'text' : undefined}
                value={values[lang] || ''}
                onChange={(e) => handleFieldChange(lang, e.target.value)}
                className={`
                  w-full px-3 py-2 text-sm border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-[#00a4e4] focus:border-[#00a4e4]
                  ${inputClass}
                  ${lang === 'ar' ? 'text-right' : ''}
                `}
                style={inputStyle}
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
        <div className={`text-sm font-semibold ${errorClass}`} style={errorStyle}>
          必填语言: {requiredLangs.filter(lang => !values[lang]).map(lang => LANGUAGE_LABELS[lang]).join(', ')}
        </div>
      )}
    </div>
  );
};

