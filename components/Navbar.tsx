"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className={`${styles.nav} ${isHome ? styles.navHero : ""}`}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMark}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 4v16M8 8h8M6 12h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className={styles.logoText}>
            <strong>{t.brand.name}</strong>
            <small>{t.brand.tagline}</small>
          </span>
        </Link>

        <div className={styles.links}>
          <Link href="/" className={styles.navLink}>
            {t.nav.home}
          </Link>
          <Link href="/book" className={styles.navLink}>
            {t.nav.doctors}
          </Link>
        </div>

        <div className={styles.actions}>
          <LanguageSwitcher variant={isHome ? "light" : "default"} />
          <Link href="/book">
            <button className={styles.bookBtn}>{t.nav.bookNow}</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
