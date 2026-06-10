"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Eye,
  Heart,
  Lightbulb,
  MessageCircle,
  Sparkles,
  ThumbsUp,
  Users,
} from "lucide-react";
import {
  deleteUpdate,
  getUpdateEngagementAdmin,
  saveUpdate,
} from "../lib/actions/updates";
import type {
  AdminUpdateEngagement,
  UpdateFormData,
  UpdateReactionType,
  UpdateWithMeta,
} from "../lib/types/update";
import styles from "./AdminUpdatesPanel.module.css";

type Props = {
  initialUpdates: UpdateWithMeta[];
  loadError?: string | null;
};

const REACTION_META: Record<
  UpdateReactionType,
  { label: string; icon: typeof ThumbsUp; tone: string }
> = {
  like: { label: "Likes", icon: ThumbsUp, tone: styles.toneLike },
  love: { label: "Hearts", icon: Heart, tone: styles.toneLove },
  insightful: {
    label: "Insightful",
    icon: Lightbulb,
    tone: styles.toneInsight,
  },
};

const emptyForm: UpdateFormData = {
  title: "",
  title_en: "",
  content: "",
  content_en: "",
  image_url: "",
  is_published: true,
};

export default function AdminUpdatesPanel({
  initialUpdates,
  loadError,
}: Props) {
  const router = useRouter();
  const [updates, setUpdates] = useState(initialUpdates);
  const [form, setForm] = useState<UpdateFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [engagementId, setEngagementId] = useState<string | null>(null);
  const [engagement, setEngagement] = useState<AdminUpdateEngagement | null>(
    null
  );
  const [engagementLoading, setEngagementLoading] = useState(false);

  useEffect(() => {
    setUpdates(initialUpdates);
  }, [initialUpdates]);

  const totals = useMemo(() => {
    let views = 0;
    let likes = 0;
    let loves = 0;
    let insightful = 0;
    let comments = 0;

    for (const u of updates) {
      views += u.view_count ?? 0;
      likes += u.reaction_counts?.like ?? 0;
      loves += u.reaction_counts?.love ?? 0;
      insightful += u.reaction_counts?.insightful ?? 0;
      comments += u.comment_count ?? 0;
    }

    return {
      views,
      reactions: likes + loves + insightful,
      likes,
      loves,
      insightful,
      comments,
    };
  }, [updates]);

  function loadUpdate(u: UpdateWithMeta) {
    setEditingId(u.id);
    setForm({
      title: u.title,
      title_en: u.title_en ?? "",
      content: u.content,
      content_en: u.content_en ?? "",
      image_url: u.image_url ?? "",
      is_published: u.is_published,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function toggleEngagement(id: string) {
    if (engagementId === id) {
      setEngagementId(null);
      setEngagement(null);
      return;
    }

    setEngagementId(id);
    setEngagement(null);
    setEngagementLoading(true);
    setError("");

    try {
      const data = await getUpdateEngagementAdmin(id);
      setEngagement(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load reactions and comments"
      );
      setEngagementId(null);
    } finally {
      setEngagementLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const result = await saveUpdate(form, editingId ?? undefined);
    if (!result.ok) {
      setError(result.error ?? "Failed to save");
      setSaving(false);
      return;
    }

    setMessage(editingId ? "Update saved" : "Update published");
    resetForm();
    router.refresh();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this update?")) return;
    const result = await deleteUpdate(id);
    if (!result.ok) {
      setError(result.error ?? "Failed to delete");
      return;
    }
    setUpdates((list) => list.filter((u) => u.id !== id));
    if (editingId === id) resetForm();
    if (engagementId === id) {
      setEngagementId(null);
      setEngagement(null);
    }
    router.refresh();
  }

  function groupedReactions(data: AdminUpdateEngagement) {
    const groups: Record<UpdateReactionType, typeof data.reactions> = {
      like: [],
      love: [],
      insightful: [],
    };
    for (const r of data.reactions) {
      groups[r.reaction].push(r);
    }
    return groups;
  }

  return (
    <div className={styles.panelRoot}>
      <header className={styles.panelHead}>
        <div>
          <span className={styles.panelEyebrow}>
            <Sparkles size={14} />
            Community pulse
          </span>
          <h1>Daily Updates</h1>
          <p>Publish news and track how patients react and comment</p>
        </div>
      </header>

      {loadError && <p className={styles.error}>{loadError}</p>}
      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <Eye size={20} />
          <div>
            <strong>{totals.views}</strong>
            <span>Total views</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <Users size={20} />
          <div>
            <strong>{totals.reactions}</strong>
            <span>All reactions</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <MessageCircle size={20} />
          <div>
            <strong>{totals.comments}</strong>
            <span>Comments</span>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <BarChart3 size={20} />
          <div>
            <strong>{updates.length}</strong>
            <span>Posts</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <form className={styles.formCard} onSubmit={handleSave}>
          <h2>{editingId ? "Edit update" : "New update"}</h2>

          <label>Title (Amharic) *</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <label>Title (English)</label>
          <input
            value={form.title_en}
            onChange={(e) => setForm({ ...form, title_en: e.target.value })}
          />

          <label>Content (Amharic) *</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={6}
            required
          />

          <label>Content (English)</label>
          <textarea
            value={form.content_en}
            onChange={(e) => setForm({ ...form, content_en: e.target.value })}
            rows={6}
          />

          <label>Image URL (optional)</label>
          <input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://..."
          />

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) =>
                setForm({ ...form, is_published: e.target.checked })
              }
            />
            Published (visible on home & What&apos;s New)
          </label>

          <div className={styles.formActions}>
            {editingId && (
              <button type="button" className={styles.secondary} onClick={resetForm}>
                Cancel
              </button>
            )}
            <button type="submit" className={styles.primary} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Publish"}
            </button>
          </div>
        </form>

        <div className={styles.feedColumn}>
          <div className={styles.feedHead}>
            <h2>Published feed</h2>
            <span>{updates.length} updates</span>
          </div>

          {updates.length === 0 ? (
            <p className={styles.empty}>No updates yet. Create your first post.</p>
          ) : (
            <div className={styles.updateCards}>
              {updates.map((u) => {
                const totalReactions =
                  (u.reaction_counts?.like ?? 0) +
                  (u.reaction_counts?.love ?? 0) +
                  (u.reaction_counts?.insightful ?? 0);

                return (
                  <article
                    key={u.id}
                    className={`${styles.updateCard} ${
                      engagementId === u.id ? styles.updateCardOpen : ""
                    }`}
                  >
                    <div className={styles.updateCardTop}>
                      {u.image_url ? (
                        <div className={styles.thumb}>
                          <Image
                            src={u.image_url}
                            alt=""
                            fill
                            className={styles.thumbImg}
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className={styles.thumbFallback}>
                          <Sparkles size={22} />
                        </div>
                      )}

                      <div className={styles.updateMain}>
                        <div className={styles.updateTitleRow}>
                          <h3>{u.title}</h3>
                          <span
                            className={`${styles.statusBadge} ${
                              u.is_published ? styles.published : styles.draft
                            }`}
                          >
                            {u.is_published ? "Live" : "Draft"}
                          </span>
                        </div>
                        <p className={styles.excerpt}>
                          {u.content.slice(0, 140)}
                          {u.content.length > 140 ? "…" : ""}
                        </p>
                        <div className={styles.updateMeta}>
                          <span>{new Date(u.created_at).toLocaleDateString()}</span>
                          <span>
                            <Eye size={13} /> {u.view_count} views
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.statGrid}>
                      {(Object.keys(REACTION_META) as UpdateReactionType[]).map(
                        (type) => {
                          const meta = REACTION_META[type];
                          const Icon = meta.icon;
                          return (
                            <div
                              key={type}
                              className={`${styles.statTile} ${meta.tone}`}
                            >
                              <Icon size={16} />
                              <strong>{u.reaction_counts?.[type] ?? 0}</strong>
                              <span>{meta.label}</span>
                            </div>
                          );
                        }
                      )}
                      <div className={`${styles.statTile} ${styles.toneComment}`}>
                        <MessageCircle size={16} />
                        <strong>{u.comment_count ?? 0}</strong>
                        <span>Comments</span>
                      </div>
                    </div>

                    <div className={styles.updateActions}>
                      <button
                        type="button"
                        className={`${styles.engagementBtn} ${
                          engagementId === u.id ? styles.engagementBtnActive : ""
                        }`}
                        onClick={() => toggleEngagement(u.id)}
                      >
                        <BarChart3 size={16} />
                        {engagementId === u.id
                          ? "Hide engagement"
                          : `View engagement (${totalReactions + (u.comment_count ?? 0)})`}
                      </button>
                      <button type="button" onClick={() => loadUpdate(u)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.danger}
                        onClick={() => handleDelete(u.id)}
                      >
                        Delete
                      </button>
                    </div>

                    {engagementId === u.id && (
                      <div className={styles.engagementPanel}>
                        {engagementLoading ? (
                          <p className={styles.engagementLoading}>
                            Loading live reactions and comments…
                          </p>
                        ) : engagement ? (
                          <div className={styles.engagementGrid}>
                            <div className={styles.engagementCol}>
                              <h4>
                                <ThumbsUp size={16} />
                                Reactions ({engagement.reactions.length})
                              </h4>
                              {engagement.reactions.length === 0 ? (
                                <p className={styles.engagementEmpty}>
                                  No reactions yet — share your post to get engagement.
                                </p>
                              ) : (
                                (Object.keys(REACTION_META) as UpdateReactionType[]).map(
                                  (type) => {
                                    const group = groupedReactions(engagement)[type];
                                    if (group.length === 0) return null;
                                    const meta = REACTION_META[type];
                                    const Icon = meta.icon;
                                    return (
                                      <div
                                        key={type}
                                        className={`${styles.reactionGroup} ${meta.tone}`}
                                      >
                                        <div className={styles.reactionGroupHead}>
                                          <Icon size={15} />
                                          <span>{meta.label}</span>
                                          <strong>{group.length}</strong>
                                        </div>
                                        <ul className={styles.reactionPeople}>
                                          {group.map((r) => (
                                            <li
                                              key={`${r.user_id}-${r.reaction}-${r.created_at}`}
                                            >
                                              <span className={styles.personAvatar}>
                                                {(r.author_name ?? "U")
                                                  .slice(0, 1)
                                                  .toUpperCase()}
                                              </span>
                                              <div>
                                                <strong>{r.author_name}</strong>
                                                <time>
                                                  {new Date(
                                                    r.created_at
                                                  ).toLocaleString()}
                                                </time>
                                              </div>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  }
                                )
                              )}
                            </div>

                            <div className={styles.engagementCol}>
                              <h4>
                                <MessageCircle size={16} />
                                Comments ({engagement.comments.length})
                              </h4>
                              {engagement.comments.length === 0 ? (
                                <p className={styles.engagementEmpty}>
                                  No comments yet — patients can join the conversation on What&apos;s New.
                                </p>
                              ) : (
                                <ul className={styles.commentFeed}>
                                  {engagement.comments.map((c) => (
                                    <li key={c.id} className={styles.commentBubble}>
                                      <span className={styles.personAvatar}>
                                        {(c.author_name ?? "U")
                                          .slice(0, 1)
                                          .toUpperCase()}
                                      </span>
                                      <div>
                                        <div className={styles.commentHead}>
                                          <strong>{c.author_name}</strong>
                                          <time>
                                            {new Date(c.created_at).toLocaleString()}
                                          </time>
                                        </div>
                                        <p>{c.content}</p>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
