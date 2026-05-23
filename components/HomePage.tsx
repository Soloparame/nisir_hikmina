"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Baby,
  Bone,
  Brain,
  Calendar,
  CheckCircle2,
  Heart,
  Pill,
  Stethoscope,
  User,
} from "lucide-react";
import Navbar from "./Navbar";
import { useLanguage } from "../lib/i18n/LanguageContext";
import styles from "../app/page.module.css";

export default function HomePage() {
  const { t } = useLanguage();

  const services = [
    {
      icon: <Heart size={28} className={styles.iconSVG} />,
      name: t.services.cardiology,
      desc: t.services.cardiologyDesc,
    },
    {
      icon: <Brain size={28} className={styles.iconSVG} />,
      name: t.services.neurology,
      desc: t.services.neurologyDesc,
    },
    {
      icon: <Bone size={28} className={styles.iconSVG} />,
      name: t.services.orthopedics,
      desc: t.services.orthopedicsDesc,
    },
    {
      icon: <Baby size={28} className={styles.iconSVG} />,
      name: t.services.pediatrics,
      desc: t.services.pediatricsDesc,
    },
    {
      icon: <Stethoscope size={28} className={styles.iconSVG} />,
      name: t.services.primaryCare,
      desc: t.services.primaryCareDesc,
    },
    {
      icon: <Activity size={28} className={styles.iconSVG} />,
      name: t.services.dermatology,
      desc: t.services.dermatologyDesc,
    },
  ];

  return (
    <>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroOverlay} aria-hidden />
          <div className={styles.heroContainer}>
            <div className={styles.heroText}>
              <span className={styles.heroBadge}>
                <span className={styles.pulseDot} />
                {t.hero.badge}
              </span>
              <h1 className={styles.heroTitle}>
                {t.hero.title}
                <br />
                <span className={styles.heroAccent}>{t.hero.titleAccent}</span>
              </h1>
              <p className={styles.heroSub}>{t.hero.subtitle}</p>
              <div className={styles.heroActions}>
                <Link href="/book">
                  <button className={styles.btnPrimary}>{t.hero.cta}</button>
                </Link>
                <div className={styles.heroTrust}>
                  <div className={styles.stars}>★★★★★</div>
                  <span>{t.hero.trust}</span>
                </div>
              </div>
            </div>
            <div className={styles.heroImageWrapper}>
              <div className={styles.imageBackground} />
              <Image
                src="/doctor_hero.png"
                alt={t.hero.doctorAlt}
                width={500}
                height={600}
                className={styles.heroImage}
                priority
              />
              <div className={styles.floatingCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.stars}>★★★★★</span>
                </div>
                <p className={styles.cardText}>{t.hero.review}</p>
                <p className={styles.cardAuthor}>{t.hero.reviewAuthor}</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.trustBanner}>
          <div className={styles.trustLogos}>
            <span>{t.trust.label}</span>
            <div className={styles.logos}>
              <span className={styles.fakeLogo}>Healthline</span>
              <span className={styles.fakeLogo}>Medical News Today</span>
              <span className={styles.fakeLogo}>WebMD</span>
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

        <section className={styles.servicesSection}>
          <div className={styles.container}>
            <div className={styles.servicesHeader}>
              <h2 className={styles.sectionTitle}>{t.services.title}</h2>
              <p className={styles.sectionSub}>{t.services.subtitle}</p>
            </div>
            <div className={styles.servicesGrid}>
              {services.map((s) => (
                <div key={s.name} className={styles.serviceItem}>
                  <div className={styles.serviceIcon}>{s.icon}</div>
                  <div className={styles.serviceInfo}>
                    <h4>{s.name}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.valueSection}>
          <div className={styles.container}>
            <div className={styles.valueGrid}>
              <div className={styles.valueImage}>
                <div className={styles.valueBgShape} />
                <div className={styles.valueContentBox}>
                  <h3>{t.value.boxTitle}</h3>
                  <p>{t.value.boxDesc}</p>
                </div>
              </div>
              <div className={styles.valueText}>
                <h2 className={styles.sectionTitle}>{t.value.title}</h2>
                <ul className={styles.valueList}>
                  <li>
                    <CheckCircle2 className={styles.checkIcon} size={24} />
                    <div>
                      <strong>{t.value.doctors}</strong>
                      <p>{t.value.doctorsDesc}</p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 className={styles.checkIcon} size={24} />
                    <div>
                      <strong>{t.value.affordable}</strong>
                      <p>{t.value.affordableDesc}</p>
                    </div>
                  </li>
                  <li>
                    <CheckCircle2 className={styles.checkIcon} size={24} />
                    <div>
                      <strong>{t.value.anywhere}</strong>
                      <p>{t.value.anywhereDesc}</p>
                    </div>
                  </li>
                </ul>
                <Link href="/book">
                  <button className={styles.btnSecondary}>{t.value.cta}</button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>{t.brand.name}</div>
              <p>{t.footer.tagline}</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>{t.footer.company}</h4>
                <a href="#">{t.footer.about}</a>
                <a href="#">{t.footer.careers}</a>
                <a href="#">{t.footer.contact}</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>{t.footer.services}</h4>
                <a href="#">{t.footer.urgentCare}</a>
                <a href="#">{t.footer.primaryCare}</a>
                <a href="#">{t.footer.mentalHealth}</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>{t.footer.legal}</h4>
                <a href="#">{t.footer.privacy}</a>
                <a href="#">{t.footer.terms}</a>
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
    </>
  );
}
