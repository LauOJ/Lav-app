export interface Review {
  id: number;
  cleanliness_rating: number;
  felt_safe: boolean | null;
  accessible: boolean | null;
  has_toilet_paper: boolean | null;
  hygiene_products_available: boolean | null;
  could_enter_without_buying: boolean | null;
  has_gender_mixed_option: boolean | null;
  has_changing_table: boolean | null;
  comment?: string;
  user_id: number;
  wc_id: number;
  created_at: string;
}
  