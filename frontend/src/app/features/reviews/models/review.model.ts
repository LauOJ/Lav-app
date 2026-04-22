export interface Review {
  id: number;
  cleanliness_rating: number;
  felt_safe: boolean | null;
  accessible: boolean | null;
  step_free_access: boolean | null;
  wide_door: boolean | null;
  turning_space: boolean | null;
  has_grab_bars: boolean | null;
  has_toilet_paper: boolean | null;
  hygiene_products_available: boolean | null;
  menstrual_cup_suitable: boolean | null;
  could_enter_without_buying: boolean | null;
  has_gender_mixed_option: boolean | null;
  has_changing_table: boolean | null;
  changing_table_location: 'mens' | 'womens' | 'mixed' | null;
  comment?: string;
  user_id: number;
  wc_id: number;
  created_at: string;
}
  