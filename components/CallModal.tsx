"use client";

import { X } from "lucide-react";
import { getJitsiRoomId } from "../lib/types/chat";
import styles from "./CallModal.module.css";

type Props = {
  conversationId: string;
  mode: "audio" | "video";
  title: string;
  onClose: () => void;
};

export default function CallModal({
  conversationId,
  mode,
  title,
  onClose,
}: Props) {
  const room = getJitsiRoomId(conversationId);
  const startVideoMuted = mode === "audio" ? "true" : "false";
  const startAudioMuted = "false";

  const src = `https://meet.jit.si/${room}#config.startWithVideoMuted=${startVideoMuted}&config.startWithAudioMuted=${startAudioMuted}&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","hangup","fullscreen"]`;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.header}>
          <div>
            <h3>{mode === "video" ? "Video call" : "Audio call"}</h3>
            <p>{title}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <iframe
          title={`${mode} call with ${title}`}
          src={src}
          allow="camera; microphone; fullscreen; display-capture"
          className={styles.frame}
        />
      </div>
    </div>
  );
}
