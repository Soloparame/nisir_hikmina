"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Save } from "lucide-react";
import { updateDoctorOwnProfile } from "../lib/actions/doctors";
import {
  DEFAULT_WEEKDAYS,
  WEEKDAY_OPTIONS,
  type WeekdayKey,
} from "../lib/availability-days";
import {
  DOCTOR_CATEGORIES,
  getSubcategoriesForCategoryLabel,
} from "../lib/doctor-categories";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { createClient } from "../lib/supabase/client";
import type { Doctor, DoctorSelfProfileData } from "../lib/types/doctor";
import styles from "./DoctorProfileForm.module.css";

type Props = {
  loginCode: string;
  doctor: Doctor;
  embedded?: boolean;
};

function toggleWeekday(days: string[], day: WeekdayKey): string[] {
  return days.includes(day)
    ? days.filter((d) => d !== day)
    : [...days, day];
}

function AvailabilityDaysPicker({
  days,
  onChange,
}: {
  days: string[];
  onChange: (days: string[]) => void;
}) {
  return (
    <div className={styles.dayPicker}>
      <span className={styles.dayPickerLabel}>Days</span>
      <div className={styles.dayPickerRow}>
        {WEEKDAY_OPTIONS.map(({ key, label }) => (
          <label key={key} className={styles.dayChip}>
            <input
              type="checkbox"
              checked={days.includes(key)}
              onChange={() => onChange(toggleWeekday(days, key))}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

function doctorToForm(d: Doctor): DoctorSelfProfileData {
  const detectedSubcategory = d.specialization_en ?? d.specialization;
  return {
    name: d.name,
    name_en: d.name_en ?? "",
    category: d.category ?? DOCTOR_CATEGORIES[0]?.label ?? "",
    specialization: detectedSubcategory,
    specialization_en: d.specialization_en ?? detectedSubcategory,
    bio: d.bio ?? "",
    bio_en: d.bio_en ?? "",
    image_url: d.image_url ?? "",
    experience_years: d.experience_years ?? 0,
    languages: d.languages?.length ? [...d.languages] : ["አማርኛ"],
    morning_start: d.morning_start?.slice(0, 5) ?? "",
    morning_end: d.morning_end?.slice(0, 5) ?? "",
    afternoon_start: d.afternoon_start?.slice(0, 5) ?? "",
    afternoon_end: d.afternoon_end?.slice(0, 5) ?? "",
    evening_start: d.evening_start?.slice(0, 5) ?? "",
    evening_end: d.evening_end?.slice(0, 5) ?? "",
    morning_days: d.morning_days?.length
      ? [...d.morning_days]
      : [...DEFAULT_WEEKDAYS],
    afternoon_days: d.afternoon_days?.length
      ? [...d.afternoon_days]
      : [...DEFAULT_WEEKDAYS],
    evening_days: d.evening_days?.length
      ? [...d.evening_days]
      : [...DEFAULT_WEEKDAYS],
  };
}

export default function DoctorProfileForm({
  loginCode,
  doctor,
  embedded = true,
}: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [form, setForm] = useState<DoctorSelfProfileData>(() =>
    doctorToForm(doctor)
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(doctorToForm(doctor));
  }, [doctor]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    if (!supabase) {
      setError(t.doctorAuth.profileSaveFailed);
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${loginCode.toLowerCase()}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("doctor-images")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("doctor-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const result = await updateDoctorOwnProfile(loginCode, form);
    setSaving(false);

    if (!result.ok) {
      setError(result.error || t.doctorAuth.profileSaveFailed);
      return;
    }

    setMessage(t.doctorAuth.profileSaved);
    router.refresh();
  }

  const displayName =
    form.name_en?.trim() || form.name.trim() || doctor.name;

  return (
    <form
      className={`${styles.form} ${embedded ? "" : styles.formStandalone}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.readOnlyBar}>
        <div>
          <span>{t.doctorAuth.profileId}</span>
          <strong>{loginCode.toUpperCase()}</strong>
        </div>
        <div>
          <span>{t.doctorAuth.profileEmail}</span>
          <strong>{doctor.email ?? "—"}</strong>
        </div>
        <div>
          <span>{t.doctorAuth.profileStatus}</span>
          <strong>
            {doctor.is_active
              ? t.doctorAuth.profileActive
              : t.doctorAuth.profileInactive}
          </strong>
        </div>
      </div>

      <p className={styles.hint}>{t.doctorAuth.profileEditHint}</p>

      <div className={styles.photoSection}>
        <div className={styles.photoRow}>
          <div className={styles.photoPreview}>
          {form.image_url ? (
            <Image
              src={form.image_url}
              alt={displayName}
              width={96}
              height={96}
              className={styles.photoImg}
              unoptimized
            />
          ) : (
            <span>{displayName.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className={styles.photoActions}>
          <label className={styles.uploadBtn}>
            <Camera size={16} />
            {uploading
              ? t.doctorAuth.profileUploading
              : t.doctorAuth.profileUploadPhoto}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || saving}
              hidden
            />
          </label>
          {form.image_url && (
            <button
              type="button"
              className={styles.clearPhoto}
              onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
              disabled={saving}
            >
              {t.doctorAuth.profileRemovePhoto}
            </button>
          )}
        </div>
      </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{t.doctorAuth.profileName}</h3>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>{t.doctorAuth.profileNameAm} *</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label className={styles.field}>
          <span>{t.doctorAuth.profileNameEn}</span>
          <input
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          />
        </label>
      </div>

      <div className={styles.grid}>
        <label className={styles.field}>
          <span>{t.doctorAuth.profileCategory}</span>
          <select
            value={form.category}
            onChange={(e) => {
              const nextCategory = e.target.value;
              const subcategories =
                getSubcategoriesForCategoryLabel(nextCategory);
              const nextSubcategory = subcategories[0] ?? "";
              setForm({
                ...form,
                category: nextCategory,
                specialization: nextSubcategory,
                specialization_en: nextSubcategory,
              });
            }}
          >
            {DOCTOR_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.label}>
                {cat.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>{t.doctorAuth.profileSpecialty}</span>
          <select
            value={form.specialization}
            onChange={(e) => {
              const nextSub = e.target.value;
              setForm({
                ...form,
                specialization: nextSub,
                specialization_en: nextSub,
              });
            }}
          >
            {(() => {
              const subs = getSubcategoriesForCategoryLabel(form.category);
              const options = subs.includes(form.specialization)
                ? subs
                : [...subs, form.specialization].filter(Boolean);
              return options.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ));
            })()}
          </select>
        </label>
      </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>{t.doctorAuth.profileBio}</h3>
      <label className={styles.field}>
        <span>{t.doctorAuth.profileBioAm}</span>
        <textarea
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
        />
      </label>

      <label className={styles.field}>
        <span>{t.doctorAuth.profileBioEn}</span>
        <textarea
          value={form.bio_en}
          onChange={(e) => setForm({ ...form, bio_en: e.target.value })}
          rows={3}
        />
      </label>
      </div>

      <div className={styles.formSection}>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span>{t.doctorAuth.profileExperience}</span>
          <input
            type="number"
            min={0}
            value={form.experience_years}
            onChange={(e) =>
              setForm({
                ...form,
                experience_years: Number(e.target.value) || 0,
              })
            }
          />
        </label>
        <label className={styles.field}>
          <span>{t.doctorAuth.profileLanguages}</span>
          <input
            value={form.languages.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                languages: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="አማርኛ, English"
          />
        </label>
      </div>
      </div>

      <div className={styles.formSection}>
      <h3 className={styles.sectionTitle}>
        {t.doctorAuth.profileAvailability}
      </h3>

      <div className={styles.availabilityGrid}>
      <fieldset className={styles.availabilityFieldset}>
        <legend>{t.doctorAuth.profileMorning}</legend>
        <AvailabilityDaysPicker
          days={form.morning_days ?? DEFAULT_WEEKDAYS}
          onChange={(morning_days) => setForm({ ...form, morning_days })}
        />
        <div className={styles.timeRow}>
          <input
            type="time"
            value={form.morning_start}
            onChange={(e) =>
              setForm({ ...form, morning_start: e.target.value })
            }
          />
          <span>to</span>
          <input
            type="time"
            value={form.morning_end}
            onChange={(e) => setForm({ ...form, morning_end: e.target.value })}
          />
        </div>
      </fieldset>

      <fieldset className={styles.availabilityFieldset}>
        <legend>{t.doctorAuth.profileAfternoon}</legend>
        <AvailabilityDaysPicker
          days={form.afternoon_days ?? DEFAULT_WEEKDAYS}
          onChange={(afternoon_days) => setForm({ ...form, afternoon_days })}
        />
        <div className={styles.timeRow}>
          <input
            type="time"
            value={form.afternoon_start}
            onChange={(e) =>
              setForm({ ...form, afternoon_start: e.target.value })
            }
          />
          <span>to</span>
          <input
            type="time"
            value={form.afternoon_end}
            onChange={(e) =>
              setForm({ ...form, afternoon_end: e.target.value })
            }
          />
        </div>
      </fieldset>

      <fieldset className={styles.availabilityFieldset}>
        <legend>{t.doctorAuth.profileEvening}</legend>
        <AvailabilityDaysPicker
          days={form.evening_days ?? DEFAULT_WEEKDAYS}
          onChange={(evening_days) => setForm({ ...form, evening_days })}
        />
        <div className={styles.timeRow}>
          <input
            type="time"
            value={form.evening_start}
            onChange={(e) =>
              setForm({ ...form, evening_start: e.target.value })
            }
          />
          <span>to</span>
          <input
            type="time"
            value={form.evening_end}
            onChange={(e) => setForm({ ...form, evening_end: e.target.value })}
          />
        </div>
      </fieldset>
      </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}

      <div className={styles.formFooter}>
      <button
        type="submit"
        className={styles.saveBtn}
        disabled={saving || uploading}
      >
        <Save size={18} />
        {saving ? t.doctorAuth.profileSaving : t.doctorAuth.profileSave}
      </button>
      </div>
    </form>
  );
}
