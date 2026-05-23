"use client";

import { useEffect } from "react";
import { useLanguage } from "../lib/i18n/LanguageContext";

export default function DocumentMeta() {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content", t.meta.description);
    }
  }, [t]);

  return null;
}
