"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ImagePlus, Phone, Send, Video } from "lucide-react";
import { getMessagesClient, sendMessageClient } from "../lib/chat/messaging";
import { createClient } from "../lib/supabase/client";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type { Message, MessageType } from "../lib/types/chat";
import CallModal from "./CallModal";
import styles from "./ChatPanel.module.css";

type Props = {
  conversationId: string;
  senderRole: "patient" | "doctor";
  viewerUserId?: string;
  title?: string;
  subtitle?: string;
};

export default function ChatPanel({
  conversationId,
  senderRole,
  viewerUserId: viewerUserIdProp,
  title,
  subtitle,
}: Props) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [callMode, setCallMode] = useState<"audio" | "video" | null>(null);
  const [viewerUserId, setViewerUserId] = useState<string | undefined>(
    viewerUserIdProp
  );
  const messagesRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setViewerUserId(viewerUserIdProp);
  }, [viewerUserIdProp]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) setViewerUserId(data.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) setViewerUserId(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const loadMessages = useCallback(async () => {
    const data = await getMessagesClient(conversationId);
    setMessages(data);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    setLoading(true);
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    if (messages.length === 0 && loading) return;
    scrollToBottom(loading ? "auto" : "smooth");
  }, [messages, loading, scrollToBottom]);

  function isOutgoing(msg: Message): boolean {
    if (viewerUserId && msg.sender_id) {
      return String(msg.sender_id) === String(viewerUserId);
    }
    return msg.sender_role === senderRole;
  }

  function senderLabel(msg: Message): string {
    return msg.sender_role === "doctor"
      ? t.chat.doctorLabel
      : t.chat.patientLabel;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    setSendError(null);

    const result = await sendMessageClient(conversationId, text, "text");
    if (result.ok) {
      setText("");
      await loadMessages();
      scrollToBottom("smooth");
    } else {
      setSendError(result.error ?? t.chat.sendFailed);
    }

    setSending(false);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    setUploading(true);
    setSendError(null);

    const supabase = createClient();
    if (!supabase) {
      setSendError(t.chat.uploadNotConfigured);
      setUploading(false);
      return;
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${conversationId}/${Date.now()}.${ext}`;

    const { error: storageError } = await supabase.storage
      .from("chat-images")
      .upload(path, file, {
        upsert: true,
        contentType: file.type || "image/jpeg",
      });

    if (storageError) {
      setSendError(storageError.message);
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const { data } = supabase.storage.from("chat-images").getPublicUrl(path);
    const sent = await sendMessageClient(
      conversationId,
      t.chat.photoSent,
      "image",
      data.publicUrl
    );

    if (!sent.ok) {
      setSendError(sent.error ?? t.chat.uploadFailed);
    } else {
      await loadMessages();
      scrollToBottom("smooth");
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function startCall(mode: "audio" | "video") {
    setSendError(null);
    const label =
      mode === "video" ? t.chat.videoCallStarted : t.chat.audioCallStarted;
    const result = await sendMessageClient(
      conversationId,
      label,
      mode === "video" ? "call_video" : "call_audio"
    );

    if (!result.ok) {
      setSendError(result.error ?? t.chat.sendFailed);
      return;
    }

    await loadMessages();
    setCallMode(mode);
  }

  function renderMessage(msg: Message) {
    const outgoing = isOutgoing(msg);
    const side = outgoing ? "out" : "in";

    const time = new Date(msg.created_at).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let inner: ReactNode;

    if (msg.message_type === "image" && msg.attachment_url) {
      inner = (
        <>
          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={msg.attachment_url}
              alt="Shared"
              className={styles.chatImage}
              loading="lazy"
            />
          </a>
          <time>{time}</time>
        </>
      );
    } else if (
      msg.message_type === "call_video" ||
      msg.message_type === "call_audio"
    ) {
      const mode = msg.message_type === "call_video" ? "video" : "audio";
      inner = (
        <>
          <p>{msg.content}</p>
          <button
            type="button"
            className={styles.joinCallBtn}
            onClick={() => setCallMode(mode)}
          >
            {mode === "video" ? <Video size={16} /> : <Phone size={16} />}
            {t.chat.joinCall}
          </button>
          <time>{time}</time>
        </>
      );
    } else {
      inner = (
        <>
          <p>{msg.content}</p>
          <time>{time}</time>
        </>
      );
    }

    return (
      <div
        key={msg.id}
        className={`${styles.messageRow} ${
          outgoing ? styles.rowOut : styles.rowIn
        }`}
      >
        <div
          className={`${styles.messageCol} ${
            outgoing ? styles.colOut : styles.colIn
          }`}
        >
          {!outgoing && (
            <span className={styles.senderLabel}>{senderLabel(msg)}</span>
          )}
          <div
            className={`${styles.bubble} ${
              msg.message_type === "call_video" || msg.message_type === "call_audio"
                ? styles.callBubble
                : ""
            }`}
            data-side={side}
          >
            {inner}
          </div>
          {outgoing && (
            <span className={styles.youTag}>{t.chat.youLabel}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.panel} dir="ltr">
        <header className={styles.chatHeader}>
          <div className={styles.chatHeaderInfo}>
            <div className={styles.chatAvatar}>
              {(title ?? "?").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3>{title}</h3>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <div className={styles.callActions}>
            <button
              type="button"
              className={styles.callBtn}
              onClick={() => startCall("audio")}
              title={t.chat.audioCall}
            >
              <Phone size={18} />
            </button>
            <button
              type="button"
              className={styles.callBtn}
              onClick={() => startCall("video")}
              title={t.chat.videoCall}
            >
              <Video size={18} />
            </button>
          </div>
        </header>

        <div className={styles.messages} ref={messagesRef}>
          {loading && messages.length === 0 ? (
            <p className={styles.empty}>{t.chat.loading}</p>
          ) : messages.length === 0 ? (
            <p className={styles.empty}>{t.chat.empty}</p>
          ) : (
            messages.map(renderMessage)
          )}
        </div>

        {sendError && (
          <p className={styles.uploadError} role="alert">
            {sendError}
          </p>
        )}

        <form className={styles.compose} onSubmit={handleSend}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.hiddenFile}
            onChange={handleImageUpload}
          />
          <button
            type="button"
            className={styles.attachBtn}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title={t.chat.sendPhoto}
          >
            <ImagePlus size={20} />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (sendError) setSendError(null);
            }}
            placeholder={t.chat.placeholder}
            disabled={sending}
            className={styles.textInput}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={sending || !text.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {callMode && (
        <CallModal
          conversationId={conversationId}
          mode={callMode}
          title={title ?? ""}
          onClose={() => setCallMode(null)}
        />
      )}
    </>
  );
}
