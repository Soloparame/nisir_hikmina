"use client";

import Image from "next/image";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import {
  getDoctorBio,
  getDoctorName,
  getDoctorSpecialization,
} from "../lib/doctor-display";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type { Doctor } from "../lib/types/doctor";
import styles from "./DoctorsDirectory.module.css";

type Props = {
  doctors: Doctor[];
};

export default function DoctorsDirectory({ doctors }: Props) {
  const { t, locale } = useLanguage();

  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <h1>{t.doctorsPage.title}</h1>
        <p>{t.doctorsPage.subtitle}</p>
      </header>

      {doctors.length === 0 ? (
        <p className={styles.empty}>{t.doctorsPage.empty}</p>
      ) : (
        <div className={styles.grid}>
          {doctors.map((d) => (
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
              <h2>{getDoctorName(d, locale)}</h2>
              <p className={styles.spec}>
                {d.category ? `${d.category} — ` : ""}
                {getDoctorSpecialization(d, locale)}
              </p>
              <p className={styles.exp}>
                {d.experience_years} {t.home.yearsExp}
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
      )}
    </div>
  );
}
