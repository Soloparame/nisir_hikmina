import { redirect } from "next/navigation";

type Props = {
  params: { code: string };
};

/** Doctors are registered by admin — no separate signup. */
export default function DoctorSignupRedirect({ params }: Props) {
  redirect(`/doctor/${params.code}/login`);
}
