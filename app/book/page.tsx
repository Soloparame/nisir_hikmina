import BookFlow from "../../components/BookFlow";
import { getActiveDoctors } from "../../lib/actions/doctors";

type Props = {
  searchParams: { doctor?: string };
};

export default async function BookPage({ searchParams }: Props) {
  const doctors = await getActiveDoctors();
  return (
    <BookFlow
      initialDoctors={doctors}
      initialDoctorId={searchParams.doctor}
    />
  );
}
