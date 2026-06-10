import Navbar from "../../components/Navbar";
import SiteFooter from "../../components/SiteFooter";
import WhatsNewPageContent from "../../components/WhatsNewPageContent";
import { getPublishedUpdates } from "../../lib/actions/updates";
import styles from "./whats-new.module.css";

export default async function WhatsNewPage() {
  const updates = await getPublishedUpdates();

  return (
    <div className={styles.shell}>
      <Navbar />
      <WhatsNewPageContent updates={updates} />
      <SiteFooter />
    </div>
  );
}
