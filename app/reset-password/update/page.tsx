"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthRecoveryBootstrap from "../../../components/AuthRecoveryBootstrap";
import { updateCurrentUserPasswordClient } from "../../../lib/auth/browser";
import styles from "../../auth.module.css";

function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkError = searchParams.get("error") || "";
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
    <AuthRecoveryBootstrap>
      {({ ready, hasSession, error: bootstrapError }) => (
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

              {!ready ? (
                <div className={`${styles.alert} ${styles.alertHint}`}>
                  Verifying your reset link...
                </div>
              ) : null}

              {linkError || bootstrapError || error ? (
                <div className={`${styles.alert} ${styles.alertError}`}>
                  {error || linkError || bootstrapError}
                </div>
              ) : null}

              {success ? (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                  {success}
                </div>
              ) : null}

              {ready && hasSession ? (
                <>
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

                  <button className={styles.btn} type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update password"}
                  </button>
                </>
              ) : ready ? (
                <Link href="/reset-password" className={styles.btn}>
                  Request a new reset link
                </Link>
              ) : null}
            </form>
          </div>
        </div>
      )}
    </AuthRecoveryBootstrap>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense>
      <UpdatePasswordForm />
    </Suspense>
  );
}
