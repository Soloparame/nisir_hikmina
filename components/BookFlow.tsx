"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
import DoctorPicker from "./DoctorPicker";
import BookForm from "./BookForm";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type { Doctor } from "../lib/types/doctor";
import styles from "../app/book/book.module.css";

type Props = {
  initialDoctors: Doctor[];
};

export default function BookFlow({ initialDoctors }: Props) {
  const { t } = useLanguage();
  const [step, setStep] = useState<"doctor" | "form">("doctor");
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  function handleDoctorSelect(selected: Doctor) {
    setDoctor(selected);
    setStep("form");
  }

  return (
    <div className={styles.pageShell}>
      <Navbar />

      <div className={styles.pageHeader}>
        <Link href="/" className={styles.backLink}>
          {t.book.backHome}
        </Link>
        <h1>
          {step === "doctor" ? t.book.chooseDoctorTitle : t.book.title}
        </h1>
        <p>
          {step === "doctor" ? t.book.chooseDoctorSub : t.book.subtitle}
        </p>

        <div className={styles.steps}>
          <span
            className={`${styles.step} ${step === "doctor" ? styles.stepActive : styles.stepDone}`}
          >
            1. {t.book.stepDoctor}
          </span>
          <span className={styles.stepLine} />
          <span
            className={`${styles.step} ${step === "form" ? styles.stepActive : ""}`}
          >
            2. {t.book.stepDetails}
          </span>
        </div>
      </div>

      <div className={styles.pageBody}>
        {step === "doctor" ? (
          <DoctorPicker
            initialDoctors={initialDoctors}
            onSelect={handleDoctorSelect}
          />
        ) : (
          doctor && (
            <BookForm
              doctor={doctor}
              onChangeDoctor={() => {
                setStep("doctor");
                setDoctor(null);
              }}
            />
          )
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
