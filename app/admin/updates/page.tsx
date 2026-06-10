import { redirect } from "next/navigation";
import AdminShell from "../../../components/AdminShell";
import AdminUpdatesPanel from "../../../components/AdminUpdatesPanel";
import { getAllUpdatesAdminWithMeta } from "../../../lib/actions/updates";
import type { UpdateWithMeta } from "../../../lib/types/update";
import { createClient } from "../../../lib/supabase/server";

export default async function AdminUpdatesPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  let updates: UpdateWithMeta[] = [];
  let loadError: string | null = null;
  try {
    updates = await getAllUpdatesAdminWithMeta();
  } catch (e) {
    loadError =
      e instanceof Error ? e.message : "Could not load updates. Run migration-v10.";
  }

  return (
    <AdminShell>
      <AdminUpdatesPanel initialUpdates={updates} loadError={loadError} />
    </AdminShell>
  );
}
