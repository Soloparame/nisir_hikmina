import Navbar from "../../components/Navbar";
import DoctorsDirectory from "../../components/DoctorsDirectory";
import SiteFooter from "../../components/SiteFooter";
import { getActiveDoctors } from "../../lib/actions/doctors";

export default async function DoctorsPage() {
  const doctors = await getActiveDoctors();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
      <Navbar />
      <DoctorsDirectory doctors={doctors} />
      <SiteFooter />
    </div>
  );
}
