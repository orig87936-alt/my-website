import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, Language } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  getLanguageName: (lang: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 语言名称映射
const languageNames: Record<Language, string> = {
  'zh-CN': '中文（简体）',
  'zh-TW': '中文（繁體）',
  'en': 'English',
  'ja': '日本語',
  'es': 'Español',
  'fr': 'Français',
  'ar': 'العربية',
  'hi': 'हिन्दी'
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh-CN');

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const getLanguageName = (lang: Language): string => {
    return languageNames[lang] || lang;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLanguageName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
