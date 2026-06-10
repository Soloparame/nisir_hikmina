"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  Send,
  User,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter";
import { isPatientUser } from "../../lib/auth/session";
import {
  loadProfileClient,
  signOutClient,
  updatePatientProfileClient,
} from "../../lib/auth/browser";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import styles from "./profile.module.css";

function getInitials(name: string, email: string): string {
  const trimmed = name.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const initials = useMemo(
    () => getInitials(fullName, email),
    [fullName, email]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { user, profile: p } = await loadProfileClient();

      if (cancelled) return;

      if (!user || !isPatientUser(user)) {
        router.replace("/login?redirect=/profile");
        return;
      }

      setEmail(user.email ?? "");

      if (p) {
        setFullName(p.full_name ?? "");
        setPhone(p.phone ?? "");
        setTelegram(p.telegram ?? "");
      } else {
        const meta = user.user_metadata ?? {};
        setFullName((meta.full_name as string) ?? "");
        setPhone((meta.phone as string) ?? "");
      }

      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const result = await updatePatientProfileClient({
      full_name: fullName,
      phone,
      telegram,
    });

    if (!result.ok) {
      setError(result.error ?? "Save failed");
    } else {
      setMessage(t.auth.profileSaved);
    }
    setSaving(false);
  }

  async function handleSignOut() {
    await signOutClient();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className={styles.shell}>
        <Navbar />
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>{t.success.loading}</p>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <Navbar />

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroTitle}>{t.auth.profileTitle}</p>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileMeta}>
              <h1>{fullName || t.auth.patientAccount}</h1>
              {email && (
                <p className={styles.profileEmail}>
                  <Mail size={15} />
                  {email}
                </p>
              )}
              <span className={styles.badge}>{t.auth.patientBadge}</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <p className={styles.sidebarTitle}>{t.auth.quickLinks}</p>
            <Link href="/book" className={styles.navLink}>
              <Calendar size={18} />
              {t.nav.bookNow}
            </Link>
            <Link href="/chat" className={styles.navLink}>
              <MessageCircle size={18} />
              {t.nav.chat}
            </Link>
            <button
              type="button"
              className={styles.signOutBtn}
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              {t.auth.signOut}
            </button>
          </aside>

          <div className={styles.mainCard}>
            <div className={styles.cardHead}>
              <h2>{t.auth.personalInfo}</h2>
              <p>{t.auth.personalInfoSub}</p>
            </div>

            <form className={styles.formBody} onSubmit={handleSave}>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label htmlFor="fullName">{t.book.fullName}</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <User size={18} />
                    </span>
                    <input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="phone">{t.book.phone}</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <Phone size={18} />
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.book.phonePlaceholder}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="telegram">{t.book.telegram}</label>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>
                      <Send size={18} />
                    </span>
                    <input
                      id="telegram"
                      value={telegram}
                      onChange={(e) => setTelegram(e.target.value)}
                      placeholder={t.book.telegramPlaceholder}
                    />
                  </div>
                </div>
              </div>

              {message && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                  <CheckCircle2 size={18} />
                  {message}
                </div>
              )}
              {error && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={saving}
              >
                {saving ? t.auth.saving : t.auth.saveProfile}
              </button>
            </form>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
