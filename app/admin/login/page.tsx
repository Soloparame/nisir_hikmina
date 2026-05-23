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

    const result = await signInAdmin(email, password);
    if (!result.ok) {
      setError(result.error ?? "Login failed");
      setLoading(false);
      return;
    }

    router.push("/admin/doctors");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>ንስር ሕክምና</h1>
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
