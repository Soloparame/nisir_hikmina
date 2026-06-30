import {
  getServiceCategorySpritePosition,
  SERVICE_CATEGORY_SPRITE,
} from "../lib/service-category-sprite";
import styles from "./ServiceCategoryIcon.module.css";

type Props = {
  index: number;
  label: string;
};

export default function ServiceCategoryIcon({ index, label }: Props) {
  const { backgroundSize, backgroundPosition } =
    getServiceCategorySpritePosition(index);

  return (
    <div
      className={styles.icon}
      style={{
        backgroundImage: `url(${SERVICE_CATEGORY_SPRITE.src})`,
        backgroundSize,
        backgroundPosition,
      }}
      role="img"
      aria-label={label}
    />
  );
}
