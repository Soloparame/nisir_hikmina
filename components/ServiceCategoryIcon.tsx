import { SERVICE_CATEGORY_ICONS } from "../lib/service-category-icons";
import styles from "./ServiceCategoryIcon.module.css";

type Props = {
  categoryKey: string;
  label: string;
};

export default function ServiceCategoryIcon({ categoryKey, label }: Props) {
  const icon = SERVICE_CATEGORY_ICONS[categoryKey];

  if (!icon) {
    return <div className={styles.fallback} aria-label={label} role="img" />;
  }

  return (
    <div className={styles.iconShell} style={{ backgroundColor: icon.bg }}>
      <img className={styles.icon} src={icon.src} alt={icon.alt} loading="lazy" />
    </div>
  );
}
