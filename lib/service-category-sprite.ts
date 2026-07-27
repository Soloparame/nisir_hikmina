/** Sprite helper (legacy). Home services use Lucide icons via SERVICE_CATEGORY_ICONS. */
export const SERVICE_CATEGORY_SPRITE = {
  src: "/images/service-categories-sprite.png",
  alt: "Medical specialty categories",
  columns: 7,
  rows: 3,
} as const;

export function getServiceCategorySpritePosition(index: number) {
  const col = index % SERVICE_CATEGORY_SPRITE.columns;
  const row = Math.floor(index / SERVICE_CATEGORY_SPRITE.columns);
  const x =
    SERVICE_CATEGORY_SPRITE.columns > 1
      ? (col / (SERVICE_CATEGORY_SPRITE.columns - 1)) * 100
      : 0;
  const y =
    SERVICE_CATEGORY_SPRITE.rows > 1
      ? (row / (SERVICE_CATEGORY_SPRITE.rows - 1)) * 100
      : 0;

  return {
    backgroundSize: `${SERVICE_CATEGORY_SPRITE.columns * 100}% ${SERVICE_CATEGORY_SPRITE.rows * 100}%`,
    backgroundPosition: `${x}% ${y}%`,
  };
}
