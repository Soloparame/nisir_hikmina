"use client";

import { useLanguage } from "../lib/i18n/LanguageContext";
import styles from "./LanguageSwitcher.module.css";

type Props = {
  variant?: "default" | "light";
};

export default function LanguageSwitcher({ variant = "default" }: Props) {
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <button
      type="button"
      className={`${styles.switcher} ${variant === "light" ? styles.light : ""}`}
      onClick={toggleLocale}
      aria-label={`Switch to ${locale === "am" ? "English" : "Amharic"}`}
      title={t.lang.switchTo}
    >
      <span className={styles.globe} aria-hidden>
        🌐
      </span>
      <span className={styles.label}>{t.lang.switchTo}</span>
    </button>
  );
}
