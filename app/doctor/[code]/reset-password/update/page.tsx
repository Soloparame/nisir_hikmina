"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import AuthRecoveryBootstrap from "../../../../../components/AuthRecoveryBootstrap";
import {
  linkDoctorAccountClient,
  updateCurrentUserPasswordClient,
} from "../../../../../lib/auth/browser";
import styles from "../../../../auth.module.css";

function DoctorUpdatePasswordForm() {
  const params = useParams();
  const code = String(params.code ?? "").toUpperCase();
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

    const update = await updateCurrentUserPasswordClient(password);
    if (!update.ok) {
      setError(update.error ?? "Could not update password.");
      setLoading(false);
      return;
    }

    const link = await linkDoctorAccountClient(code);
    if (!link.ok) {
      setError(
        link.error ?? "Password updated, but doctor account could not be linked."
      );
      setLoading(false);
      return;
    }

    setSuccess("Password updated successfully. Redirecting to your doctor sign-in...");
    setLoading(false);
    window.setTimeout(() => {
      router.push(`/doctor/${code}/login`);
      router.refresh();
    }, 1200);
  }

  return (
    <AuthRecoveryBootstrap>
      {({ ready, hasSession, error: bootstrapError }) => (
        <div className={styles.page}>
          <aside className={`${styles.panelBrand} ${styles.panelBrandDoctor}`}>
            <div className={styles.brandInner}>
              <h2 className={styles.brandHeadline}>Create a new doctor password</h2>
              <p className={styles.brandDesc}>
                Choose a strong password for your doctor portal account.
              </p>
            </div>
          </aside>

          <div className={styles.panelForm}>
            <Link href={`/doctor/${code}/login`} className={styles.backHome}>
              <ArrowLeft size={16} />
              Back to doctor sign in
            </Link>

            <form className={styles.card} onSubmit={handleSubmit}>
              <div className={styles.cardHeader}>
                <h1>Update password</h1>
                <p className={styles.sub}>
                  Enter your new doctor portal password below.
                </p>
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
                <Link
                  href={`/doctor/${code}/reset-password`}
                  className={styles.btn}
                >
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

export default function DoctorUpdatePasswordPage() {
  return (
    <Suspense>
      <DoctorUpdatePasswordForm />
    </Suspense>
  );
}
