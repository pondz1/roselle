import { createContext, useContext, useEffect, type ReactNode } from 'react';
import type { Locale } from '../domain/types';
import { translations, type TranslationDict } from './translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationDict;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  children: ReactNode;
}

export function I18nProvider({ locale, onChangeLocale, children }: I18nProviderProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale: onChangeLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
