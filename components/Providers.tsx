"use client";

import DocumentMeta from "./DocumentMeta";
import { LanguageProvider } from "../lib/i18n/LanguageContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DocumentMeta />
      {children}
    </LanguageProvider>
  );
}
