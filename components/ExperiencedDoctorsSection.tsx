"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Stethoscope } from "lucide-react";
import {
  getDoctorBio,
  getDoctorName,
  getDoctorSpecialization,
} from "../lib/doctor-display";
import { sortDoctorsByTier } from "../lib/consultation-pricing";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type { Doctor } from "../lib/types/doctor";
import styles from "./ExperiencedDoctorsSection.module.css";

type Props = {
  doctors: Doctor[];
};

export default function ExperiencedDoctorsSection({ doctors }: Props) {
  const { t, locale } = useLanguage();
  const sortedDoctors = sortDoctorsByTier(doctors);

  if (sortedDoctors.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.badge}>{t.home.experiencedBadge}</span>
            <h2 className={styles.title}>{t.home.experiencedTitle}</h2>
            <p className={styles.sub}>{t.home.experiencedSub}</p>
          </div>
          <Link href="/doctors" className={styles.seeMore}>
            {t.home.seeMoreDoctors}
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.grid}>
          {sortedDoctors.map((d) => (
            <article key={d.id} className={styles.card}>
              <div className={styles.avatarWrap}>
                {d.image_url ? (
                  <Image
                    src={d.image_url}
                    alt={getDoctorName(d, locale)}
                    width={120}
                    height={120}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    <Stethoscope size={36} />
                  </div>
                )}
              </div>
              <h3>{getDoctorName(d, locale)}</h3>
              <p className={styles.spec}>
                {d.category ? `${d.category} — ` : ""}
                {getDoctorSpecialization(d, locale)}
              </p>
              <p className={styles.exp}>
                {d.experience_years}+ {t.home.yearsExp}
              </p>
              {getDoctorBio(d, locale) && (
                <p className={styles.bio}>{getDoctorBio(d, locale)}</p>
              )}
              <Link href="/book" className={styles.bookBtn}>
                {t.nav.bookAppointment}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
