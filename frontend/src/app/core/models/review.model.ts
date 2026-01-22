export interface Review {
  id: number;
  user_id: number;
  wc_id: number;
  cleanliness_rating: number;
  safety_rating: number;
  comment?: string;
  created_at: string;
}

export interface ReviewCreate {
  wc_id: number;
  cleanliness_rating: number;
  safety_rating: number;
  comment?: string;
}
