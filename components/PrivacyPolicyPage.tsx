"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Globe,
  Mail,
  MapPin,
  Shield,
} from "lucide-react";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  MEDICAL_DISCLAIMER_SECTIONS,
  PRIVACY_INTRO,
  PRIVACY_LAST_UPDATED,
  PRIVACY_SECTIONS,
  type PolicyBulletSection,
} from "../lib/privacy-policy-content";
import styles from "./PrivacyPolicyPage.module.css";

function renderBlock(
  block: {
    intro?: string;
    bullets?: string[];
    paragraphs?: string[];
    closing?: string[];
  },
  keyPrefix: string
) {
  return (
    <>
      {block.paragraphs?.map((text) => (
        <p key={`${keyPrefix}-p-${text.slice(0, 24)}`}>{text}</p>
      ))}
      {block.intro && <p className={styles.introLine}>{block.intro}</p>}
      {block.bullets && block.bullets.length > 0 && (
        <ul className={styles.bulletList}>
          {block.bullets.map((item) => (
            <li key={`${keyPrefix}-b-${item}`}>{item}</li>
          ))}
        </ul>
      )}
      {block.closing?.map((text) => (
        <p key={`${keyPrefix}-c-${text.slice(0, 24)}`}>{text}</p>
      ))}
    </>
  );
}

function PolicySection({
  section,
  variant = "default",
}: {
  section: PolicyBulletSection;
  variant?: "default" | "disclaimer";
}) {
  return (
    <article
      id={section.id}
      className={`${styles.sectionCard} ${
        variant === "disclaimer" ? styles.disclaimerCard : ""
      }`}
    >
      <h2>{section.title}</h2>
      {renderBlock(section, section.id)}
      {section.subsections?.map((sub, index) => (
        <div key={`${section.id}-sub-${index}`} className={styles.subsection}>
          {sub.title ? <h3>{sub.title}</h3> : null}
          {renderBlock(sub, `${section.id}-${index}`)}
        </div>
      ))}
    </article>
  );
}

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();

  const toc = [
    ...PRIVACY_SECTIONS.map((s) => ({ id: s.id, label: s.title })),
    {
      id: "medical-disclaimer",
      label: t.privacyPage.disclaimerTitle,
    },
  ];

  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.badge}>
            <Shield size={16} aria-hidden />
            {t.privacyPage.badge}
          </span>
          <h1>{t.privacyPage.title}</h1>
          <p className={styles.lead}>{t.privacyPage.lead}</p>
          <p className={styles.updated}>
            {t.privacyPage.lastUpdated}: {PRIVACY_LAST_UPDATED}
          </p>
        </div>
      </section>

      <div className={styles.layout}>
        <aside className={styles.toc} aria-label={t.privacyPage.onThisPage}>
          <h2>{t.privacyPage.onThisPage}</h2>
          <nav>
            {toc.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <div className={styles.content}>
          <div className={styles.introCard}>
            {PRIVACY_INTRO.map((text) => (
              <p key={text.slice(0, 32)}>{text}</p>
            ))}
          </div>

          {PRIVACY_SECTIONS.map((section) =>
            section.id === "contact" ? (
              <article
                key={section.id}
                id={section.id}
                className={styles.sectionCard}
              >
                <h2>{section.title}</h2>
                {section.paragraphs?.map((text) => (
                  <p key={text.slice(0, 24)}>{text}</p>
                ))}
                <div className={styles.contactCard}>
                  <strong>{t.privacyPage.contactOrg}</strong>
                  <div className={styles.contactRow}>
                    <Mail size={18} aria-hidden />
                    <a href={`mailto:${t.privacyPage.contactEmail}`}>
                      {t.privacyPage.contactEmail}
                    </a>
                  </div>
                  <div className={styles.contactRow}>
                    <Globe size={18} aria-hidden />
                    <a
                      href={t.privacyPage.contactWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t.privacyPage.contactWebsiteLabel}
                    </a>
                  </div>
                  <div className={styles.contactRow}>
                    <MapPin size={18} aria-hidden />
                    <span>{t.privacyPage.contactAddress}</span>
                  </div>
                </div>
              </article>
            ) : (
              <PolicySection key={section.id} section={section} />
            )
          )}

          <section
            id="medical-disclaimer"
            className={styles.disclaimerBlock}
            aria-labelledby="disclaimer-heading"
          >
            <div className={styles.disclaimerHeader}>
              <AlertTriangle size={28} aria-hidden />
              <div>
                <h2 id="disclaimer-heading">{t.privacyPage.disclaimerTitle}</h2>
                <p>{t.privacyPage.disclaimerLead}</p>
              </div>
            </div>

            {MEDICAL_DISCLAIMER_SECTIONS.map((section) => (
              <PolicySection
                key={section.id}
                section={section}
                variant="disclaimer"
              />
            ))}
          </section>

          <div className={styles.cta}>
            <h2>{t.privacyPage.ctaTitle}</h2>
            <p>{t.privacyPage.ctaSub}</p>
            <div className={styles.ctaActions}>
              <Link href="/book" className={styles.ctaPrimary}>
                {t.nav.bookNow}
              </Link>
              <Link href="/about" className={styles.ctaSecondary}>
                {t.nav.about}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
