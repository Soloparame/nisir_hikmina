"use client";

import { useLanguage } from "../lib/i18n/LanguageContext";
import styles from "../app/auth.module.css";

type Props = {
  /** When set, shows a required acknowledgment checkbox. */
  accepted?: boolean;
  onAcceptedChange?: (accepted: boolean) => void;
  requireAccept?: boolean;
};

export default function PatientTerms({
  accepted = false,
  onAcceptedChange,
  requireAccept = false,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className={styles.termsBox}>
      <h3 className={styles.termsTitle}>{t.auth.patientTermsTitle}</h3>
      <ul className={styles.termsList}>
        <li>
          <strong>{t.auth.patientTermsAccountTitle}</strong>
          {" — "}
          {t.auth.patientTermsAccountBody}
        </li>
        <li>
          <strong>{t.auth.patientTermsAppointmentsTitle}</strong>
          {" — "}
          {t.auth.patientTermsAppointmentsBody}
        </li>
        <li>
          <strong>{t.auth.patientTermsUsageTitle}</strong>
          {" — "}
          {t.auth.patientTermsUsageBody}
        </li>
      </ul>

      {requireAccept && onAcceptedChange && (
        <label className={styles.termsCheck}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => onAcceptedChange(e.target.checked)}
            required
          />
          <span>{t.auth.patientTermsAgree}</span>
        </label>
      )}
    </div>
  );
}
