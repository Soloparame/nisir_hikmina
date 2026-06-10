"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CheckCircle2,
  LogOut,
  MessageCircle,
  Phone,
  Users,
} from "lucide-react";
import { signOutUser } from "../lib/actions/auth";
import type { ConversationWithMeta } from "../lib/types/chat";
import type { Appointment } from "../lib/types/doctor";
import ChatPanel from "./ChatPanel";
import styles from "./DoctorDashboardPanel.module.css";

type Props = {
  loginCode: string;
  doctorName: string;
  appointments: Appointment[];
  conversations: ConversationWithMeta[];
  initialChatId?: string | null;
};

type Tab = "bookings" | "messages";

function patientInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function statusClass(status: string) {
  if (status === "confirmed") return styles.statusConfirmed;
  if (status === "pending") return styles.statusPending;
  return styles.statusDefault;
}

export default function DoctorDashboardPanel({
  loginCode,
  doctorName,
  appointments,
  conversations,
  initialChatId,
}: Props) {
  const router = useRouter();
  const [activeChat, setActiveChat] = useState<string | null>(
    initialChatId ?? conversations[0]?.id ?? null
  );
  const [tab, setTab] = useState<Tab>(initialChatId ? "messages" : "bookings");

  const confirmedCount = appointments.filter(
    (a) => a.status === "confirmed"
  ).length;
  const patientCount = useMemo(
    () => new Set(appointments.map((a) => a.patient_name)).size,
    [appointments]
  );
  const unreadTotal = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
    [conversations]
  );
  const activeConvo = conversations.find((c) => c.id === activeChat);

  const convoByPatientId = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of conversations) {
      map.set(c.patient_id, c.id);
    }
    return map;
  }, [conversations]);

  function openChatForAppointment(a: Appointment) {
    const convoId = a.user_id ? convoByPatientId.get(a.user_id) : undefined;
    if (convoId) {
      setActiveChat(convoId);
      setTab("messages");
    }
  }

  async function handleSignOut() {
    await signOutUser();
    router.push(`/doctor/${loginCode}/login`);
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.heroAvatar}>
            {doctorName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className={styles.heroEyebrow}>Doctor portal</p>
            <h1>{doctorName}</h1>
            <p className={styles.heroId}>ID · {loginCode.toUpperCase()}</p>
          </div>
        </div>
        <button type="button" onClick={handleSignOut} className={styles.signOut}>
          <LogOut size={16} />
          Sign out
        </button>
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className={styles.statValue}>{confirmedCount}</span>
            <span className={styles.statLabel}>Confirmed bookings</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconTeal}`}>
            <Users size={20} />
          </div>
          <div>
            <span className={styles.statValue}>{patientCount}</span>
            <span className={styles.statLabel}>Patients</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
            <MessageCircle size={20} />
          </div>
          <div>
            <span className={styles.statValue}>{unreadTotal}</span>
            <span className={styles.statLabel}>Unread messages</span>
          </div>
        </div>
      </div>

      <nav className={styles.mainTabs}>
        <button
          type="button"
          className={tab === "bookings" ? styles.mainTabActive : styles.mainTab}
          onClick={() => setTab("bookings")}
        >
          <Calendar size={18} />
          Bookings
          <span className={styles.tabCount}>{appointments.length}</span>
        </button>
        <button
          type="button"
          className={tab === "messages" ? styles.mainTabActive : styles.mainTab}
          onClick={() => setTab("messages")}
        >
          <MessageCircle size={18} />
          Messages
          <span className={styles.tabCount}>{conversations.length}</span>
          {unreadTotal > 0 && (
            <span className={styles.tabBadge}>{unreadTotal}</span>
          )}
        </button>
      </nav>

      {tab === "bookings" ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Patient bookings</h2>
            <p>All completed appointment requests from patients</p>
          </div>
          <div className={styles.appointments}>
            {appointments.length === 0 ? (
              <p className={styles.empty}>No bookings yet.</p>
            ) : (
              appointments.map((a) => {
                const hasChat = Boolean(
                  a.user_id && convoByPatientId.has(a.user_id)
                );
                return (
                  <article key={a.id} className={styles.appointmentCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.patientRow}>
                        <div className={styles.patientAvatar}>
                          {patientInitials(a.patient_name)}
                        </div>
                        <div>
                          <strong>{a.patient_name}</strong>
                          <p className={styles.condition}>{a.disease}</p>
                        </div>
                      </div>
                      <span className={`${styles.badge} ${statusClass(a.status)}`}>
                        {a.status}
                      </span>
                    </div>
                    <div className={styles.cardMeta}>
                      <span>
                        <Phone size={14} /> {a.phone}
                      </span>
                      <span>✈️ {a.telegram}</span>
                    </div>
                    <p className={styles.meta}>
                      {a.country} / {a.city} · {a.consult_type}
                    </p>
                    {a.availability_time && (
                      <p className={styles.slot}>🕐 {a.availability_time}</p>
                    )}
                    <p className={styles.date}>
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                    {hasChat && (
                      <button
                        type="button"
                        className={styles.chatBtn}
                        onClick={() => openChatForAppointment(a)}
                      >
                        <MessageCircle size={16} />
                        Open messages
                      </button>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      ) : (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>Messages</h2>
            <p>Chat with your patients — text, photos, audio & video calls</p>
          </div>
          <div className={styles.messagesOnly}>
            <aside className={styles.convoList}>
              {conversations.length === 0 ? (
                <p className={styles.empty}>No conversations yet.</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.convoItem} ${
                      activeChat === c.id ? styles.convoActive : ""
                    }`}
                    onClick={() => setActiveChat(c.id)}
                  >
                    <div className={styles.convoAvatar}>
                      {patientInitials(c.patient_name ?? "P")}
                    </div>
                    <div className={styles.convoBody}>
                      <strong>{c.patient_name}</strong>
                      {c.last_message && (
                        <span className={styles.preview}>{c.last_message}</span>
                      )}
                    </div>
                    {(c.unread_count ?? 0) > 0 && (
                      <span className={styles.unread}>{c.unread_count}</span>
                    )}
                  </button>
                ))
              )}
            </aside>
            <div className={styles.chatArea}>
              {activeChat && activeConvo ? (
                <ChatPanel
                  conversationId={activeChat}
                  senderRole="doctor"
                  title={activeConvo.patient_name}
                  subtitle="Your patient"
                />
              ) : (
                <div className={styles.chatPlaceholder}>
                  <MessageCircle size={40} strokeWidth={1.5} />
                  <p>Select a patient conversation</p>
                  <span>Or open messages from a booking card</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
