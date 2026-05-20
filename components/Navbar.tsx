"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <span className={styles.dot} />
          Nisir Hikimina
        </Link>
        <Link href="/book">
          <button className={styles.bookBtn}>Book Appointment</button>
        </Link>
      </div>
    </nav>
  );
}
