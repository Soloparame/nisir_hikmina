"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAdmin } from "../../../lib/actions/doctors";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signInAdmin(email, password);
      if (!result.ok) {
        setError(result.error ?? "Login failed");
        setLoading(false);
        return;
      }

      router.push("/admin/doctors");
      router.refresh();
    } catch (err) {
      // If Next.js can't reach the server action endpoint, you'll see generic
      // "failed to fetch" — this makes the UI show something actionable.
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "fetch failed" || msg.includes("Failed to fetch")
          ? "Cannot reach the server. On Netlify: add Supabase env vars and redeploy. See NETLIFY-DEPLOY.md."
          : msg || "Login request failed. Check production env vars (Supabase URL + key)."
      );
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>ኢግል ሜዲካል</h1>
        <p className={styles.sub}>የአስተዳዳሪ መግቢያ</p>

        <label className={styles.label}>ኢሜይል</label>
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className={styles.label}>የይለፍ ቃል</label>
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? "በመግባት ላይ..." : "ግባ"}
        </button>
      </form>
    </div>
  );
}
