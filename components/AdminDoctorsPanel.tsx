"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { deleteDoctor, saveDoctor } from "../lib/actions/doctors";
import { createClient } from "../lib/supabase/client";
import {
  DEFAULT_WEEKDAYS,
  WEEKDAY_OPTIONS,
  type WeekdayKey,
} from "../lib/availability-days";
import {
  DOCTOR_CATEGORIES,
  getSubcategoriesForCategoryLabel,
} from "../lib/doctor-categories";
import type { Doctor, DoctorFormData } from "../lib/types/doctor";
import styles from "./AdminDoctorsPanel.module.css";

type Props = {
  initialDoctors: Doctor[];
  loadError?: string | null;
};

const emptyForm: DoctorFormData = {
  name: "",
  name_en: "",
  category: DOCTOR_CATEGORIES[0]?.label ?? "General Practitioners & Residents",
  specialization:
    DOCTOR_CATEGORIES[0]?.subcategories[0] ?? "General Practitioner (GP)",
  specialization_en:
    DOCTOR_CATEGORIES[0]?.subcategories[0] ?? "General Practitioner (GP)",
  bio: "",
  bio_en: "",
  image_url: "",
  experience_years: 0,
  languages: ["አማርኛ"],
  is_active: true,
  sort_order: 0,
  email: "",
  pricing_tier: "gp",
  morning_start: "",
  morning_end: "",
  afternoon_start: "",
  afternoon_end: "",
  evening_start: "",
  evening_end: "",
  morning_days: [...DEFAULT_WEEKDAYS],
  afternoon_days: [...DEFAULT_WEEKDAYS],
  evening_days: [...DEFAULT_WEEKDAYS],
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

export default function AdminDoctorsPanel({
  initialDoctors,
  loadError,
}: Props) {
  const router = useRouter();
  const [doctors, setDoctors] = useState(initialDoctors);
  const [form, setForm] = useState<DoctorFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  function loadDoctor(d: Doctor) {
    setEditingId(d.id);
    const detectedSubcategory = d.specialization_en ?? d.specialization;
    setForm({
      name: d.name,
      name_en: d.name_en ?? "",
      category: d.category ?? emptyForm.category,
      specialization: detectedSubcategory,
      specialization_en: d.specialization_en ?? detectedSubcategory,
      bio: d.bio ?? "",
      bio_en: d.bio_en ?? "",
      image_url: d.image_url ?? "",
      experience_years: d.experience_years,
      languages: d.languages ?? ["አማርኛ"],
      is_active: d.is_active,
      sort_order: d.sort_order,
      email: d.email ?? "",
      pricing_tier: d.pricing_tier ?? "gp",
      morning_start: d.morning_start?.slice(0, 5) ?? "",
      morning_end: d.morning_end?.slice(0, 5) ?? "",
      afternoon_start: d.afternoon_start?.slice(0, 5) ?? "",
      afternoon_end: d.afternoon_end?.slice(0, 5) ?? "",
      evening_start: d.evening_start?.slice(0, 5) ?? "",
      evening_end: d.evening_end?.slice(0, 5) ?? "",
      morning_days: d.morning_days?.length ? [...d.morning_days] : [...DEFAULT_WEEKDAYS],
      afternoon_days: d.afternoon_days?.length ? [...d.afternoon_days] : [...DEFAULT_WEEKDAYS],
      evening_days: d.evening_days?.length ? [...d.evening_days] : [...DEFAULT_WEEKDAYS],
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured");
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const result = await saveDoctor(form, editingId ?? undefined);
    if (!result.ok) {
      setError(result.error ?? "Save failed");
      setSaving(false);
      return;
    }

    if (result.login_code) {
      setMessage(
        `Doctor added. ID: ${result.login_code} — they sign in at /doctor/${result.login_code}/login using their registered email + this ID (first visit: they set a password).`
      );
    } else {
      setMessage(editingId ? "Doctor updated" : "Doctor added");
    }
    resetForm();
    router.refresh();
    setSaving(false);

    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this doctor?")) return;
    const result = await deleteDoctor(id);
    if (!result.ok) {
      setError(result.error ?? "Delete failed");
      return;
    }
    setDoctors((list) => list.filter((d) => d.id !== id));
    if (editingId === id) resetForm();
    router.refresh();
  }

  return (
    <div className={styles.panelRoot}>
      <header className={styles.panelHead}>
        <div>
          <h1>Doctors</h1>
          <p>Register and manage doctor profiles</p>
        </div>
      </header>

      <div className={styles.grid}>
        <form className={styles.formCard} onSubmit={handleSave}>
          <h2>{editingId ? "ዶክተር አርም" : "አዲስ ዶክተር"}</h2>

          <label>ስም (አማርኛ) *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <label>ስም (English)</label>
          <input
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          />

          <label>Category</label>
          <select
            value={form.category}
            onChange={(e) => {
              const nextCategory = e.target.value;
              const subcategories = getSubcategoriesForCategoryLabel(
                nextCategory
              );
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

          <label>Subcategory (Specialization)</label>
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

          <label>ስለ ዶክተሩ (አማርኛ)</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
          />

          <label>Bio (English)</label>
          <textarea
            value={form.bio_en}
            onChange={(e) => setForm({ ...form, bio_en: e.target.value })}
            rows={3}
          />

          <label>Doctor Email (not shown to patients) *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="doctor@example.com"
            required={!editingId}
          />

          <fieldset className={styles.availabilityFieldset}>
            <legend>Availability — Morning</legend>
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
                onChange={(e) =>
                  setForm({ ...form, morning_end: e.target.value })
                }
              />
            </div>
          </fieldset>

          <fieldset className={styles.availabilityFieldset}>
            <legend>Availability — After Lunch</legend>
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
            <legend>Availability — Evening</legend>
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
                onChange={(e) =>
                  setForm({ ...form, evening_end: e.target.value })
                }
              />
            </div>
          </fieldset>

          <label>Pricing tier (consultation fees)</label>
          <select
            value={form.pricing_tier ?? "gp"}
            onChange={(e) =>
              setForm({
                ...form,
                pricing_tier: e.target.value as DoctorFormData["pricing_tier"],
              })
            }
          >
            <option value="gp">General Practitioner (GP)</option>
            <option value="resident">Resident Physician</option>
            <option value="specialist">Specialist Doctor</option>
            <option value="senior">Subspecialist / Consultant</option>
          </select>

          <label>የስራ ዓመታት</label>
          <input
            type="number"
            min={0}
            value={form.experience_years}
            onChange={(e) =>
              setForm({ ...form, experience_years: Number(e.target.value) })
            }
          />

          <label>ቋንቋዎች (comma separated)</label>
          <input
            value={form.languages.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                languages: e.target.value.split(",").map((s) => s.trim()),
              })
            }
          />

          <label>የዶክተር ፎቶ</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p className={styles.hint}>Uploading...</p>}
          {form.image_url && (
            <Image
              src={form.image_url}
              alt="Preview"
              width={80}
              height={80}
              className={styles.preview}
            />
          )}

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
            />
            Active (visible to patients)
          </label>

          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formActions}>
            {editingId && (
              <button type="button" className={styles.secondary} onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className={styles.primary} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Add Doctor"}
            </button>
          </div>
        </form>

        <div className={styles.listCard}>
          <h2>Registered Doctors ({doctors.length})</h2>
          {loadError && (
            <p className={styles.error} role="alert">
              {loadError}
              <br />
              <small>
                Run <code>migration-v9-fix-doctors-rls-recursion.sql</code> in
                Supabase SQL Editor if you see infinite recursion.
              </small>
            </p>
          )}
          {doctors.length === 0 && !loadError ? (
            <p className={styles.empty}>No doctors yet. Add your first doctor.</p>
          ) : doctors.length === 0 ? null : (
            <ul className={styles.list}>
              {doctors.map((d) => (
                <li key={d.id} className={styles.listItem}>
                  {d.image_url ? (
                    <Image
                      src={d.image_url}
                      alt={d.name}
                      width={48}
                      height={48}
                      className={styles.thumb}
                    />
                  ) : (
                    <div className={styles.thumbFallback}>👨‍⚕️</div>
                  )}
                  <div className={styles.listInfo}>
                    <strong>{d.name}</strong>
                    <span>
                      {d.category ? `${d.category} — ` : ""}
                      {d.specialization}
                    </span>
                    {!d.is_active && (
                      <span className={styles.inactive}>Inactive</span>
                    )}
                    {d.login_code && (
                      <span className={styles.doctorId}>
                        ID: {d.login_code} · /doctor/{d.login_code}/login
                      </span>
                    )}
                  </div>
                  <div className={styles.listActions}>
                    <button type="button" onClick={() => loadDoctor(d)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.danger}
                      onClick={() => handleDelete(d.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
