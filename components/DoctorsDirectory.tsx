"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Stethoscope } from "lucide-react";
import { getCategoryByKey } from "../lib/doctor-categories";
import {
  getDoctorBio,
  getDoctorName,
  getDoctorSpecialization,
} from "../lib/doctor-display";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type { Doctor } from "../lib/types/doctor";
import { sortDoctorsByTier } from "../lib/consultation-pricing";
import styles from "./DoctorsDirectory.module.css";

type Props = {
  doctors: Doctor[];
  initialCategoryKey?: string;
};

export default function DoctorsDirectory({
  doctors,
  initialCategoryKey,
}: Props) {
  const { t, locale } = useLanguage();
  const [query, setQuery] = useState("");

  const activeCategory = useMemo(
    () =>
      initialCategoryKey ? getCategoryByKey(initialCategoryKey) ?? null : null,
    [initialCategoryKey]
  );

  const filteredDoctors = useMemo(() => {
    let list = doctors;

    if (activeCategory) {
      list = list.filter((doctor) => doctor.category === activeCategory.label);
    }

    const term = query.trim().toLowerCase();
    if (term) {
      list = list.filter((doctor) => {
        const names = [doctor.name, doctor.name_en]
          .filter(Boolean)
          .map((name) => name!.toLowerCase());
        return names.some((name) => name.includes(term));
      });
    }

    return sortDoctorsByTier(list);
  }, [doctors, activeCategory, query]);

  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <h1>{t.doctorsPage.title}</h1>
        <p>
          {activeCategory
            ? t.doctorsPage.categorySubtitle.replace(
                "{category}",
                activeCategory.label
              )
            : t.doctorsPage.subtitle}
        </p>
      </header>

      {activeCategory && (
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>
            {t.doctorsPage.filteringBy.replace(
              "{category}",
              activeCategory.label
            )}
          </span>
          <Link href="/doctors" className={styles.clearFilter}>
            {t.doctorsPage.clearCategory}
          </Link>
        </div>
      )}

      {doctors.length > 0 && (
        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} size={18} aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.doctorsPage.searchPlaceholder}
            className={styles.searchInput}
            aria-label={t.doctorsPage.searchPlaceholder}
          />
        </div>
      )}

      {doctors.length === 0 ? (
        <p className={styles.empty}>{t.doctorsPage.empty}</p>
      ) : filteredDoctors.length === 0 ? (
        <p className={styles.empty}>
          {activeCategory
            ? t.doctorsPage.noCategoryResults
            : t.doctorsPage.noSearchResults}
        </p>
      ) : (
        <div className={styles.grid}>
          {filteredDoctors.map((d) => (
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
