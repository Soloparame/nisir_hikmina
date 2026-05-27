"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../lib/i18n/LanguageContext";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.brand}>
            <div className={styles.brandRow}>
              <Image
                src="/photo_2026-03-18_21-21-01.jpg"
                alt={t.brand.name}
                width={48}
                height={48}
                className={styles.logoImg}
              />
              <span className={styles.brandName}>{t.brand.name}</span>
            </div>
            <p>{t.footer.tagline}</p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4>{t.footer.company}</h4>
              <Link href="/about">{t.footer.about}</Link>
              <Link href="/book">{t.nav.doctors}</Link>
              <Link href="/">{t.nav.home}</Link>
            </div>
            <div className={styles.linkGroup}>
              <h4>{t.footer.services}</h4>
              <Link href="/book">{t.footer.primaryCare}</Link>
              <Link href="/book">{t.footer.mentalHealth}</Link>
              <Link href="/book">{t.footer.urgentCare}</Link>
            </div>
            <div className={styles.linkGroup}>
              <h4>{t.footer.legal}</h4>
              <span style={{ opacity: 0.6, fontSize: "0.92rem" }}>
                {t.footer.privacy}
              </span>
              <span style={{ opacity: 0.6, fontSize: "0.92rem" }}>
                {t.footer.terms}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>
            © {new Date().getFullYear()} {t.brand.name}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
