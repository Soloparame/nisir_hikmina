"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, CheckCircle2, Pill, User } from "lucide-react";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
import ExperiencedDoctorsSection from "./ExperiencedDoctorsSection";
import HomeUpdatesSection from "./HomeUpdatesSection";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { SERVICE_IMAGES } from "../lib/service-images";
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

  const services = [
    {
      image: SERVICE_IMAGES.cardiology,
      name: t.services.cardiology,
      desc: t.services.cardiologyDesc,
    },
    {
      image: SERVICE_IMAGES.neurology,
      name: t.services.neurology,
      desc: t.services.neurologyDesc,
    },
    {
      image: SERVICE_IMAGES.orthopedics,
      name: t.services.orthopedics,
      desc: t.services.orthopedicsDesc,
    },
    {
      image: SERVICE_IMAGES.pediatrics,
      name: t.services.pediatrics,
      desc: t.services.pediatricsDesc,
    },
    {
      image: SERVICE_IMAGES.primaryCare,
      name: t.services.primaryCare,
      desc: t.services.primaryCareDesc,
    },
    {
      image: SERVICE_IMAGES.dermatology,
      name: t.services.dermatology,
      desc: t.services.dermatologyDesc,
    },
  ];

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
            <div className={styles.heroText}>
              <h1 className={styles.heroTitle}>
                {t.hero.title}
                <br />
                <span className={styles.heroAccent}>{t.hero.titleAccent}</span>
              </h1>
              <p className={styles.heroSub}>{t.hero.subtitle}</p>
              <div className={styles.heroActions}>
                <Link href="/book">
                  <button className={styles.btnPrimary}>
                    <Calendar size={18} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    {t.hero.cta}
                  </button>
                </Link>
              </div>
            </div>
            
            <div className={styles.heroImageWrap}>
              <div className={styles.heroImageBlock}>
                <Image
                  src="/doctor_hero.jpg"
                  alt={t.hero.doctorAlt}
                  width={720}
                  height={900}
                  className={styles.heroImage}
                  priority
                  sizes="(max-width: 768px) 94vw, (max-width: 992px) 480px, 640px"
                />
              </div>
              <aside
                className={styles.heroFloatingBox}
                aria-label={`${t.hero.tributeName} biography`}
              >
                <h4 className={styles.tributeName}>{t.hero.tributeName}</h4>
                <p className={styles.tributeNameLatin}>
                  {t.hero.tributeNameLatin}
                </p>
                <p className={styles.tributeDates}>{t.hero.tributeDates}</p>
                <blockquote className={styles.tributeQuote}>
                  <p>&ldquo;{t.hero.tributeQuote}&rdquo;</p>
                  <cite>{t.hero.tributeQuoteSource}</cite>
                </blockquote>
              </aside>
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
              {services.map((s) => (
                <article key={s.name} className={styles.serviceItem}>
                  <div className={styles.serviceImageWrapper}>
                    <Image
                      src={s.image.src}
                      alt={s.image.alt}
                      fill
                      className={styles.serviceImage}
                      sizes="(max-width: 768px) 100vw, (max-width: 992px) 50vw, 280px"
                    />
                  </div>
                  <div className={styles.serviceInfo}>
                    <h4>{s.name}</h4>
                    <p>{s.desc}</p>
                  </div>
                </article>
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
