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
      <div className={styles.grid}>
        {doctors.map((doctor) => {
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
