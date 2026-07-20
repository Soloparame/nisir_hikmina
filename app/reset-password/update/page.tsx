"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { updateCurrentUserPasswordClient } from "../../../lib/auth/browser";
import styles from "../../auth.module.css";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await updateCurrentUserPasswordClient(password);
    if (!result.ok) {
      setError(result.error ?? "Could not update password.");
      setLoading(false);
      return;
    }

    setSuccess("Password updated successfully. Redirecting to sign in...");
    setLoading(false);
    window.setTimeout(() => {
      router.push("/login");
      router.refresh();
    }, 1200);
  }

  return (
    <div className={styles.page}>
      <aside className={styles.panelBrand}>
        <div className={styles.brandInner}>
          <h2 className={styles.brandHeadline}>Create a new password</h2>
          <p className={styles.brandDesc}>
            Choose a strong password for your patient account.
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
            <h1>Update password</h1>
            <p className={styles.sub}>Enter your new password below.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              New password
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Lock size={18} />
              </span>
              <input
                id="password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirm-password">
              Confirm password
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Lock size={18} />
              </span>
              <input
                id="confirm-password"
                className={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          </div>

          {error ? <div className={`${styles.alert} ${styles.alertError}`}>{error}</div> : null}
          {success ? (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>{success}</div>
          ) : null}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
