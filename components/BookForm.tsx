"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentProfile } from "../lib/actions/auth";
import { createAppointment } from "../lib/actions/doctors";
import {
  formatAvailabilitySlot,
  getDoctorAvailabilitySlots,
  type AvailabilitySlot,
} from "../lib/doctor-availability";
import {
  getDoctorName,
  getDoctorSpecialization,
} from "../lib/doctor-display";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { getCities, getCountries, getStates } from "../lib/location";
import { createClient } from "../lib/supabase/client";
import type { Doctor } from "../lib/types/doctor";
import styles from "../app/book/book.module.css";

type ConsultType = "in_person" | "audio" | "video";

interface FormErrors {
  name?: string;
  phone?: string;
  disease?: string;
  telegram?: string;
  country?: string;
  state?: string;
  city?: string;
  consult?: string;
  availability?: string;
  general?: string;
}

type Props = {
  doctor: Doctor;
  onChangeDoctor: () => void;
};

export default function BookForm({ doctor, onChangeDoctor }: Props) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const countries = useMemo(() => getCountries(), []);
  const availabilitySlots = useMemo(
    () => getDoctorAvailabilitySlots(doctor),
    [doctor]
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [disease, setDisease] = useState("");
  const [telegram, setTelegram] = useState("");
  const [countryCode, setCountryCode] = useState("ET");
  const [countryName, setCountryName] = useState("Ethiopia");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [consult, setConsult] = useState<ConsultType | "">("");
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      const profile = await getCurrentProfile();
      if (profile) {
        if (profile.full_name) setName(profile.full_name);
        if (profile.phone) setPhone(profile.phone);
        if (profile.telegram) setTelegram(profile.telegram);
      }
    }
    loadUser();
  }, []);

  const states = useMemo(
    () => (countryCode ? getStates(countryCode) : []),
    [countryCode]
  );

  const { cities, useTextInput } = useMemo(
    () =>
      countryCode
        ? getCities(countryCode, stateCode || undefined)
        : { cities: [], useTextInput: false },
    [countryCode, stateCode]
  );

  const showStateSelect = states.length > 0;
  const cityDisabled = !countryCode || (showStateSelect && !stateCode);

  function handleCountryChange(code: string) {
    setCountryCode(code);
    const selected = countries.find((c) => c.isoCode === code);
    setCountryName(selected?.name ?? "");
    setStateCode("");
    setCity("");
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = t.book.errors.name;
    if (!phone.trim()) newErrors.phone = t.book.errors.phone;
    if (!disease.trim()) newErrors.disease = t.book.errors.disease;
    if (!telegram.trim()) newErrors.telegram = t.book.errors.telegram;
    if (!countryCode) newErrors.country = t.book.errors.country;
    if (showStateSelect && !stateCode) newErrors.state = t.book.errors.state;
    if (!city.trim()) newErrors.city = t.book.errors.city;
    if (!consult) newErrors.consult = t.book.errors.consult;
    if (availabilitySlots.length > 0 && !selectedSlot) {
      newErrors.availability = t.book.errors.availability;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setSubmitting(true);

    const tg = telegram.startsWith("@") ? telegram : "@" + telegram;
    const consultLabel =
      consult === "in_person"
        ? t.book.inPerson
        : consult === "audio"
          ? t.book.audioCall
          : t.book.videoCall;

    const doctorLabel = getDoctorName(doctor, locale);
    const availabilityTime = selectedSlot
      ? `${t.availability[selectedSlot.labelKey]}: ${formatAvailabilitySlot(selectedSlot)}`
      : undefined;

    const result = await createAppointment({
      doctor_id: doctor.id,
      patient_name: name.trim(),
      phone: phone.trim(),
      disease: disease.trim(),
      telegram: tg,
      country: countryName,
      city: city.trim(),
      consult_type: consultLabel,
      user_id: userId ?? undefined,
      availability_period: selectedSlot?.period,
      availability_time: availabilityTime,
    });

    if (!result.ok) {
      setErrors({
        general: result.error ?? t.book.errors.generic,
      });
      setSubmitting(false);
      return;
    }

    const params = new URLSearchParams({
      name: name.trim(),
      phone: phone.trim(),
      disease: disease.trim(),
      telegram: tg,
      country: countryName,
      city: city.trim(),
      consult: consultLabel,
      doctor: doctorLabel,
      ...(availabilityTime ? { availability: availabilityTime } : {}),
    });

    router.push(`/success?${params.toString()}`);
  }

  const consultOptions: { type: ConsultType; icon: string; label: string }[] = [
    { type: "in_person", icon: "🏥", label: t.book.inPerson },
    { type: "audio", icon: "📞", label: t.book.audioCall },
    { type: "video", icon: "📹", label: t.book.videoCall },
  ];

  return (
    <div className={styles.formPage}>
      <button type="button" className={styles.changeDoctor} onClick={onChangeDoctor}>
        {t.book.changeDoctor}
      </button>

      <div className={styles.selectedDoctor}>
        {doctor.image_url ? (
          <Image
            src={doctor.image_url}
            alt={getDoctorName(doctor, locale)}
            width={56}
            height={56}
            className={styles.doctorThumb}
          />
        ) : (
          <div className={styles.doctorThumbFallback}>👨‍⚕️</div>
        )}
        <div>
          <strong>{getDoctorName(doctor, locale)}</strong>
          <span>{getDoctorSpecialization(doctor, locale)}</span>
        </div>
      </div>

      <div className={styles.formCard}>
        {errors.general && (
          <p className={styles.error} style={{ marginBottom: "1rem" }}>
            {errors.general}
          </p>
        )}

        {availabilitySlots.length > 0 && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t.book.availability} <span className={styles.req}>*</span>
            </label>
            <div className={styles.consultOptions}>
              {availabilitySlots.map((slot) => (
                <div
                  key={slot.period}
                  className={`${styles.consultOpt} ${
                    selectedSlot?.period === slot.period ? styles.active : ""
                  }`}
                  onClick={() => setSelectedSlot(slot)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      setSelectedSlot(slot);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.coIcon}>🕐</div>
                  <div className={styles.coLabel}>
                    {t.availability[slot.labelKey]}
                  </div>
                  <div className={styles.coSub}>
                    {formatAvailabilitySlot(slot)}
                  </div>
                </div>
              ))}
            </div>
            {errors.availability && (
              <p className={styles.error}>{errors.availability}</p>
            )}
          </div>
        )}

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t.book.fullName} <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="text"
              placeholder={t.book.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t.book.phone} <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="tel"
              placeholder={t.book.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && <p className={styles.error}>{errors.phone}</p>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            {t.book.disease} <span className={styles.req}>*</span>
          </label>
          <input
            className={styles.formInput}
            type="text"
            placeholder={t.book.diseasePlaceholder}
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
          />
          {errors.disease && <p className={styles.error}>{errors.disease}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            {t.book.telegram} <span className={styles.req}>*</span>
          </label>
          <input
            className={styles.formInput}
            type="text"
            placeholder={t.book.telegramPlaceholder}
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
          />
          {errors.telegram && <p className={styles.error}>{errors.telegram}</p>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t.book.country} <span className={styles.req}>*</span>
            </label>
            <select
              className={styles.formSelect}
              value={countryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
            >
              <option value="">{t.book.selectCountry}</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            {errors.country && <p className={styles.error}>{errors.country}</p>}
          </div>

          {showStateSelect && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {t.book.state} <span className={styles.req}>*</span>
              </label>
              <select
                className={styles.formSelect}
                value={stateCode}
                onChange={(e) => {
                  setStateCode(e.target.value);
                  setCity("");
                }}
              >
                <option value="">{t.book.selectState}</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.state && <p className={styles.error}>{errors.state}</p>}
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            {t.book.city} <span className={styles.req}>*</span>
          </label>
          {useTextInput || cityDisabled ? (
            <input
              className={styles.formInput}
              type="text"
              placeholder={t.book.cityPlaceholder}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={cityDisabled}
            />
          ) : (
            <select
              className={styles.formSelect}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">{t.book.selectCity}</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
          {errors.city && <p className={styles.error}>{errors.city}</p>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            {t.book.consultType} <span className={styles.req}>*</span>
          </label>
          <div className={styles.consultOptions}>
            {consultOptions.map((opt) => (
              <div
                key={opt.type}
                className={`${styles.consultOpt} ${consult === opt.type ? styles.active : ""}`}
                onClick={() => setConsult(opt.type)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setConsult(opt.type);
                }}
                role="button"
                tabIndex={0}
              >
                <div className={styles.coIcon}>{opt.icon}</div>
                <div className={styles.coLabel}>{opt.label}</div>
              </div>
            ))}
          </div>
          {errors.consult && <p className={styles.error}>{errors.consult}</p>}
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? t.success.loading : t.book.submit}
        </button>
      </div>
    </div>
  );
}
