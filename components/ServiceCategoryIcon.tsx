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

  const { Icon, alt, bg, color } = icon;

  return (
    <div
      className={styles.iconShell}
      style={{ backgroundColor: bg }}
      role="img"
      aria-label={alt}
    >
      <Icon className={styles.icon} color={color} strokeWidth={2} aria-hidden />
    </div>
  );
}
