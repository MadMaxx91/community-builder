import React, { createContext, useContext, useState, useCallback } from 'react';
import { translations, Lang, TranslationKey } from '../i18n/translations';

type LanguageContextType = {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Lang>('en');

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const str = (translations[language] as any)[key] ?? (translations.en as any)[key] ?? key;
      if (!vars) return str;
      return Object.entries(vars).reduce(
        (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
        str as string,
      );
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
