"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Stethoscope } from "lucide-react";
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
import type { Doctor } from "../lib/types/doctor";
import styles from "./DoctorPicker.module.css";

type Props = {
  onSelect: (doctor: Doctor) => void;
};

export default function DoctorPicker({ onSelect }: Props) {
  const { t, locale } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [subcategorySearch, setSubcategorySearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!error && data) {
        setDoctors(data as Doctor[]);
      }
      setLoading(false);
    }

    load();
  }, []);

  const selected = doctors.find((d) => d.id === selectedId);

  const allSubcategoryItems = DOCTOR_CATEGORIES.flatMap((cat) =>
    cat.subcategories.map((sub) => ({ category: cat.label, subcategory: sub }))
  );

  const visibleSubcategoryItems = allSubcategoryItems.filter((item) => {
    if (selectedCategory !== "All" && item.category !== selectedCategory)
      return false;
    if (!subcategorySearch.trim()) return true;
    return item.subcategory
      .toLowerCase()
      .includes(subcategorySearch.trim().toLowerCase());
  });

  const filteredDoctors = doctors.filter((d) => {
    const sub = d.specialization_en ?? d.specialization;
    const cat = d.category ?? findCategoryLabelBySubcategory(sub);

    if (selectedCategory !== "All" && cat !== selectedCategory) return false;
    if (selectedSubcategory && sub !== selectedSubcategory) return false;
    return true;
  });

  if (loading) {
    return (
      <div className={styles.stateBox}>
        <div className={styles.spinner} />
        <p>{t.book.loadingDoctors}</p>
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

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterPanel}>
        <div className={styles.categoryChips} role="tablist" aria-label="Categories">
          <button
            type="button"
            className={`${styles.chip} ${selectedCategory === "All" ? styles.chipActive : ""}`}
            onClick={() => {
              setSelectedCategory("All");
              setSelectedSubcategory(null);
              setSubcategorySearch("");
            }}
          >
            All
          </button>
          {DOCTOR_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`${styles.chip} ${
                selectedCategory === cat.label ? styles.chipActive : ""
              }`}
              onClick={() => {
                setSelectedCategory(cat.label);
                setSelectedSubcategory(null);
                setSubcategorySearch("");
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className={styles.subcategoryBox}>
          <input
            className={styles.searchInput}
            type="text"
            value={subcategorySearch}
            placeholder={
              selectedCategory === "All"
                ? "Search subcategories..."
                : `Search in: ${selectedCategory}...`
            }
            onChange={(e) => setSubcategorySearch(e.target.value)}
          />

          <div className={styles.subcategoryList}>
            {visibleSubcategoryItems.length === 0 ? (
              <div className={styles.subcategoryEmpty}>
                No matching subcategories.
              </div>
            ) : (
              visibleSubcategoryItems.map((item) => {
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
                    {item.category} / {item.subcategory}
                  </button>
                );
              })
            )}
          </div>

          {(selectedCategory !== "All" || selectedSubcategory) && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => {
                setSelectedCategory("All");
                setSelectedSubcategory(null);
                setSubcategorySearch("");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredDoctors.length === 0 ? (
        <div className={styles.stateBox}>
          <p className={styles.emptyStateText}>No doctors match this filter.</p>
        </div>
      ) : (
      <div className={styles.grid}>
        {filteredDoctors.map((doctor) => {
          const active = selectedId === doctor.id;
          return (
            <button
              key={doctor.id}
              type="button"
              className={`${styles.card} ${active ? styles.cardActive : ""}`}
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
                <p className={styles.bio}>{getDoctorBio(doctor, locale)}</p>
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
          >
            {t.book.continueBtn}
          </button>
        </div>
      )}
    </div>
  );
}
