"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Pill, User } from "lucide-react";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
import ExperiencedDoctorsSection from "./ExperiencedDoctorsSection";
import HomeUpdatesSection from "./HomeUpdatesSection";
import ServiceCategoryIcon from "./ServiceCategoryIcon";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { DOCTOR_CATEGORIES } from "../lib/doctor-categories";
import type { Doctor } from "../lib/types/doctor";
import type { UpdateWithMeta } from "../lib/types/update";
import styles from "../app/page.module.css";

type Props = {
  experiencedDoctors?: Doctor[];
  latestUpdates?: UpdateWithMeta[];
};

export default function HomePage({
  experiencedDoctors = [],
  latestUpdates = [],
}: Props) {
  const { t } = useLanguage();

  return (
    <div className={styles.pageShell}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBackground} aria-hidden>
            <div className={styles.heroGridLines} />
            <div className={styles.heroGlowOrbs} />
          </div>
          <div className={styles.heroOverlay} aria-hidden />
          <div className={styles.heroContainer}>
            <div className={styles.heroMain}>
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>
                  {t.hero.title}
                  <br />
                  <span className={styles.heroAccent}>{t.hero.titleAccent}</span>
                </h1>
                <p className={styles.heroSub}>{t.hero.subtitle}</p>
              </div>

              <div className={styles.heroVisual}>
                <Image
                  src="/images/hero-telemedicine.png"
                  alt={t.hero.doctorAlt}
                  width={640}
                  height={520}
                  className={styles.heroIllustration}
                  priority
                  sizes="(max-width: 768px) 92vw, (max-width: 992px) 420px, 520px"
                />
              </div>

              <div className={styles.heroActions}>
                <Link href="/book" className={styles.heroBookLink}>
                  <button type="button" className={styles.heroBtnPrimary}>
                    <Calendar size={18} aria-hidden />
                    {t.hero.cta}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.howItWorks}>
          <div className={styles.container}>
            <div className={styles.hiwHeader}>
              <h2 className={styles.sectionTitle}>{t.howItWorks.title}</h2>
              <p className={styles.sectionSub}>{t.howItWorks.subtitle}</p>
            </div>
            <div className={styles.stepsGrid}>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrapper}>
                  <Calendar className={styles.stepIconSVG} size={32} />
                </div>
                <h3>{t.howItWorks.step1Title}</h3>
                <p>{t.howItWorks.step1Desc}</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrapper}>
                  <User className={styles.stepIconSVG} size={32} />
                </div>
                <h3>{t.howItWorks.step2Title}</h3>
                <p>{t.howItWorks.step2Desc}</p>
              </div>
              <div className={styles.stepCard}>
                <div className={styles.stepIconWrapper}>
                  <Pill className={styles.stepIconSVG} size={32} />
                </div>
                <h3>{t.howItWorks.step3Title}</h3>
                <p>{t.howItWorks.step3Desc}</p>
              </div>
            </div>
          </div>
        </section>

        <ExperiencedDoctorsSection doctors={experiencedDoctors} />

        <HomeUpdatesSection updates={latestUpdates} />

        <section className={styles.servicesSection}>
          <div className={styles.servicesContainer}>
            <div className={styles.servicesSidebar}>
              <div className={styles.servicesHeader}>
                <h2 className={styles.sectionTitle}>{t.services.title}</h2>
                <p className={styles.sectionSub}>{t.services.subtitle}</p>
              </div>
            </div>
            <div className={styles.servicesGrid}>
              {DOCTOR_CATEGORIES.map((category, index) => (
                <Link
                  key={category.key}
                  href={`/doctors?category=${encodeURIComponent(category.key)}`}
                  className={styles.serviceItemLink}
                >
                  <article className={styles.serviceItem}>
                    <div className={styles.serviceImageWrapper}>
                      <ServiceCategoryIcon
                        categoryKey={category.key}
                        label={category.label}
                      />
                    </div>
                    <div className={styles.serviceInfo}>
                      <span className={styles.serviceNumber}>{index + 1}.</span>
                      <h4>{category.label}</h4>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.valueSection}>
          <div className={styles.container}>
            <div className={styles.valueGrid}>
              <div className={styles.valueStats}>
                <div className={styles.statLarge}>
                  {t.value.yearsCount}
                  <span className={styles.statLabel} style={{ whiteSpace: "pre-line" }}>
                    {t.value.yearsLabel}
                  </span>
                </div>
              </div>
              <div className={styles.valueText}>
                <p style={{ color: 'var(--text-light)', lineHeight: 1.8, fontSize: '18px', marginBottom: '2rem' }}>
                  {t.value.boxDesc}
                </p>
                <div className={styles.introButtons}>
                  <Link href="/about">
                    <button className={styles.btnOutline}>{t.value.readMoreAbout}</button>
                  </Link>
                  <Link href="/book">
                    <button className={styles.btnPrimary}>{t.value.cta}</button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
