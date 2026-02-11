export interface Review {
  id: number;
  cleanliness_rating: number;
  safety_rating: number;
  comment?: string;
  is_safe_space?: boolean | null;
  safe_space_comment?: string | null;
  user_id: number;
  wc_id: number;
  created_at: string;
}
  