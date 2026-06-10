"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Eye, Sparkles, X } from "lucide-react";
import { recordUpdateView } from "../lib/update-views";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { localizeUpdate } from "../lib/update-display";
import type { UpdateWithMeta } from "../lib/types/update";
import styles from "./UpdateDetailModal.module.css";

type Props = {
  update: UpdateWithMeta | null;
  onClose: () => void;
};

export default function UpdateDetailModal({ update, onClose }: Props) {
  const { t, locale } = useLanguage();

  useEffect(() => {
    if (!update) return;
    recordUpdateView(update.id);
  }, [update]);

  useEffect(() => {
    if (!update) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [update, onClose]);

  if (!update) return null;

  const item = localizeUpdate(update, locale);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-modal-title"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={t.home.closeModal}
        >
          <X size={20} />
        </button>

        {item.image_url ? (
          <div className={styles.hero}>
            <Image
              src={item.image_url}
              alt=""
              fill
              className={styles.heroImage}
              sizes="(max-width: 768px) 100vw, 680px"
              priority
            />
            <div className={styles.heroOverlay} />
            <span className={styles.heroBadge}>
              <Sparkles size={12} />
              {t.home.updateBadge}
            </span>
          </div>
        ) : (
          <div className={styles.heroPlaceholder}>
            <Sparkles size={36} />
          </div>
        )}

        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Calendar size={15} />
              {new Date(item.created_at).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            {(item.view_count ?? 0) > 0 && (
              <span className={styles.metaItem}>
                <Eye size={15} />
                {item.view_count} {t.whatsNew.views}
              </span>
            )}
          </div>

          <h2 id="update-modal-title">{item.title}</h2>
          <div className={styles.content}>{item.content}</div>

          <div className={styles.footer}>
            <Link href="/whats-new" className={styles.moreLink} onClick={onClose}>
              {t.home.viewAllAndComment}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
