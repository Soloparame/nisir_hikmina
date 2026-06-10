"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, Stethoscope } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { useLanguage } from "../lib/i18n/LanguageContext";
import {
  getDoctorBio,
  getDoctorName,
  getDoctorSpecialization,
} from "../lib/doctor-display";
import {
  DOCTOR_CATEGORIES,
  findCategoryLabelBySubcategory,
} from "../lib/doctor-categories";
import {
  formatAvailabilitySlot,
  getDoctorAvailabilitySlots,
} from "../lib/doctor-availability";
import type { Doctor } from "../lib/types/doctor";
import { PUBLIC_DOCTOR_COLUMNS } from "../lib/types/doctor";
import styles from "./DoctorPicker.module.css";

type Props = {
  initialDoctors: Doctor[];
  onSelect: (doctor: Doctor) => void;
  checkingAuth?: boolean;
};

export default function DoctorPicker({
  initialDoctors,
  onSelect,
  checkingAuth,
}: Props) {
  const { t, locale } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [loading, setLoading] = useState(initialDoctors.length === 0);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (initialDoctors.length > 0) {
      setLoading(false);
      return;
    }

    async function load() {
      const supabase = createClient();
      if (!supabase) {
        setLoadError(
          "Supabase is not configured on this deploy. Add env vars on Netlify and redeploy."
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("doctors")
        .select(PUBLIC_DOCTOR_COLUMNS)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        setLoadError(error.message);
      } else if (data) {
        setDoctors(data as Doctor[]);
      }
      setLoading(false);
    }

    load();
  }, [initialDoctors.length]);

  const selected = doctors.find((d) => d.id === selectedId);

  const subcategoryItems = useMemo(() => {
    const items = DOCTOR_CATEGORIES.flatMap((cat) =>
      cat.subcategories.map((sub) => ({
        category: cat.label,
        subcategory: sub,
      }))
    );
    return items.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory)
        return false;
      if (!subcategorySearch.trim()) return true;
      return item.subcategory
        .toLowerCase()
        .includes(subcategorySearch.trim().toLowerCase());
    });
  }, [selectedCategory, subcategorySearch]);

  const filteredDoctors = doctors.filter((d) => {
    const sub = d.specialization_en ?? d.specialization;
    const cat = d.category ?? findCategoryLabelBySubcategory(sub);

    if (selectedCategory !== "All" && cat !== selectedCategory) return false;
    if (selectedSubcategory && sub !== selectedSubcategory) return false;
    return true;
  });

  const hasActiveFilter =
    selectedCategory !== "All" || selectedSubcategory !== null;

  if (loading) {
    return (
      <div className={styles.stateBox}>
        <div className={styles.spinner} />
        <p>{t.book.loadingDoctors}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.stateBox}>
        <p className={styles.errorText}>{loadError}</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className={styles.stateBox}>
        <Stethoscope size={40} className={styles.emptyIcon} />
        <p>{t.book.noDoctors}</p>
      </div>
    );
  }

  const sidebar = (
    <aside className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>{t.book.filterTitle}</h2>

      <div className={styles.searchWrap}>
        <Search size={18} className={styles.searchIcon} aria-hidden />
        <input
          className={styles.searchInput}
          type="search"
          value={subcategorySearch}
          placeholder={t.book.searchPlaceholder}
          onChange={(e) => setSubcategorySearch(e.target.value)}
        />
      </div>

      <nav className={styles.categoryNav} aria-label="Categories">
        <button
          type="button"
          className={`${styles.categoryItem} ${
            selectedCategory === "All" ? styles.categoryItemActive : ""
          }`}
          onClick={() => {
            setSelectedCategory("All");
            setSelectedSubcategory(null);
          }}
        >
          {t.book.allCategories}
        </button>
        {DOCTOR_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`${styles.categoryItem} ${
              selectedCategory === cat.label ? styles.categoryItemActive : ""
            }`}
            onClick={() => {
              setSelectedCategory(cat.label);
              setSelectedSubcategory(null);
            }}
          >
            {cat.label}
          </button>
        ))}
      </nav>

      {subcategoryItems.length > 0 && (
        <div className={styles.subcategorySection}>
          <p className={styles.subcategoryLabel}>
            {selectedCategory === "All"
              ? t.book.searchPlaceholder
              : selectedCategory}
          </p>
          <div className={styles.subcategoryList}>
            {subcategoryItems.map((item) => {
              const active = item.subcategory === selectedSubcategory;
              return (
                <button
                  key={`${item.category}::${item.subcategory}`}
                  type="button"
                  className={`${styles.subChip} ${
                    active ? styles.subChipActive : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(item.category);
                    setSelectedSubcategory(item.subcategory);
                  }}
                >
                  {item.subcategory}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {hasActiveFilter && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => {
            setSelectedCategory("All");
            setSelectedSubcategory(null);
            setSubcategorySearch("");
          }}
        >
          {t.book.clearFilters}
        </button>
      )}
    </aside>
  );

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.mobileFilterToggle}
        onClick={() => setFiltersOpen((o) => !o)}
      >
        {filtersOpen ? t.book.hideFilters : t.book.showFilters}
        {hasActiveFilter && <span className={styles.filterDot} />}
      </button>

      <div className={styles.layout}>
        <div
          className={`${styles.sidebarWrap} ${
            filtersOpen ? styles.sidebarWrapOpen : ""
          }`}
        >
          {sidebar}
        </div>

        <div className={styles.main}>
          <p className={styles.resultsCount}>
            {filteredDoctors.length} {t.nav.doctors.toLowerCase()}
          </p>

          {filteredDoctors.length === 0 ? (
            <div className={styles.stateBoxInline}>
              <p>{t.book.noMatch}</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredDoctors.map((doctor) => {
                const active = selectedId === doctor.id;
                return (
                  <button
                    key={doctor.id}
                    type="button"
                    className={`${styles.card} ${
                      active ? styles.cardActive : ""
                    }`}
                    onClick={() => setSelectedId(doctor.id)}
                  >
                    <div className={styles.avatarWrap}>
                      {doctor.image_url ? (
                        <Image
                          src={doctor.image_url}
                          alt={getDoctorName(doctor, locale)}
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
                    <h3>{getDoctorName(doctor, locale)}</h3>
                    <p className={styles.spec}>
                      {doctor.category ? `${doctor.category} — ` : ""}
                      {getDoctorSpecialization(doctor, locale)}
                    </p>
                    <p className={styles.exp}>
                      {doctor.experience_years}+ {t.book.yearsExp}
                    </p>
                    {getDoctorBio(doctor, locale) && (
                      <p className={styles.bio}>
                        {getDoctorBio(doctor, locale)}
                      </p>
                    )}
                    {doctor.languages?.length > 0 && (
                      <div className={styles.langs}>
                        {doctor.languages.map((lang) => (
                          <span key={lang} className={styles.langTag}>
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                    {getDoctorAvailabilitySlots(doctor).length > 0 && (
                      <div className={styles.availability}>
                        {getDoctorAvailabilitySlots(doctor).map((slot) => (
                          <span key={slot.period} className={styles.slotTag}>
                            {t.availability[slot.labelKey]}:{" "}
                            {formatAvailabilitySlot(slot)}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selected && (
            <div className={styles.footer}>
              <button
                type="button"
                className={styles.continueBtn}
                onClick={() => onSelect(selected)}
                disabled={checkingAuth}
              >
                {checkingAuth ? t.auth.loggingIn : t.book.continueBtn}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
