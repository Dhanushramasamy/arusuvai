'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import en from './locales/en.json';
import ta from './locales/ta.json';

type Locale = 'en' | 'ta';
type TranslationKeys = keyof typeof en;

const translations: Record<Locale, Record<string, string>> = { en, ta };

interface I18nContextValue {
  locale: Locale;
  t: (key: string, vars?: Record<string, string | number>) => string;
  toggleLocale: () => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: (key) => key,
  toggleLocale: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      let str = translations[locale][key] ?? translations['en'][key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
        });
      }
      return str;
    },
    [locale]
  );

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'ta' : 'en'));
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
