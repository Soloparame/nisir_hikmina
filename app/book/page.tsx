"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import styles from "./book.module.css";

const CITIES = [
  "Addis Ababa",
  "Bahir Dar",
  "Gondar",
  "Hawassa",
  "Dire Dawa",
  "Mekelle",
  "Adama (Nazret)",
  "Jimma",
  "Dessie",
  "Jijiga",
  "Shashamane",
  "Bishoftu (Debre Zeit)",
  "Arba Minch",
  "Hosaena",
  "Sodo (Wolaita)",
];

type ConsultType = "In Person" | "Audio Call" | "Video Call";

interface FormErrors {
  name?: string;
  phone?: string;
  disease?: string;
  telegram?: string;
  city?: string;
  consult?: string;
}

export default function BookPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [disease, setDisease] = useState("");
  const [telegram, setTelegram] = useState("");
  const [city, setCity] = useState("");
  const [consult, setConsult] = useState<ConsultType | "">("");
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!disease.trim()) newErrors.disease = "Please describe your condition";
    if (!telegram.trim()) newErrors.telegram = "Telegram username is required";
    if (!city) newErrors.city = "Please select your city";
    if (!consult) newErrors.consult = "Please choose a consultation type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const tg = telegram.startsWith("@") ? telegram : "@" + telegram;

    const params = new URLSearchParams({
      name: name.trim(),
      phone: phone.trim(),
      disease: disease.trim(),
      telegram: tg,
      city,
      consult,
    });

    router.push(`/success?${params.toString()}`);
  }

  const consultOptions: { type: ConsultType; icon: string; label: string }[] = [
    { type: "In Person", icon: "🏥", label: "In Person" },
    { type: "Audio Call", icon: "📞", label: "Audio Call" },
    { type: "Video Call", icon: "📹", label: "Video Call" },
  ];

  return (
    <>
      <Navbar />

      <div className={styles.pageHeader}>
        <Link href="/" className={styles.backLink}>← Back to Home</Link>
        <h1>Book an Appointment</h1>
        <p>Fill in your details and we'll reach out to confirm</p>
      </div>

      <div className={styles.formPage}>
        <div className={styles.formCard}>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Full Name <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.formInput}
                type="text"
                placeholder="e.g. Aisha Mohammed"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className={styles.error}>{errors.name}</p>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Phone Number <span className={styles.req}>*</span>
              </label>
              <input
                className={styles.formInput}
                type="tel"
                placeholder="+251 9XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && <p className={styles.error}>{errors.phone}</p>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Disease / Condition <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="text"
              placeholder="Describe your condition or symptoms"
              value={disease}
              onChange={(e) => setDisease(e.target.value)}
            />
            {errors.disease && <p className={styles.error}>{errors.disease}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Telegram Username <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="text"
              placeholder="@yourusername"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
            />
            {errors.telegram && <p className={styles.error}>{errors.telegram}</p>}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Country</label>
              <select className={styles.formSelect} disabled>
                <option>🇪🇹 Ethiopia</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                City / Address <span className={styles.req}>*</span>
              </label>
              <select
                className={styles.formSelect}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">— Select city —</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.city && <p className={styles.error}>{errors.city}</p>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Consultation Type <span className={styles.req}>*</span>
            </label>
            <div className={styles.consultOptions}>
              {consultOptions.map((opt) => (
                <div
                  key={opt.type}
                  className={`${styles.consultOpt} ${consult === opt.type ? styles.active : ""}`}
                  onClick={() => setConsult(opt.type)}
                >
                  <div className={styles.coIcon}>{opt.icon}</div>
                  <div className={styles.coLabel}>{opt.label}</div>
                </div>
              ))}
            </div>
            {errors.consult && <p className={styles.error}>{errors.consult}</p>}
          </div>

          <button className={styles.submitBtn} onClick={handleSubmit}>
            Submit Appointment Request
          </button>
        </div>
      </div>
    </>
  );
}
