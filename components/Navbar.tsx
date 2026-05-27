"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/book", label: t.nav.doctors },
  ];

  function linkClass(href: string) {
    const active =
      href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    return `${styles.navLink} ${active ? styles.navLinkActive : ""}`;
  }

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
        </div>

        <div className={styles.actions}>
          <LanguageSwitcher variant="default" />
          <Link href="/book" onClick={() => setMenuOpen(false)}>
            <button type="button" className={styles.bookBtn}>
              {t.nav.bookNow}
            </button>
          </Link>
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
            <Link href="/book" onClick={() => setMenuOpen(false)}>
              <button type="button" className={styles.mobileBookBtn}>
                {t.nav.bookNow}
              </button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
