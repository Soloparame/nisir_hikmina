import { incrementUpdateView } from "./actions/updates";

const STORAGE_PREFIX = "nisir-viewed-update-";

/** Count at most one view per update per browser tab session. */
export function recordUpdateView(updateId: string) {
  if (typeof window === "undefined") return;

  const key = `${STORAGE_PREFIX}${updateId}`;
  if (sessionStorage.getItem(key)) return;

  sessionStorage.setItem(key, "1");
  void incrementUpdateView(updateId);
}
