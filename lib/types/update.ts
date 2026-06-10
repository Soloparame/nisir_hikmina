export type UpdateReactionType = "like" | "love" | "insightful";

export type HealthUpdate = {
  id: string;
  title: string;
  title_en: string | null;
  content: string;
  content_en: string | null;
  image_url: string | null;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type UpdateFormData = {
  title: string;
  title_en?: string;
  content: string;
  content_en?: string;
  image_url?: string;
  is_published: boolean;
};

export type UpdateComment = {
  id: string;
  update_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
};

export type UpdateWithMeta = HealthUpdate & {
  reaction_counts?: Record<UpdateReactionType, number>;
  comment_count?: number;
  user_reactions?: UpdateReactionType[];
  user_read?: boolean;
};

export type UpdateReactionRow = {
  user_id: string;
  reaction: UpdateReactionType;
  author_name: string;
  created_at: string;
};

export type AdminUpdateEngagement = {
  reactions: UpdateReactionRow[];
  comments: UpdateComment[];
};
