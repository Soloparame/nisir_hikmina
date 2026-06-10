"use client";

import Link from "next/link";
import { MessageCircle, Stethoscope } from "lucide-react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type { ConversationWithMeta } from "../lib/types/chat";
import ChatPanel from "./ChatPanel";
import styles from "./PatientChatView.module.css";

type Props = {
  conversations: ConversationWithMeta[];
  activeId?: string;
  viewerUserId?: string;
};

function doctorInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PatientChatView({
  conversations,
  activeId,
  viewerUserId,
}: Props) {
  const { t } = useLanguage();
  const activeConvo = conversations.find((c) => c.id === activeId);

  return (
    <div className={styles.wrap}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}>
          <MessageCircle size={28} />
        </div>
        <div>
          <h1>{t.chat.title}</h1>
          <p>{t.chat.subtitle}</p>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <span>{t.chat.conversations}</span>
            <span className={styles.count}>{conversations.length}</span>
          </div>
          {conversations.length === 0 ? (
            <div className={styles.emptySide}>
              <Stethoscope size={32} strokeWidth={1.5} />
              <p>{t.chat.noConversations}</p>
              <Link href="/book" className={styles.bookLink}>
                {t.nav.bookAppointment}
              </Link>
            </div>
          ) : (
            conversations.map((c) => (
              <Link
                key={c.id}
                href={`/chat?c=${c.id}`}
                className={`${styles.convoLink} ${
                  activeId === c.id ? styles.convoActive : ""
                }`}
              >
                <div className={styles.convoAvatar}>
                  {doctorInitials(c.doctor_name ?? "Dr")}
                </div>
                <div className={styles.convoInfo}>
                  <strong>Dr. {c.doctor_name}</strong>
                  {c.doctor_specialization && (
                    <span className={styles.specialty}>
                      {c.doctor_specialization}
                    </span>
                  )}
                  {c.last_message && (
                    <span className={styles.preview}>{c.last_message}</span>
                  )}
                </div>
                {(c.unread_count ?? 0) > 0 && (
                  <span className={styles.unread}>{c.unread_count}</span>
                )}
              </Link>
            ))
          )}
        </aside>

        <div className={styles.chatArea}>
          {activeId && activeConvo ? (
            <ChatPanel
              conversationId={activeId}
              senderRole="patient"
              viewerUserId={viewerUserId}
              title={`Dr. ${activeConvo.doctor_name}`}
              subtitle={
                activeConvo.doctor_specialization || t.chat.secureChat
              }
            />
          ) : (
            <div className={styles.placeholder}>
              <MessageCircle size={48} strokeWidth={1.25} />
              <p>{t.chat.selectConversation}</p>
              <span>{t.chat.features}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
