"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./TelegramFab.module.css";

const TELEGRAM_URL = "https://t.me/NisirAd";

export default function TelegramFab() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <Link
      href={TELEGRAM_URL}
      className={styles.fab}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact Nisir on Telegram @NisirAd"
    >
      <span className={styles.pulse} aria-hidden />
      <span className={styles.badge} aria-hidden />
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.48-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    </Link>
  );
}
