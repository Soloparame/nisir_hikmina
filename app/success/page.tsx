"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import styles from "./success.module.css";

function SuccessContent() {
  const params = useSearchParams();
  const { t } = useLanguage();

  const name = params.get("name") || "—";
  const disease = params.get("disease") || "—";
  const phone = params.get("phone") || "—";
  const telegram = params.get("telegram") || "—";
  const country = params.get("country") || "";
  const city = params.get("city") || "—";
  const consult = params.get("consult") || "—";

  const doctor = params.get("doctor") || "—";

  const location = country ? `${city}, ${country}` : city;

  const pending = params.get("pending") === "1";
  const amount = params.get("amount");
  const schedule = params.get("schedule");

  const rows = [
    { label: t.success.doctor, value: doctor },
    { label: t.success.name, value: name },
    { label: t.success.condition, value: disease },
    { label: t.success.phone, value: phone },
    { label: t.success.telegram, value: telegram },
    { label: t.success.location, value: location },
    { label: t.success.consultType, value: consult },
    ...(schedule ? [{ label: "Schedule", value: schedule }] : []),
    ...(amount ? [{ label: "Amount", value: `${amount} ETB` }] : []),
  ];

  return (
    <div className={styles.successPage}>
      <div className={styles.successIcon}>{pending ? "⏳" : t.success.icon}</div>
      <h2>{pending ? t.success.pendingTitle : t.success.title}</h2>
      <p>{pending ? t.success.pendingMessage : t.success.message}</p>

      <div className={styles.summaryCard}>
        <div className={styles.summaryTitle}>{t.success.summary}</div>
        {rows.map((row) => (
          <div key={row.label} className={styles.summaryRow}>
            <span className={styles.srLabel}>{row.label}</span>
            <span className={styles.srVal}>{row.value}</span>
          </div>
        ))}
      </div>

      <a
        href="https://t.me/nisirhikimna"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.tgBtn}
      >
        {t.success.joinTelegram}
      </a>

      <Link href="/" className={styles.homeBtn}>
        {t.success.backHome}
      </Link>

      <p className={styles.footerNote}>
        {t.success.footer}
        <br />
        <a href="https://t.me/nisirhikimna" className={styles.tgLink}>
          t.me/nisirhikimna
        </a>
      </p>
    </div>
  );
}

export default function SuccessPage() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <div className={styles.pageHeader}>
        <h1>{t.success.pageTitle}</h1>
      </div>
      <div className={styles.bg}>
        <Suspense
          fallback={
            <div style={{ padding: "2rem", textAlign: "center" }}>
              {t.success.loading}
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
    </>
  );
}
