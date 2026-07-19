"use client";

import { useEffect, useRef, useState } from "react";
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
  const appliedInitialDoctor = useRef(false);

  async function continueWithDoctor(selected: Doctor) {
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
      const bookPath = `/book?doctor=${encodeURIComponent(selected.id)}`;
      router.push(
        `/login?redirect=${encodeURIComponent(bookPath)}&doctor=${encodeURIComponent(selected.id)}`
      );
      setCheckingAuth(false);
      return;
    }

    setDoctor(selected);
    setStep("form");
    setCheckingAuth(false);

    // Keep URL in sync so refresh / share keeps the selected doctor
    if (typeof window !== "undefined") {
      const next = `/book?doctor=${encodeURIComponent(selected.id)}`;
      if (window.location.pathname + window.location.search !== next) {
        router.replace(next);
      }
    }
  }

  useEffect(() => {
    if (appliedInitialDoctor.current) return;
    if (!initialDoctorId || initialDoctors.length === 0) return;

    const found = initialDoctors.find((d) => d.id === initialDoctorId);
    if (!found) return;

    appliedInitialDoctor.current = true;
    void continueWithDoctor(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when doctors + id are ready
  }, [initialDoctorId, initialDoctors]);

  async function handleDoctorSelect(selected: Doctor) {
    await continueWithDoctor(selected);
  }

  function handleChangeDoctor() {
    setStep("doctor");
    setDoctor(null);
    appliedInitialDoctor.current = true;
    router.replace("/book");
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
          checkingAuth && initialDoctorId ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <p>{t.book.loadingDoctors}</p>
            </div>
          ) : (
            <DoctorPicker
              initialDoctors={initialDoctors}
              onSelect={handleDoctorSelect}
              checkingAuth={checkingAuth}
            />
          )
        ) : (
          doctor && (
            <BookForm doctor={doctor} onChangeDoctor={handleChangeDoctor} />
          )
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
