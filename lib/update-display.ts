import type { Locale } from "./i18n/translations";
import type { HealthUpdate, UpdateWithMeta } from "./types/update";

export function localizeUpdate<T extends HealthUpdate>(
  update: T,
  locale: Locale
): T {
  if (locale !== "en") return update;
  return {
    ...update,
    title: update.title_en?.trim() || update.title,
    content: update.content_en?.trim() || update.content,
  };
}

export function localizeUpdates(
  updates: UpdateWithMeta[],
  locale: Locale
): UpdateWithMeta[] {
  return updates.map((u) => localizeUpdate(u, locale));
}
