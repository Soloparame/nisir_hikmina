"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { linkDoctorAccountClient } from "../../../../lib/auth/browser";
import styles from "../../../auth.module.css";

export default function DoctorOauthCompletePage() {
  const params = useParams();
  const router = useRouter();
  const code = String(params.code ?? "").toUpperCase();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function finishLink() {
      const result = await linkDoctorAccountClient(code);
      if (!active) return;

      if (!result.ok) {
        setError(result.error ?? "Could not link your doctor account.");
        return;
      }

      router.replace(`/doctor/${code}/dashboard`);
      router.refresh();
    }

    void finishLink();
    return () => {
      active = false;
    };
  }, [code, router]);

  return (
    <div className={styles.page}>
      <aside className={`${styles.panelBrand} ${styles.panelBrandDoctor}`}>
        <div className={styles.brandInner}>
          <h2 className={styles.brandHeadline}>Finishing your doctor sign-in</h2>
          <p className={styles.brandDesc}>
            We are verifying your Google account and linking it to your Doctor ID.
          </p>
        </div>
      </aside>

      <div className={styles.panelForm}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h1>Please wait...</h1>
            <p className={styles.sub}>Linking your doctor portal access.</p>
          </div>

          {error ? <div className={`${styles.alert} ${styles.alertError}`}>{error}</div> : null}
          {!error ? (
            <div className={`${styles.alert} ${styles.alertHint}`}>
              Redirecting to your dashboard...
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
