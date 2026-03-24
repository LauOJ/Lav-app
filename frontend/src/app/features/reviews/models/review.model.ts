export interface Review {
  id: number;
  cleanliness_rating: number;
  felt_safe: boolean;
  accessible: boolean;
  has_toilet_paper: boolean;
  hygiene_products_available: boolean;
  could_enter_without_buying: boolean | null;
  has_gender_mixed_option: boolean;
  comment?: string;
  user_id: number;
  wc_id: number;
  created_at: string;
}
  