import type { Metadata } from "next";
import styles from "./maintenance.module.css";

export const metadata: Metadata = {
  title: "Under Maintenance — Eagle Medical",
  description: "Eagle Medical is temporarily under maintenance. Please check back soon.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className={styles.page}>
      <div className={styles.panel}>
        <p className={styles.brand}>Eagle Medical</p>
        <h1 className={styles.title}>We&apos;ll be back soon</h1>
        <p className={styles.body}>
          Our website is temporarily under maintenance. We&apos;re working to
          restore full service as quickly as possible.
        </p>
        <p className={styles.bodyAm}>
          ድረ-ገጻችን ለጊዜው በጥገና ላይ ነው። በቅርቡ እንመለሳለን።
        </p>
        <p className={styles.note}>Thank you for your patience.</p>
      </div>
    </main>
  );
}
