"use server";

import { revalidatePath } from "next/cache";
import { isAdminRole } from "../auth-roles";
import { createClient } from "../supabase/server";
import type {
  AdminUpdateEngagement,
  HealthUpdate,
  UpdateComment,
  UpdateFormData,
  UpdateReactionRow,
  UpdateReactionType,
  UpdateWithMeta,
} from "../types/update";

async function getAuthedAdminClient() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  if (!isAdminRole(user.user_metadata as Record<string, unknown>)) {
    throw new Error("Admin access required");
  }
  return supabase;
}

function localizeUpdate<T extends HealthUpdate>(
  row: T,
  locale: "am" | "en"
): T {
  if (locale !== "en") return row;
  return {
    ...row,
    title: row.title_en?.trim() || row.title,
    content: row.content_en?.trim() || row.content,
  };
}

async function attachUpdateMeta(
  rows: HealthUpdate[],
  userId?: string | null
): Promise<UpdateWithMeta[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  if (!supabase) return rows;

  const ids = rows.map((r) => r.id);
  const result: UpdateWithMeta[] = [];

  const { data: reactions } = await supabase
    .from("update_reactions")
    .select("update_id, reaction, user_id")
    .in("update_id", ids);

  const { data: comments } = await supabase
    .from("update_comments")
    .select("update_id")
    .in("update_id", ids);

  let reads: { update_id: string }[] = [];
  if (userId) {
    const { data } = await supabase
      .from("update_reads")
      .select("update_id")
      .in("update_id", ids)
      .eq("user_id", userId);
    reads = data ?? [];
  }

  for (const row of rows) {
    const rowReactions =
      reactions?.filter((r) => r.update_id === row.id) ?? [];
    const counts: Record<UpdateReactionType, number> = {
      like: 0,
      love: 0,
      insightful: 0,
    };
    for (const r of rowReactions) {
      const key = r.reaction as UpdateReactionType;
      if (key in counts) counts[key] += 1;
    }

    const userReactions = userId
      ? rowReactions
          .filter((r) => r.user_id === userId)
          .map((r) => r.reaction as UpdateReactionType)
      : [];

    result.push({
      ...row,
      reaction_counts: counts,
      comment_count: comments?.filter((c) => c.update_id === row.id).length ?? 0,
      user_reactions: userReactions,
      user_read: reads.some((r) => r.update_id === row.id),
    });
  }

  return result;
}

export async function getPublishedUpdates(
  limit?: number,
  locale: "am" | "en" = "am"
): Promise<UpdateWithMeta[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("updates")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error || !data) return [];

  const localized = (data as HealthUpdate[]).map((r) =>
    localizeUpdate(r, locale)
  );
  return attachUpdateMeta(localized, user?.id);
}

export async function getAllUpdatesAdmin(): Promise<HealthUpdate[]> {
  const supabase = await getAuthedAdminClient();
  const { data, error } = await supabase
    .from("updates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as HealthUpdate[]) ?? [];
}

export async function getAllUpdatesAdminWithMeta(): Promise<UpdateWithMeta[]> {
  const rows = await getAllUpdatesAdmin();
  return attachUpdateMeta(rows);
}

async function enrichComments(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  rows: { id: string; update_id: string; user_id: string; content: string; created_at: string }[]
): Promise<UpdateComment[]> {
  const enriched: UpdateComment[] = [];
  for (const c of rows) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", c.user_id)
      .maybeSingle();
    enriched.push({
      ...c,
      author_name: profile?.full_name || "User",
    });
  }
  return enriched;
}

export async function getUpdateEngagementAdmin(
  updateId: string
): Promise<AdminUpdateEngagement> {
  const supabase = await getAuthedAdminClient();

  const { data: reactionRows, error: reactionError } = await supabase
    .from("update_reactions")
    .select("user_id, reaction, created_at")
    .eq("update_id", updateId)
    .order("created_at", { ascending: false });

  if (reactionError) throw new Error(reactionError.message);

  const reactions: UpdateReactionRow[] = [];
  for (const r of reactionRows ?? []) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", r.user_id)
      .maybeSingle();
    reactions.push({
      user_id: r.user_id,
      reaction: r.reaction as UpdateReactionType,
      author_name: profile?.full_name || "User",
      created_at: r.created_at,
    });
  }

  const { data: commentRows, error: commentError } = await supabase
    .from("update_comments")
    .select("*")
    .eq("update_id", updateId)
    .order("created_at", { ascending: true });

  if (commentError) throw new Error(commentError.message);

  const comments = await enrichComments(supabase, commentRows ?? []);

  return { reactions, comments };
}

export async function saveUpdate(
  form: UpdateFormData,
  id?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await getAuthedAdminClient();
    const payload = {
      title: form.title.trim(),
      title_en: form.title_en?.trim() || null,
      content: form.content.trim(),
      content_en: form.content_en?.trim() || null,
      image_url: form.image_url?.trim() || null,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await supabase
        .from("updates")
        .update(payload)
        .eq("id", id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("updates").insert(payload);
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/whats-new");
    revalidatePath("/admin/updates");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save",
    };
  }
}

export async function deleteUpdate(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await getAuthedAdminClient();
    const { error } = await supabase.from("updates").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/whats-new");
    revalidatePath("/admin/updates");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete",
    };
  }
}

export async function incrementUpdateView(updateId: string) {
  const supabase = await createClient();
  if (!supabase) return;
  await supabase.rpc("increment_update_views", { p_update_id: updateId });
}

export async function markUpdateRead(
  updateId: string
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  await supabase.from("update_reads").upsert(
    {
      update_id: updateId,
      user_id: user.id,
      read_at: new Date().toISOString(),
    },
    { onConflict: "update_id,user_id" }
  );

  return { ok: true };
}

export async function toggleUpdateReaction(
  updateId: string,
  reaction: UpdateReactionType
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Not configured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to react" };

  const { data: existingSame } = await supabase
    .from("update_reactions")
    .select("reaction")
    .eq("update_id", updateId)
    .eq("user_id", user.id)
    .eq("reaction", reaction)
    .maybeSingle();

  if (existingSame) {
    const { error } = await supabase
      .from("update_reactions")
      .delete()
      .eq("update_id", updateId)
      .eq("user_id", user.id)
      .eq("reaction", reaction);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("update_reactions").insert({
      update_id: updateId,
      user_id: user.id,
      reaction,
    });

    if (error) {
      if (error.code === "23505") {
        const { data: legacyRow } = await supabase
          .from("update_reactions")
          .select("reaction")
          .eq("update_id", updateId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (legacyRow?.reaction === reaction) {
          return { ok: true };
        }

        if (legacyRow) {
          const { error: updateError } = await supabase
            .from("update_reactions")
            .update({ reaction })
            .eq("update_id", updateId)
            .eq("user_id", user.id);
          if (updateError) {
            return {
              ok: false,
              error:
                "Run migration-v11-independent-reactions.sql in Supabase to allow multiple reaction types per user.",
            };
          }
          return { ok: true };
        }
      }

      return { ok: false, error: error.message };
    }
  }

  revalidatePath("/whats-new");
  return { ok: true };
}

export async function getUpdateComments(
  updateId: string
): Promise<UpdateComment[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("update_comments")
    .select("*")
    .eq("update_id", updateId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  return enrichComments(supabase, data);
}

export async function addUpdateComment(
  updateId: string,
  content: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Not configured" };

  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Comment cannot be empty" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Please sign in to comment" };

  const { error } = await supabase.from("update_comments").insert({
    update_id: updateId,
    user_id: user.id,
    content: trimmed,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/whats-new");
  return { ok: true };
}
