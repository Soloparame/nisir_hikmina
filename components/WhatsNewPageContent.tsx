"use client";

import { useLanguage } from "../lib/i18n/LanguageContext";
import type { UpdateWithMeta } from "../lib/types/update";
import WhatsNewFeed from "./WhatsNewFeed";
import styles from "../app/whats-new/whats-new.module.css";

type Props = {
  updates: UpdateWithMeta[];
};

export default function WhatsNewPageContent({ updates }: Props) {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1>{t.home.whatsNewTitle}</h1>
        <p>{t.home.whatsNewSub}</p>
      </header>
      <WhatsNewFeed updates={updates} />
    </div>
  );
}
