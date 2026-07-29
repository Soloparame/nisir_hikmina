"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCurrentProfile } from "../lib/actions/auth";
import {
  createBookingWithPayment,
  getBookedTimesForDoctor,
} from "../lib/actions/bookings";
import {
  formatScheduledDateTime,
  generateTimeSlotsForPeriod,
  type TimeSlotOption,
} from "../lib/booking-slots";
import {
  formatEtb,
  getConsultationPrice,
  getDoctorPricingTier,
  getTierLabel,
  getTierPricingList,
  type ConsultTypeKey,
} from "../lib/consultation-pricing";
import {
  formatAvailabilitySlot,
  formatBookableDateChip,
  getDoctorAvailabilitySlots,
  getDoctorWeeklySchedule,
  getUpcomingBookableDates,
  type AvailabilitySlot,
} from "../lib/doctor-availability";
import { formatWeekdayList, formatWeekdayName } from "../lib/availability-days";
import {
  getDoctorName,
  getDoctorSpecialization,
} from "../lib/doctor-display";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { getCities, getCountries, getStates } from "../lib/location";
import {
  getPaymentAccount,
  getPaymentAccountHolder,
  type PaymentMethod,
} from "../lib/payment-config";
import { createClient } from "../lib/supabase/client";
import type { Doctor } from "../lib/types/doctor";
import styles from "../app/book/book.module.css";

interface FormErrors {
  name?: string;
  phone?: string;
  disease?: string;
  country?: string;
  state?: string;
  city?: string;
  consult?: string;
  availability?: string;
  date?: string;
  time?: string;
  payment?: string;
  screenshot?: string;
  general?: string;
}

type Props = {
  doctor: Doctor;
  onChangeDoctor: () => void;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookForm({ doctor, onChangeDoctor }: Props) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const countries = useMemo(() => getCountries(), []);
  const pricingTier = useMemo(() => getDoctorPricingTier(doctor), [doctor]);
  const tierPricing = useMemo(
    () => getTierPricingList(pricingTier),
    [pricingTier]
  );
  const lang = locale === "am" ? "am" : "en";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [disease, setDisease] = useState("");
  const [countryCode, setCountryCode] = useState("ET");
  const [countryName, setCountryName] = useState("Ethiopia");
  const [stateCode, setStateCode] = useState("");
  const [city, setCity] = useState("");
  const [consult, setConsult] = useState<ConsultTypeKey | "">("");
  const [appointmentDate, setAppointmentDate] = useState(todayIsoDate());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );
  const [selectedTime, setSelectedTime] = useState<TimeSlotOption | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const availabilitySlots = useMemo(
    () => getDoctorAvailabilitySlots(doctor, appointmentDate),
    [doctor, appointmentDate]
  );
  const doctorHasAnyAvailability = useMemo(
    () =>
      Boolean(
        doctor.morning_start ||
          doctor.afternoon_start ||
          doctor.evening_start
      ),
    [doctor]
  );
  const weeklySchedule = useMemo(
    () => getDoctorWeeklySchedule(doctor),
    [doctor]
  );
  const upcomingDates = useMemo(
    () => getUpcomingBookableDates(doctor, todayIsoDate(), 14),
    [doctor]
  );

  const timeSlotOptions = useMemo(() => {
    if (!selectedSlot) return [];
    return generateTimeSlotsForPeriod(selectedSlot, 20).filter(
      (slot) => !bookedTimes.includes(slot.time)
    );
  }, [selectedSlot, bookedTimes]);

  const selectedPrice = useMemo(() => {
    if (!consult) return null;
    return getConsultationPrice(pricingTier, consult);
  }, [consult, pricingTier]);

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
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (!appointmentDate) return;
    let cancelled = false;

    async function loadBooked() {
      setLoadingSlots(true);
      const times = await getBookedTimesForDoctor(doctor.id, appointmentDate);
      if (!cancelled) {
        setBookedTimes(times);
        setLoadingSlots(false);
      }
    }

    loadBooked();
    return () => {
      cancelled = true;
    };
  }, [appointmentDate, doctor.id]);

  useEffect(() => {
    setSelectedTime(null);
  }, [selectedSlot, appointmentDate, bookedTimes]);

  useEffect(() => {
    if (
      selectedSlot &&
      !availabilitySlots.some((s) => s.period === selectedSlot.period)
    ) {
      setSelectedSlot(null);
    }
  }, [availabilitySlots, selectedSlot]);

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

  function consultLabel(type: ConsultTypeKey): string {
    if (type === "text") return t.book.textConsult;
    if (type === "audio") return t.book.voiceCall;
    return t.book.videoCall;
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!name.trim()) newErrors.name = t.book.errors.name;
    if (!phone.trim()) newErrors.phone = t.book.errors.phone;
    if (!disease.trim()) newErrors.disease = t.book.errors.disease;
    if (!countryCode) newErrors.country = t.book.errors.country;
    if (showStateSelect && !stateCode) newErrors.state = t.book.errors.state;
    if (!city.trim()) newErrors.city = t.book.errors.city;
    if (!consult) newErrors.consult = t.book.errors.consult;
    if (!appointmentDate) newErrors.date = t.book.errors.date;
    if (availabilitySlots.length > 0 && !selectedSlot) {
      newErrors.availability = t.book.errors.availability;
    }
    if (availabilitySlots.length > 0 && selectedSlot && !selectedTime) {
      newErrors.time = t.book.errors.time;
    }
    if (!paymentMethod) newErrors.payment = t.book.errors.payment;
    if (!screenshotFile) newErrors.screenshot = t.book.errors.screenshot;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function uploadPaymentScreenshot(
    file: File,
    appointmentKey: string
  ): Promise<{ ok: boolean; url?: string; error?: string }> {
    const supabase = createClient();
    if (!supabase) {
      return { ok: false, error: t.book.errors.uploadNotConfigured };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { ok: false, error: "Please sign in again before submitting payment." };
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "heic"].includes(ext)
      ? ext
      : "jpg";
    // Unique path — do not upsert (storage has insert policy only)
    const path = `${user.id}/${appointmentKey}-${Date.now()}.${safeExt}`;

    const { error } = await supabase.storage
      .from("payment-screenshots")
      .upload(path, file, {
        upsert: false,
        contentType: file.type || `image/${safeExt === "jpg" ? "jpeg" : safeExt}`,
      });

    if (error) {
      return { ok: false, error: error.message };
    }

    // Store storage path only — bucket is private; admins get signed URLs later
    return { ok: true, url: path };
  }

  async function handleSubmit() {
    if (!validate() || !consult || !paymentMethod || !screenshotFile) return;
    if (selectedPrice == null) return;

    setSubmitting(true);
    setErrors({});

    try {
      const supabase = createClient();
      if (!supabase) {
        setErrors({ general: t.book.errors.uploadNotConfigured });
        return;
      }

      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setErrors({
          general: "Please sign in again, then submit your booking.",
        });
        router.push(
          `/login?redirect=${encodeURIComponent(`/book?doctor=${doctor.id}`)}&doctor=${doctor.id}`
        );
        return;
      }

      setUserId(authUser.id);

      const label = consultLabel(consult);
      const doctorLabel = getDoctorName(doctor, locale);
      const periodLabel = selectedSlot
        ? t.availability[selectedSlot.labelKey]
        : undefined;
      const scheduledTime = selectedTime?.time ?? "09:00";

      const latestBooked = await getBookedTimesForDoctor(
        doctor.id,
        appointmentDate
      );
      if (latestBooked.includes(scheduledTime)) {
        setBookedTimes(latestBooked);
        setErrors({ general: t.book.errors.slotTaken });
        return;
      }

      const availabilityTime = selectedSlot
        ? formatScheduledDateTime(
            appointmentDate,
            scheduledTime,
            `${periodLabel}: ${formatAvailabilitySlot(selectedSlot)}`
          )
        : formatScheduledDateTime(appointmentDate, scheduledTime);

      const uploadKey = `${doctor.id}-${appointmentDate}-${scheduledTime.replace(":", "")}`;
      const upload = await uploadPaymentScreenshot(screenshotFile, uploadKey);
      if (!upload.ok || !upload.url) {
        setErrors({
          general: upload.error ?? t.book.errors.uploadFailed,
        });
        return;
      }

      const result = await createBookingWithPayment({
        doctor_id: doctor.id,
        patient_name: name.trim(),
        phone: phone.trim(),
        disease: disease.trim(),
        country: countryName,
        city: city.trim(),
        consult_type: label,
        consult_type_key: consult,
        user_id: authUser.id,
        availability_period: selectedSlot?.period,
        availability_time: availabilityTime,
        scheduled_date: appointmentDate,
        scheduled_time: scheduledTime,
        amount_etb: selectedPrice,
        payment_method: paymentMethod,
        screenshot_url: upload.url,
      });

      if (!result.ok) {
        setErrors({
          general: result.error ?? t.book.errors.generic,
        });
        return;
      }

      const params = new URLSearchParams({
        pending: "1",
        name: name.trim(),
        phone: phone.trim(),
        disease: disease.trim(),
        country: countryName,
        city: city.trim(),
        consult: label,
        doctor: doctorLabel,
        amount: String(selectedPrice),
        schedule: availabilityTime,
      });

      // Hard navigation so success page always loads after payment submit
      window.location.assign(`/success?${params.toString()}`);
    } catch (err) {
      console.error("BookForm submit:", err);
      setErrors({
        general:
          err instanceof Error
            ? err.message
            : t.book.errors.generic,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const consultOptions: {
    type: ConsultTypeKey;
    icon: string;
    label: string;
    price: number;
  }[] = [
    {
      type: "text",
      icon: "💬",
      label: t.book.textConsult,
      price: getConsultationPrice(pricingTier, "text"),
    },
    {
      type: "audio",
      icon: "📞",
      label: t.book.voiceCall,
      price: getConsultationPrice(pricingTier, "audio"),
    },
    {
      type: "video",
      icon: "📹",
      label: t.book.videoCall,
      price: getConsultationPrice(pricingTier, "video"),
    },
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
          <span className={styles.tierHint}>
            {getTierLabel(pricingTier, locale === "am" ? "am" : "en")}
          </span>
        </div>
      </div>

      <div className={styles.formCard}>
        {errors.general && (
          <p className={styles.error} style={{ marginBottom: "1rem" }}>
            {errors.general}
          </p>
        )}

        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>{t.book.sectionConsult}</h2>
          <p className={styles.hint}>
            {getTierLabel(pricingTier, lang)} · {t.book.pricingForDoctor}
          </p>

          <table className={styles.pricingTable}>
            <thead>
              <tr>
                <th>{t.book.consultType}</th>
                <th>{t.book.minutes}</th>
                <th>{t.book.totalDue}</th>
              </tr>
            </thead>
            <tbody>
              {tierPricing.map((row) => (
                <tr
                  key={row.type}
                  className={consult === row.type ? styles.activeRow : undefined}
                >
                  <td>{consultLabel(row.type)}</td>
                  <td>{row.duration}</td>
                  <td>{formatEtb(row.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={styles.extraRates}>{t.book.additionalTimeHint}</p>

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
                <div className={styles.coSub}>{formatEtb(opt.price)}</div>
              </div>
            ))}
          </div>
          {errors.consult && <p className={styles.error}>{errors.consult}</p>}

          {selectedPrice != null && (
            <div className={styles.priceSummary}>
              <span>{t.book.totalDue}</span>
              <strong>{formatEtb(selectedPrice)}</strong>
            </div>
          )}
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>{t.book.sectionSchedule}</h2>

          {doctorHasAnyAvailability && weeklySchedule.length > 0 && (
            <div className={styles.availabilityOverview}>
              <p className={styles.overviewTitle}>
                {t.book.doctorWeeklyAvailability}
              </p>
              <ul className={styles.scheduleList}>
                {weeklySchedule.map((entry) => (
                  <li key={entry.period} className={styles.scheduleItem}>
                    <div className={styles.schedulePeriod}>
                      <span className={styles.scheduleIcon}>🕐</span>
                      <strong>{t.availability[entry.labelKey]}</strong>
                    </div>
                    <div className={styles.scheduleMeta}>
                      <span className={styles.scheduleDays}>
                        {formatWeekdayList(entry.days, lang)}
                      </span>
                      <span className={styles.scheduleTime}>
                        {entry.timeRange}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {upcomingDates.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t.book.pickDateQuick}</label>
              <div className={styles.dateChipRow}>
                {upcomingDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    className={`${styles.dateChip} ${
                      appointmentDate === date ? styles.dateChipActive : ""
                    }`}
                    onClick={() => setAppointmentDate(date)}
                  >
                    {formatBookableDateChip(date, lang)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t.book.appointmentDate} <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.formInput}
              type="date"
              min={todayIsoDate()}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
            {appointmentDate && (
              <p className={styles.hint}>
                {t.book.selectedDay}: {formatWeekdayName(appointmentDate, lang)}
              </p>
            )}
            {errors.date && <p className={styles.error}>{errors.date}</p>}
          </div>

          {doctorHasAnyAvailability && availabilitySlots.length === 0 && (
            <p className={styles.hint}>{t.book.noAvailabilityDay}</p>
          )}

          {availabilitySlots.length > 0 && (
            <>
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

              {selectedSlot && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    {t.book.selectTime}{" "}
                    <span className={styles.req}>*</span>
                  </label>
                  {loadingSlots ? (
                    <p className={styles.hint}>{t.book.loadingSlots}</p>
                  ) : timeSlotOptions.length === 0 ? (
                    <p className={styles.hint}>{t.book.noSlots}</p>
                  ) : (
                    <div className={styles.timeGrid}>
                      {timeSlotOptions.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className={`${styles.timeChip} ${
                            selectedTime?.time === slot.time
                              ? styles.timeChipActive
                              : ""
                          }`}
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.time && <p className={styles.error}>{errors.time}</p>}
                </div>
              )}
            </>
          )}
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>{t.book.sectionDetails}</h2>
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
        </section>

        <section className={`${styles.formSection} ${styles.paymentSection}`}>
          <h2 className={styles.sectionTitle}>{t.book.sectionPayment}</h2>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t.book.paymentMethod} <span className={styles.req}>*</span>
            </label>
            <div className={styles.paymentMethods}>
              <label className={styles.paymentOption}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "telebirr"}
                  onChange={() => setPaymentMethod("telebirr")}
                />
                <span>{t.book.telebirr}</span>
              </label>
              <label className={styles.paymentOption}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cbe"}
                  onChange={() => setPaymentMethod("cbe")}
                />
                <span>{t.book.cbeBank}</span>
              </label>
            </div>
            {errors.payment && <p className={styles.error}>{errors.payment}</p>}

            {paymentMethod && (
              <div className={styles.paymentDetails}>
                <p>
                  <strong>{t.book.sendToAccount}</strong>
                </p>
                <p>{getPaymentAccountHolder()}</p>
                <p className={styles.paymentAccountLabel}>
                  {paymentMethod === "telebirr"
                    ? t.book.telebirrNumber
                    : t.book.cbeAccountNumber}
                </p>
                <code>{getPaymentAccount(paymentMethod)}</code>
                {selectedPrice != null && (
                  <p>
                    {t.book.payAmount}:{" "}
                    <strong>{formatEtb(selectedPrice)}</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              {t.book.uploadScreenshot} <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.fileInput}
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)}
            />
            {screenshotFile && (
              <p className={styles.hint}>{screenshotFile.name}</p>
            )}
            {errors.screenshot && (
              <p className={styles.error}>{errors.screenshot}</p>
            )}
          </div>

          <div className={styles.policyBox}>
            <strong>{t.book.paymentPolicy}</strong>
            <p>{t.book.paymentPolicyText}</p>
          </div>
        </section>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? t.success.loading : t.book.submitPayment}
        </button>
      </div>
    </div>
  );
}
