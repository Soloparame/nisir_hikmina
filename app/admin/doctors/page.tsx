import { redirect } from "next/navigation";
import type { Doctor } from "../../../lib/types/doctor";
import AdminDoctorsPanel from "../../../components/AdminDoctorsPanel";
import { getAllDoctorsAdmin } from "../../../lib/actions/doctors";
import { createClient } from "../../../lib/supabase/server";

export default async function AdminDoctorsPage() {
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

  let doctors: Doctor[] = [];
  try {
    doctors = await getAllDoctorsAdmin();
  } catch {
    doctors = [];
  }

  return <AdminDoctorsPanel initialDoctors={doctors} />;
}
