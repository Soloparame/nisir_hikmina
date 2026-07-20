"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Hash, Mail } from "lucide-react";
import { validateDoctorLogin } from "../../../../lib/actions/auth";
import { sendDoctorPasswordResetClient } from "../../../../lib/auth/browser";
import styles from "../../../auth.module.css";

export default function DoctorResetPasswordPage() {
  const params = useParams();
  const code = String(params.code ?? "").toUpperCase();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const validation = await validateDoctorLogin(code, email);
    if (!validation.ok) {
      setError(validation.error ?? "Could not verify your doctor account.");
      setLoading(false);
      return;
    }

    const result = await sendDoctorPasswordResetClient({
      login_code: code,
      email,
    });
    if (!result.ok) {
      setError(result.error ?? "Could not send reset email.");
      setLoading(false);
      return;
    }

    setSuccess("Password reset link sent. Check your registered email and open the link to create a new password.");
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <aside className={`${styles.panelBrand} ${styles.panelBrandDoctor}`}>
        <div className={styles.brandInner}>
          <h2 className={styles.brandHeadline}>Doctor password reset</h2>
          <p className={styles.brandDesc}>
            Use your registered doctor email to receive a secure reset link.
          </p>
          <div className={styles.idBadge}>
            <Hash size={14} />
            <span className={styles.idBadgeLabel}>Doctor ID</span>
            {code}
          </div>
        </div>
      </aside>

      <div className={styles.panelForm}>
        <Link href={`/doctor/${code}/login`} className={styles.backHome}>
          <ArrowLeft size={16} />
          Back to doctor sign in
        </Link>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <h1>Forgot password?</h1>
            <p className={styles.sub}>
              Enter the exact email your administrator registered for this Doctor ID.
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="doctor-id">
              Doctor ID
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Hash size={18} />
              </span>
              <input id="doctor-id" className={styles.input} type="text" value={code} readOnly />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="doctor-email">
              Registered email
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Mail size={18} />
              </span>
              <input
                id="doctor-email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {error ? <div className={`${styles.alert} ${styles.alertError}`}>{error}</div> : null}
          {success ? (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>
          ) : null}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
