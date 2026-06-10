"use client";

import Link from "next/link";
import { ArrowRight, Megaphone, Sparkles } from "lucide-react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type { UpdateWithMeta } from "../lib/types/update";
import UpdateFeedList from "./UpdateFeedList";
import styles from "./HomeUpdatesSection.module.css";

type Props = {
  updates: UpdateWithMeta[];
};

export default function HomeUpdatesSection({ updates }: Props) {
  const { t } = useLanguage();

  if (updates.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.bgDecor} aria-hidden>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <Megaphone size={22} />
            </div>
            <div>
              <span className={styles.eyebrow}>
                <Sparkles size={14} />
                {t.home.whatsNewTitle}
              </span>
              <h2>{t.home.whatsNewSub}</h2>
            </div>
          </div>
          <Link href="/whats-new" className={styles.seeAll}>
            {t.home.seeAllUpdates}
            <ArrowRight size={16} />
          </Link>
        </div>

        <UpdateFeedList
          updates={updates}
          limit={2}
          showSignInHint={false}
          loginRedirect="/"
          className={styles.homeFeed}
        />
      </div>
    </section>
  );
}
