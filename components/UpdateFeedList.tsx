"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addUpdateComment,
  getUpdateComments,
  markUpdateRead,
  toggleUpdateReaction,
} from "../lib/actions/updates";
import { playReactionSound } from "../lib/reaction-sound";
import { recordUpdateView } from "../lib/update-views";
import { createClient } from "../lib/supabase/client";
import { isPatientUser } from "../lib/auth/session";
import { useLanguage } from "../lib/i18n/LanguageContext";
import { localizeUpdates } from "../lib/update-display";
import type {
  UpdateComment,
  UpdateReactionType,
  UpdateWithMeta,
} from "../lib/types/update";
import UpdateCard from "./UpdateCard";
import styles from "./WhatsNewFeed.module.css";

type Props = {
  updates: UpdateWithMeta[];
  limit?: number;
  showSignInHint?: boolean;
  loginRedirect?: string;
  className?: string;
};

export default function UpdateFeedList({
  updates: initial,
  limit,
  showSignInHint = true,
  loginRedirect = "/whats-new",
  className,
}: Props) {
  const { t, locale } = useLanguage();
  const [updates, setUpdates] = useState(() => localizeUpdates(initial, locale));
  const [loggedIn, setLoggedIn] = useState(false);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, UpdateComment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const readMarkedRef = useRef<Set<string>>(new Set());

  const visible = limit ? updates.slice(0, limit) : updates;

  useEffect(() => {
    setUpdates(localizeUpdates(initial, locale));
  }, [initial, locale]);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(isPatientUser(data.user));
    });
  }, []);

  useEffect(() => {
    const items = limit ? initial.slice(0, limit) : initial;
    for (const u of items) {
      recordUpdateView(u.id);
    }
  }, [initial, limit]);

  useEffect(() => {
    if (!loggedIn) return;
    const items = limit ? initial.slice(0, limit) : initial;
    for (const u of items) {
      if (readMarkedRef.current.has(u.id)) continue;
      readMarkedRef.current.add(u.id);
      void markUpdateRead(u.id);
    }
  }, [initial, limit, loggedIn]);

  async function handleReaction(updateId: string, reaction: UpdateReactionType) {
    if (!loggedIn) {
      setError(t.whatsNew.signInToInteract);
      return;
    }
    setError("");
    const target = updates.find((u) => u.id === updateId);
    const wasActive = target?.user_reactions?.includes(reaction) ?? false;

    const result = await toggleUpdateReaction(updateId, reaction);
    if (!result.ok) {
      setError(result.error ?? t.whatsNew.reactFailed);
      return;
    }

    playReactionSound(reaction, !wasActive);

    setUpdates((list) =>
      list.map((u) => {
        if (u.id !== updateId) return u;
        const counts = {
          like: u.reaction_counts?.like ?? 0,
          love: u.reaction_counts?.love ?? 0,
          insightful: u.reaction_counts?.insightful ?? 0,
        };
        const userReactions = u.user_reactions ?? [];

        if (wasActive) {
          counts[reaction] = Math.max(0, counts[reaction] - 1);
          return {
            ...u,
            user_reactions: userReactions.filter((r) => r !== reaction),
            reaction_counts: counts,
          };
        }

        const nextReactions = userReactions.includes(reaction)
          ? userReactions
          : [...userReactions, reaction];

        if (!userReactions.includes(reaction)) {
          counts[reaction] += 1;
        }

        return {
          ...u,
          user_reactions: nextReactions,
          reaction_counts: counts,
        };
      })
    );
  }

  async function loadComments(updateId: string) {
    if (openComments === updateId) {
      setOpenComments(null);
      return;
    }
    setOpenComments(updateId);
    const data = await getUpdateComments(updateId);
    setComments((c) => ({ ...c, [updateId]: data }));
  }

  async function submitComment(updateId: string) {
    const text = commentText[updateId]?.trim();
    if (!text) return;
    if (!loggedIn) {
      setError(t.whatsNew.signInToInteract);
      return;
    }
    const result = await addUpdateComment(updateId, text);
    if (!result.ok) {
      setError(result.error ?? t.whatsNew.commentFailed);
      return;
    }
    setCommentText((c) => ({ ...c, [updateId]: "" }));
    const data = await getUpdateComments(updateId);
    setComments((c) => ({ ...c, [updateId]: data }));
    setUpdates((list) =>
      list.map((u) =>
        u.id === updateId
          ? { ...u, comment_count: (u.comment_count ?? 0) + 1 }
          : u
      )
    );
  }

  if (visible.length === 0) {
    return <p className={styles.empty}>{t.whatsNew.empty}</p>;
  }

  return (
    <div className={className ?? styles.feed}>
      {error && <p className={styles.error}>{error}</p>}
      {showSignInHint && !loggedIn && (
        <p className={styles.hint}>
          <Link href={`/login?redirect=${loginRedirect}`}>
            {t.whatsNew.signInHint}
          </Link>
        </p>
      )}

      {visible.map((u) => (
        <UpdateCard
          key={u.id}
          update={u}
          loggedIn={loggedIn}
          openComments={openComments === u.id}
          comments={comments[u.id] ?? []}
          commentText={commentText[u.id] ?? ""}
          loginRedirect={loginRedirect}
          onReaction={(reaction) => handleReaction(u.id, reaction)}
          onToggleComments={() => loadComments(u.id)}
          onCommentTextChange={(text) =>
            setCommentText((ct) => ({ ...ct, [u.id]: text }))
          }
          onSubmitComment={() => submitComment(u.id)}
        />
      ))}
    </div>
  );
}
