import Navbar from "../../components/Navbar";
import DoctorsDirectory from "../../components/DoctorsDirectory";
import SiteFooter from "../../components/SiteFooter";
import { getActiveDoctors } from "../../lib/actions/doctors";

type Props = {
  searchParams: { category?: string };
};

export default async function DoctorsPage({ searchParams }: Props) {
  const doctors = await getActiveDoctors();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar />
      <DoctorsDirectory
        doctors={doctors}
        initialCategoryKey={searchParams.category}
      />
      <SiteFooter />
    </div>
  );
}
