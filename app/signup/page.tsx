"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { signUpPatientClient } from "../../lib/auth/browser";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import styles from "../auth.module.css";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const redirect = searchParams.get("redirect") || "/book";
  const doctorId = searchParams.get("doctor");
  const loginHref = doctorId
    ? `/login?redirect=${encodeURIComponent(redirect)}&doctor=${doctorId}`
    : `/login?redirect=${encodeURIComponent(redirect)}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await signUpPatientClient({
      email,
      password,
      full_name: fullName,
      phone,
    });

    if (!result.ok) {
      setError(result.error ?? t.auth.signupFailed);
      setLoading(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccess(t.auth.confirmEmailSent);
      setLoading(false);
      return;
    }

    const dest = doctorId
      ? `${redirect}${redirect.includes("?") ? "&" : "?"}doctor=${doctorId}`
      : redirect;
    router.push(dest);
    router.refresh();
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

          <h2 className={styles.brandHeadline}>{t.auth.signupTitle}</h2>
          <p className={styles.brandDesc}>{t.auth.signupSub}</p>
        </div>
      </aside>

      <div className={styles.panelForm}>
        <Link href="/" className={styles.backHome}>
          <ArrowLeft size={16} />
          {t.book.backHome}
        </Link>

        <form className={styles.card} onSubmit={handleSubmit}>
          <div className={styles.cardHeader}>
            <h1>{t.auth.createAccount}</h1>
            <p className={styles.sub}>{t.auth.signupCardSub}</p>
          </div>

          {doctorId && (
            <div className={`${styles.alert} ${styles.alertHint}`}>
              {t.auth.signupToBook}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              {t.book.fullName}
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <User size={18} />
              </span>
              <input
                id="name"
                className={styles.input}
                type="text"
                placeholder={t.book.namePlaceholder}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label className={styles.label} htmlFor="phone">
              {t.book.phone}
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Phone size={18} />
              </span>
              <input
                id="phone"
                className={styles.input}
                type="tel"
                placeholder={t.book.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {error && (
            <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>
          )}
          {success && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              {success}
            </div>
          )}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? t.auth.signingUp : t.auth.signupBtn}
          </button>

          <div className={styles.divider}>{t.auth.or}</div>

          <p className={styles.linkRow}>
            {t.auth.hasAccount}{" "}
            <Link href={loginHref}>{t.auth.loginLink}</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
