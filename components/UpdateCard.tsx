"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Eye,
  Heart,
  Lightbulb,
  MessageCircle,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { useLanguage } from "../lib/i18n/LanguageContext";
import type {
  UpdateComment,
  UpdateReactionType,
  UpdateWithMeta,
} from "../lib/types/update";
import styles from "./WhatsNewFeed.module.css";

const REACTION_ACTIVE: Record<UpdateReactionType, string> = {
  like: styles.reactActiveLike,
  love: styles.reactActiveLove,
  insightful: styles.reactActiveInsight,
};

const REACTIONS: {
  type: UpdateReactionType;
  icon: typeof ThumbsUp;
  label: string;
}[] = [
  { type: "like", icon: ThumbsUp, label: "Like" },
  { type: "love", icon: Heart, label: "Love" },
  { type: "insightful", icon: Lightbulb, label: "Insightful" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Props = {
  update: UpdateWithMeta;
  loggedIn: boolean;
  openComments: boolean;
  comments: UpdateComment[];
  commentText: string;
  loginRedirect?: string;
  onReaction: (reaction: UpdateReactionType) => void;
  onToggleComments: () => void;
  onCommentTextChange: (text: string) => void;
  onSubmitComment: () => void;
};

export default function UpdateCard({
  update: u,
  loggedIn,
  openComments,
  comments,
  commentText,
  loginRedirect = "/whats-new",
  onReaction,
  onToggleComments,
  onCommentTextChange,
  onSubmitComment,
}: Props) {
  const { t } = useLanguage();

  return (
    <article className={styles.card}>
      <div className={styles.cardLayout}>
        <div className={styles.media}>
          {u.image_url ? (
            <>
              <Image
                src={u.image_url}
                alt=""
                fill
                className={styles.image}
                sizes="(max-width: 768px) 100vw, 360px"
              />
              <div className={styles.imageOverlay} />
            </>
          ) : (
            <div className={styles.imagePlaceholder}>
              <Sparkles size={40} strokeWidth={1.5} />
            </div>
          )}
          <span className={styles.badge}>
            <Sparkles size={11} />
            {t.home.updateBadge}
          </span>
        </div>

        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <Calendar size={14} />
              {formatDate(u.created_at)}
            </span>
            <span className={styles.metaItem}>
              <Eye size={14} />
              {u.view_count} {t.whatsNew.views}
            </span>
            {u.user_read && loggedIn && (
              <span className={styles.readBadge}>{t.whatsNew.read}</span>
            )}
          </div>

          <h2>{u.title}</h2>
          <p className={styles.content}>{u.content}</p>

          <div className={styles.reactions}>
            {REACTIONS.map(({ type, icon: Icon, label }) => {
              const active = u.user_reactions?.includes(type) ?? false;
              return (
                <button
                  key={type}
                  type="button"
                  className={`${styles.reactBtn} ${
                    active ? REACTION_ACTIVE[type] : ""
                  } ${active ? styles.reactPop : ""}`}
                  onClick={() => onReaction(type)}
                  title={label}
                  aria-pressed={active}
                >
                  <Icon size={16} />
                  <span>{u.reaction_counts?.[type] ?? 0}</span>
                </button>
              );
            })}
            <button
              type="button"
              className={`${styles.commentToggle} ${
                openComments ? styles.commentOpen : ""
              }`}
              onClick={onToggleComments}
            >
              <MessageCircle size={16} />
              {u.comment_count ?? 0}
            </button>
          </div>
        </div>
      </div>

      {openComments && (
        <div className={styles.commentsPanel}>
          <div className={styles.commentsHeader}>
            <MessageCircle size={18} />
            <span>{t.whatsNew.commentsTitle}</span>
          </div>
          <div className={styles.comments}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>{t.whatsNew.noComments}</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className={styles.comment}>
                  <div className={styles.commentAvatar}>
                    {(c.author_name ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className={styles.commentBody}>
                    <strong>{c.author_name}</strong>
                    <p>{c.content}</p>
                    <time>{new Date(c.created_at).toLocaleString()}</time>
                  </div>
                </div>
              ))
            )}
            {loggedIn ? (
              <div className={styles.commentForm}>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => onCommentTextChange(e.target.value)}
                  placeholder={t.whatsNew.commentPlaceholder}
                />
                <button type="button" onClick={onSubmitComment}>
                  {t.whatsNew.postComment}
                </button>
              </div>
            ) : (
              <p className={styles.signInComment}>
                <Link href={`/login?redirect=${loginRedirect}`}>
                  {t.whatsNew.signInToComment}
                </Link>
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
