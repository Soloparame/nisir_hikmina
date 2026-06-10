"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  title?: string;
  subtitle?: string;
};

export default function ChatPanel({
  conversationId,
  senderRole,
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    setSendError(null);

    const result = await sendMessageClient(conversationId, text, "text");
    if (result.ok) {
      setText("");
      await loadMessages();
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
    const mine = msg.sender_role === senderRole;
    const time = new Date(msg.created_at).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (msg.message_type === "image" && msg.attachment_url) {
      return (
        <div
          key={msg.id}
          className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}
        >
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
        </div>
      );
    }

    if (
      msg.message_type === "call_video" ||
      msg.message_type === "call_audio"
    ) {
      const mode = msg.message_type === "call_video" ? "video" : "audio";
      return (
        <div
          key={msg.id}
          className={`${styles.bubble} ${styles.callBubble} ${
            mine ? styles.bubbleMine : styles.bubbleTheirs
          }`}
        >
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
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}
      >
        <p>{msg.content}</p>
        <time>{time}</time>
      </div>
    );
  }

  return (
    <>
      <div className={styles.panel}>
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

        <div className={styles.messages}>
          {loading && messages.length === 0 ? (
            <p className={styles.empty}>{t.chat.loading}</p>
          ) : messages.length === 0 ? (
            <p className={styles.empty}>{t.chat.empty}</p>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={bottomRef} />
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
