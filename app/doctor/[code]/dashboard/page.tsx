import { redirect } from "next/navigation";
import DoctorDashboardPanel from "../../../../components/DoctorDashboardPanel";
import {
  getDoctorAppointments,
  getDoctorConversations,
} from "../../../../lib/actions/chat";
import { createClient } from "../../../../lib/supabase/server";

type Props = {
  params: { code: string };
  searchParams: { chat?: string };
};

export default async function DoctorDashboardPage({
  params,
  searchParams,
}: Props) {
  const code = params.code.toUpperCase();
  const supabase = await createClient();

  if (!supabase) {
    redirect(`/doctor/${params.code}/login`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/doctor/${params.code}/login`);
  }

  const { data: doctor } = await supabase
    .from("doctors")
    .select("id, name, name_en, login_code, auth_user_id")
    .eq("login_code", code)
    .maybeSingle();

  if (!doctor || doctor.auth_user_id !== user.id) {
    redirect(`/doctor/${params.code}/login`);
  }

  const [appointments, conversations] = await Promise.all([
    getDoctorAppointments(doctor.id),
    getDoctorConversations(doctor.id),
  ]);

  return (
    <DoctorDashboardPanel
      loginCode={doctor.login_code ?? code}
      doctorName={doctor.name_en || doctor.name}
      appointments={appointments}
      conversations={conversations}
      initialChatId={searchParams.chat ?? null}
    />
  );
}
