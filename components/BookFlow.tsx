"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import SiteFooter from "./SiteFooter";
import DoctorPicker from "./DoctorPicker";
import BookForm from "./BookForm";
import { createClient } from "../lib/supabase/client";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type { Doctor } from "../lib/types/doctor";
import styles from "../app/book/book.module.css";

type Props = {
  initialDoctors: Doctor[];
  initialDoctorId?: string;
};

export default function BookFlow({ initialDoctors, initialDoctorId }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<"doctor" | "form">("doctor");
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);

  useEffect(() => {
    if (!initialDoctorId || initialDoctors.length === 0) return;
    const found = initialDoctors.find((d) => d.id === initialDoctorId);
    if (found) {
      setDoctor(found);
      setStep("form");
    }
  }, [initialDoctorId, initialDoctors]);

  async function handleDoctorSelect(selected: Doctor) {
    setCheckingAuth(true);

    const supabase = createClient();
    if (!supabase) {
      setDoctor(selected);
      setStep("form");
      setCheckingAuth(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent("/book")}&doctor=${selected.id}`
      );
      setCheckingAuth(false);
      return;
    }

    setDoctor(selected);
    setStep("form");
    setCheckingAuth(false);
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
            checkingAuth={checkingAuth}
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
