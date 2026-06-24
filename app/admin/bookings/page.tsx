import { redirect } from "next/navigation";
import AdminBookingsPanel from "../../../components/AdminBookingsPanel";
import AdminShell from "../../../components/AdminShell";
import { getAdminBookings } from "../../../lib/actions/bookings";
import type { BookingWithPayment } from "../../../lib/types/payment";
import { createClient } from "../../../lib/supabase/server";

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  if (!supabase) {
    redirect("/admin/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  let bookings: BookingWithPayment[] = [];
  let loadError: string | null = null;
  try {
    bookings = await getAdminBookings();
  } catch (e) {
    loadError =
      e instanceof Error ? e.message : "Could not load bookings from database.";
  }

  return (
    <AdminShell>
      <AdminBookingsPanel initialBookings={bookings} loadError={loadError} />
    </AdminShell>
  );
}
