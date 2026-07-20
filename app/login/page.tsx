"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Lock,
  Mail,
  MessageCircle,
  Shield,
  Stethoscope,
} from "lucide-react";
import PatientTerms from "../../components/PatientTerms";
import {
  signInPatientClient,
  signInPatientWithGoogleClient,
} from "../../lib/auth/browser";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import styles from "../auth.module.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/book";
  const doctorId = searchParams.get("doctor");
  const authError = searchParams.get("error");
  const signupHref = doctorId
    ? `/signup?redirect=${encodeURIComponent(redirect)}&doctor=${doctorId}`
    : `/signup?redirect=${encodeURIComponent(redirect)}`;
  const forgotHref = `/reset-password${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signInPatientClient(email, password);
    if (!result.ok) {
      setError(result.error ?? t.auth.loginFailed);
      setLoading(false);
      return;
    }

    const dest = (() => {
      if (!doctorId) return redirect;
      if (redirect.includes(`doctor=${doctorId}`)) return redirect;
      return `${redirect}${redirect.includes("?") ? "&" : "?"}doctor=${doctorId}`;
    })();
    router.push(dest);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");
    const result = await signInPatientWithGoogleClient(redirect);
    if (!result.ok) {
      setError(result.error ?? "Google sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <aside className={styles.panelBrand}>
        <div className={styles.brandInner}>
          <div className={styles.logoRow}>
            <div className={styles.logoMark}>
              <Image
                src="/photo_2026-03-18_21-21-01.jpg"
                alt=""
                width={40}
                height={40}
                style={{ borderRadius: 10, objectFit: "cover" }}
              />
            </div>
            <div>
              <div className={styles.brandName}>{t.brand.name}</div>
              <div className={styles.brandTagline}>{t.brand.tagline}</div>
            </div>
          </div>

          <h2 className={styles.brandHeadline}>{t.auth.welcomeBack}</h2>
          <p className={styles.brandDesc}>{t.auth.loginSub}</p>

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <Stethoscope size={18} />
              </span>
              {t.auth.featureDoctors}
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <Calendar size={18} />
              </span>
              {t.auth.featureBook}
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <MessageCircle size={18} />
              </span>
              {t.auth.featureChat}
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <Shield size={18} />
              </span>
              {t.auth.featureSecure}
            </li>
          </ul>
        </div>
      </aside>

      <div className={styles.panelForm}>
        <Link href="/" className={styles.backHome}>
          <ArrowLeft size={16} />
          {t.book.backHome}
        </Link>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <h1>{t.auth.loginTitle}</h1>
            <p className={styles.sub}>{t.auth.loginCardSub}</p>
          </div>

          {doctorId && (
            <div className={`${styles.alert} ${styles.alertHint}`}>
              {t.auth.loginToBook}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              {t.auth.email}
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Mail size={18} />
              </span>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              {t.auth.password}
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Lock size={18} />
              </span>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <PatientTerms />

          <div className={styles.forgotRow}>
            <Link href={forgotHref} className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          {error || authError ? (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error || authError}
            </div>
          ) : null}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? t.auth.loggingIn : t.auth.loginBtn}
          </button>

          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Continue with Google
          </button>

          <div className={styles.divider}>{t.auth.or}</div>

          <p className={styles.linkRow}>
            {t.auth.noAccount}{" "}
            <Link href={signupHref}>{t.auth.signupLink}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
