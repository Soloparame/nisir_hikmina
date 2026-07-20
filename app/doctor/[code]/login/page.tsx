"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ClipboardList,
  Hash,
  Lock,
  Mail,
  MessageCircle,
  Stethoscope,
} from "lucide-react";
import { getDoctorByLoginCode, validateDoctorLogin } from "../../../../lib/actions/auth";
import {
  loginDoctorClient,
  signInDoctorWithGoogleClient,
} from "../../../../lib/auth/browser";
import { useLanguage } from "../../../../lib/i18n/LanguageContext";
import styles from "../../../auth.module.css";

function DoctorLoginForm() {
  const params = useParams();
  const urlCode = String(params.code ?? "").toUpperCase();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const [doctorId, setDoctorId] = useState(urlCode);
  const [doctorName, setDoctorName] = useState("");
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const authError = searchParams.get("error");

  useEffect(() => {
    setDoctorId(urlCode);
  }, [urlCode]);

  useEffect(() => {
    let cancelled = false;

    async function loadDoctor() {
      setLoadingDoctor(true);
      const doctor = await getDoctorByLoginCode(doctorId);
      if (cancelled) return;

      if (doctor) {
        setDoctorName(
          (doctor.name_en as string | null)?.trim() ||
            (doctor.name as string) ||
            ""
        );
        setIsFirstLogin(!doctor.auth_user_id);
        if (doctor.email) {
          setEmail((prev) => prev || (doctor.email as string).trim());
        }
      } else {
        setDoctorName("");
        setIsFirstLogin(true);
      }
      setLoadingDoctor(false);
    }

    if (doctorId) loadDoctor();
    else setLoadingDoctor(false);

    return () => {
      cancelled = true;
    };
  }, [doctorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const code = doctorId.trim().toUpperCase();
    const validation = await validateDoctorLogin(code, email);
    if (!validation.ok) {
      setError(validation.error ?? t.doctorAuth.loginFailed);
      setLoading(false);
      return;
    }

    const result = await loginDoctorClient({
      login_code: code,
      email,
      password,
      doctorName: validation.doctorName ?? doctorName,
      isFirstLogin: validation.isFirstLogin ?? isFirstLogin,
    });

    if (!result.ok) {
      setError(result.error ?? t.doctorAuth.loginFailed);
      setLoading(false);
      return;
    }

    if (result.needsEmailConfirmation) {
      setError(t.doctorAuth.confirmThenSignIn);
      setLoading(false);
      return;
    }

    router.push(`/doctor/${code}/dashboard`);
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");

    const code = doctorId.trim().toUpperCase();
    const validation = await validateDoctorLogin(code, email);
    if (!validation.ok) {
      setError(validation.error ?? t.doctorAuth.loginFailed);
      setLoading(false);
      return;
    }

    const result = await signInDoctorWithGoogleClient({
      login_code: code,
    });

    if (!result.ok) {
      setError(result.error ?? "Google sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <aside className={`${styles.panelBrand} ${styles.panelBrandDoctor}`}>
        <div className={styles.brandInner}>
          <div className={styles.logoRow}>
            <div className={styles.logoMark}>
              <span className={styles.doctorIconMark} aria-hidden>
                <Stethoscope size={26} color="#fff" />
              </span>
            </div>
            <div>
              <div className={styles.brandName}>{t.brand.name}</div>
              <div className={styles.brandTagline}>{t.doctorAuth.portal}</div>
            </div>
          </div>

          <h2 className={styles.brandHeadline}>
            {doctorName
              ? `${t.doctorAuth.welcomeDr} ${doctorName}`
              : t.doctorAuth.welcome}
          </h2>
          <p className={styles.brandDesc}>{t.doctorAuth.registeredSub}</p>

          {doctorId && (
            <div className={styles.idBadge}>
              <Hash size={14} />
              <span className={styles.idBadgeLabel}>{t.doctorAuth.doctorId}</span>
              {doctorId}
            </div>
          )}

          <ul className={styles.featureList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <ClipboardList size={18} />
              </span>
              {t.doctorAuth.featureBookings}
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <Bell size={18} />
              </span>
              {t.doctorAuth.featureNotify}
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>
                <MessageCircle size={18} />
              </span>
              {t.doctorAuth.featureChat}
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
            <h1>{t.doctorAuth.signIn}</h1>
            <p className={styles.sub}>{t.doctorAuth.registeredLoginSub}</p>
          </div>

          {!loadingDoctor && isFirstLogin && (
            <div className={`${styles.alert} ${styles.alertHint}`}>
              {t.doctorAuth.firstLoginHint}
            </div>
          )}

          {!isFirstLogin ? (
            <div className={`${styles.alert} ${styles.alertHint}`}>
              {t.doctorAuth.returnLoginHint}
            </div>
          ) : null}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="doctor-id">
              {t.doctorAuth.doctorId}
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Hash size={18} />
              </span>
              <input
                id="doctor-id"
                className={styles.input}
                type="text"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value.toUpperCase())}
                placeholder="ABC12345"
                autoComplete="off"
                readOnly={!isFirstLogin}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="doctor-email">
              {t.doctorAuth.registeredEmail}
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Mail size={18} />
              </span>
              <input
                id="doctor-email"
                className={styles.input}
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="doctor-password">
              {isFirstLogin ? t.doctorAuth.createPassword : t.auth.password}
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>
                <Lock size={18} />
              </span>
              <input
                id="doctor-password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  isFirstLogin ? "new-password" : "current-password"
                }
                minLength={6}
                required
              />
            </div>
            <p className={styles.fieldHint}>
              {isFirstLogin
                ? t.doctorAuth.passwordFirstTime
                : t.doctorAuth.passwordReturn}
            </p>
          </div>

          {!isFirstLogin ? (
            <div className={styles.forgotRow}>
              <Link
                href={`/doctor/${doctorId.trim().toUpperCase() || urlCode}/reset-password`}
                className={styles.forgotLink}
              >
                Forgot password?
              </Link>
            </div>
          ) : null}

          {error || authError ? (
            <div className={`${styles.alert} ${styles.alertError}`}>
              {error || authError}
            </div>
          ) : null}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading
              ? t.doctorAuth.signingIn
              : isFirstLogin
                ? t.doctorAuth.activateBtn
                : t.doctorAuth.signInBtn}
          </button>

          <button
            className={styles.secondaryBtn}
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}

export default function DoctorLoginPage() {
  return (
    <Suspense>
      <DoctorLoginForm />
    </Suspense>
  );
}
