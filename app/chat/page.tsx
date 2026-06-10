import { redirect } from "next/navigation";
import Navbar from "../../components/Navbar";
import PatientChatView from "../../components/PatientChatView";
import SiteFooter from "../../components/SiteFooter";
import { getPatientConversations } from "../../lib/actions/chat";
import { isPatientUser } from "../../lib/auth/session";
import { createClient } from "../../lib/supabase/server";
import styles from "./chat.module.css";

type Props = {
  searchParams: { c?: string };
};

export default async function ChatPage({ searchParams }: Props) {
  const supabase = await createClient();
  if (!supabase) redirect("/login?redirect=/chat");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isPatientUser(user)) redirect("/login?redirect=/chat");

  const conversations = await getPatientConversations();
  const activeId = searchParams.c || conversations[0]?.id;

  return (
    <div className={styles.shell}>
      <Navbar />
      <PatientChatView
        conversations={conversations}
        activeId={activeId}
        viewerUserId={user.id}
      />
      <SiteFooter />
    </div>
  );
}
