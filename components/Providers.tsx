"use client";

import DocumentMeta from "./DocumentMeta";
import { LanguageProvider, useLanguage } from "../lib/i18n/LanguageContext";

function LocaleKeyedContent({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  return <div key={locale}>{children}</div>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DocumentMeta />
      <LocaleKeyedContent>{children}</LocaleKeyedContent>
    </LanguageProvider>
  );
}
