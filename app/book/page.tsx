import BookFlow from "../../components/BookFlow";
import { getActiveDoctors } from "../../lib/actions/doctors";

export default async function BookPage() {
  const doctors = await getActiveDoctors();
  return <BookFlow initialDoctors={doctors} />;
}
