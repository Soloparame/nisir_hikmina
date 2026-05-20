"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import styles from "./success.module.css";

function SuccessContent() {
  const params = useSearchParams();

  const name = params.get("name") || "—";
  const disease = params.get("disease") || "—";
  const phone = params.get("phone") || "—";
  const telegram = params.get("telegram") || "—";
  const city = params.get("city") || "—";
  const consult = params.get("consult") || "—";

  const rows = [
    { label: "Name", value: name },
    { label: "Condition", value: disease },
    { label: "Phone", value: phone },
    { label: "Telegram", value: telegram },
    { label: "Location", value: `${city}, Ethiopia` },
    { label: "Consult Type", value: consult },
  ];

  return (
    <div className={styles.successPage}>
      <div className={styles.successIcon}>✅</div>
      <h2>We've Received Your Request!</h2>
      <p>
        Thank you for trusting Nisir Health. Our medical team will contact you
        shortly via <strong>Telegram</strong> or <strong>phone number</strong> to
        confirm your appointment details.
      </p>

      <div className={styles.summaryCard}>
        <div className={styles.summaryTitle}>Booking Summary</div>
        {rows.map((row) => (
          <div key={row.label} className={styles.summaryRow}>
            <span className={styles.srLabel}>{row.label}</span>
            <span className={styles.srVal}>{row.value}</span>
          </div>
        ))}
      </div>

      <a
        href="https://t.me/nisirhealth"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.tgBtn}
      >
        ✈️ Join Our Telegram Channel
      </a>

      <Link href="/" className={styles.homeBtn}>
        ← Back to Home
      </Link>

      <p className={styles.footerNote}>
        Nisir Health · Serving all of Ethiopia
        <br />
        <a href="https://t.me/nisirhealth" className={styles.tgLink}>
          t.me/nisirhealth
        </a>
      </p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <div className={styles.pageHeader}>
        <h1>Appointment Submitted ✓</h1>
      </div>
      <div className={styles.bg}>
        <Suspense fallback={<div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </>
  );
}
