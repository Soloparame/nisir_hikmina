"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Locale, translations, TranslationKeys } from "./translations";

const STORAGE_KEY = "nisir-locale";

type LanguageContextValue = {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("am");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "am" || stored === "en") {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === "am" ? "en" : "am"));
  }, []);

  const value = useMemo(
    () => ({
      locale,
      t: translations[locale],
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
