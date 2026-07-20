"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { requestPatientPasswordReset } from "../../lib/actions/password-reset";
import styles from "../auth.module.css";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await requestPatientPasswordReset(email);
    if (!result.ok) {
      setError(result.error ?? "Could not send reset email.");
      setLoading(false);
      return;
    }

    setSuccess(
      "Password reset link sent. Check your email and open the newest link to create a new password. The link works on any phone or computer."
    );
    setLoading(false);
  }

  return (
    <div className={styles.page}>
      <aside className={styles.panelBrand}>
        <div className={styles.brandInner}>
          <h2 className={styles.brandHeadline}>Reset your password</h2>
          <p className={styles.brandDesc}>
            Enter your patient account email and we will send you a secure reset link.
          </p>
        </div>
      </aside>

      <div className={styles.panelForm}>
        <Link href="/login" className={styles.backHome}>
          <ArrowLeft size={16} />
          Back to sign in
        </Link>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <h1>Forgot password?</h1>
            <p className={styles.sub}>Use the email connected to your patient account.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Mail size={18} />
              </span>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
