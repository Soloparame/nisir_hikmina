"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User, X } from "lucide-react";
import { isPatientUser } from "../lib/auth/session";
import { createClient } from "../lib/supabase/client";
import { useLanguage } from "../lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./Navbar.module.css";

type AuthState = "loading" | "patient" | "guest";

export default function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setAuthState("guest");
      return;
    }

    async function syncAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setAuthState(isPatientUser(user) ? "patient" : "guest");
    }

    syncAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/doctors", label: t.nav.doctors },
    { href: "/whats-new", label: t.nav.whatsNew },
  ];

  function linkClass(href: string) {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return `${styles.navLink} ${active ? styles.navLinkActive : ""}`;
  }

  const showPatientLinks = authState === "patient";

  return (
    <header className={styles.navShell}>
      <nav
        className={`${styles.nav} ${menuOpen ? styles.navExpanded : ""}`}
      >
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <span className={styles.logoMark}>
            <Image
              src="/photo_2026-03-18_21-21-01.jpg"
              alt={t.brand.name}
              width={42}
              height={42}
              className={styles.logoImg}
              priority
            />
          </span>
          <span className={styles.logoText}>
            <strong>{t.brand.name}</strong>
            <small>{t.brand.tagline}</small>
          </span>
        </Link>

        <div className={styles.links}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
            >
              {item.label}
            </Link>
          ))}
          {showPatientLinks && (
            <Link href="/chat" className={linkClass("/chat")}>
              {t.nav.chat}
            </Link>
          )}
        </div>

        <div className={styles.actions}>
          <LanguageSwitcher variant="default" />
          {authState === "loading" ? null : showPatientLinks ? (
            <>
              <Link href="/book" onClick={() => setMenuOpen(false)}>
                <button type="button" className={styles.bookBtn}>
                  {t.nav.bookNow}
                </button>
              </Link>
              <Link
                href="/profile"
                className={`${styles.iconBtn} ${
                  pathname === "/profile" || pathname.startsWith("/profile/")
                    ? styles.iconBtnActive
                    : ""
                }`}
                aria-label={t.nav.profile}
                title={t.nav.profile}
                onClick={() => setMenuOpen(false)}
              >
                <User size={20} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.authLink}>
                {t.nav.login}
              </Link>
              <Link href="/book" onClick={() => setMenuOpen(false)}>
                <button type="button" className={styles.bookBtn}>
                  {t.nav.bookNow}
                </button>
              </Link>
            </>
          )}
          <button
            type="button"
            className={styles.menuBtn}
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        </div>

        {menuOpen && (
          <div className={styles.mobileMenu}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={linkClass(item.href)}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {showPatientLinks ? (
              <Link
                href="/chat"
                className={linkClass("/chat")}
                onClick={() => setMenuOpen(false)}
              >
                {t.nav.chat}
              </Link>
            ) : authState !== "loading" ? (
              <Link
                href="/login"
                className={linkClass("/login")}
                onClick={() => setMenuOpen(false)}
              >
                {t.nav.login}
              </Link>
            ) : null}
            <Link href="/book" onClick={() => setMenuOpen(false)}>
              <button type="button" className={styles.mobileBookBtn}>
                {t.nav.bookNow}
              </button>
            </Link>
            {showPatientLinks && (
              <Link
                href="/profile"
                className={`${styles.mobileProfileBtn} ${
                  pathname === "/profile" || pathname.startsWith("/profile/")
                    ? styles.iconBtnActive
                    : ""
                }`}
                onClick={() => setMenuOpen(false)}
                aria-label={t.nav.profile}
                title={t.nav.profile}
              >
                <User size={20} />
                <span>{t.nav.profile}</span>
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
