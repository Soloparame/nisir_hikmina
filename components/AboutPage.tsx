"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
import { ABOUT_STORY_IMAGE } from "../lib/service-images";
import { useLanguage } from "../lib/i18n/LanguageContext";
import styles from "./AboutPage.module.css";

export default function AboutPage() {
  const { t } = useLanguage();

  const timeline = [
    { title: t.about.missionTitle, body: t.about.storyTimeline1 },
    { title: t.about.storyStep2Title, body: t.about.storyTimeline2 },
    {
      title: t.about.pillar1Title,
      body: t.about.pillar1Desc,
    },
    {
      title: t.about.pillar2Title,
      body: t.about.pillar2Desc,
    },
    {
      title: t.about.pillar3Title,
      body: t.about.pillar3Desc,
    },
  ];

  return (
    <div className={styles.page}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <h1>{t.about.title}</h1>
            <p className={styles.lead}>{t.about.lead}</p>
          </div>
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyGrid}>
          <div className={styles.storyText}>
            <span className={styles.storyKicker}>{t.about.storyKicker}</span>
            <h2 className={styles.storyTitle}>
              {t.about.storyTitle}{" "}
              <span>{t.about.storyTitleAccent}</span>
            </h2>
            <h3 className={styles.storyHeading}>
              {t.about.storyHeading}{" "}
              <span>{t.about.storyHeadingAccent}</span>
            </h3>
            <p className={styles.storyIntro}>{t.about.storyIntro}</p>

            <div className={styles.timeline}>
              {timeline.map((item) => (
                <div key={item.title} className={styles.timelineItem}>
                  <strong className={styles.timelineTitle}>{item.title}</strong>
                  <p>{item.body}</p>
                </div>
              ))}
            </div>

            <div className={styles.visionCard}>
              <h4>{t.about.visionCardTitle}</h4>
              <p>{t.about.visionText}</p>
            </div>
          </div>

          <div className={styles.storyImageCol}>
            <div className={styles.storyImageFrame}>
              <Image
                src={ABOUT_STORY_IMAGE.src}
                alt={ABOUT_STORY_IMAGE.alt}
                fill
                className={styles.storyImage}
                sizes="(max-width: 900px) 100vw, 420px"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.whySection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitleCenter}>{t.about.whyTitle}</h2>
          <p className={styles.sectionSubCenter}>{t.about.pillarsSub}</p>
          <ul className={styles.whyList}>
            {t.about.whyItems.map((item) => (
              <li key={item}>
                <CheckCircle2 size={22} className={styles.check} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>{t.about.ctaTitle}</h2>
          <p>{t.about.ctaSub}</p>
          <Link href="/book">
            <button type="button" className={styles.ctaBtn}>
              {t.nav.bookNow}
            </button>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
