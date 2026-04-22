export interface WC {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  is_public: boolean;
  description: string | null;
  created_at: string;
  avg_cleanliness: number | null;
  reviews_count: number;
  safety_score: number | null;
  accessibility_score: number | null;
  toilet_paper_score: number | null;
  hygiene_products_score: number | null;
  free_entry_score: number | null;
  gender_mixed_score: number | null;
  changing_table_score: number | null;
  step_free_score: number | null;
  wide_door_score: number | null;
  turning_space_score: number | null;
  grab_bars_score: number | null;
  menstrual_cup_score: number | null;
}

export type WCCreate = Omit<
  WC,
  | 'id'
  | 'created_at'
  | 'avg_cleanliness'
  | 'reviews_count'
  | 'safety_score'
  | 'accessibility_score'
  | 'toilet_paper_score'
  | 'hygiene_products_score'
  | 'free_entry_score'
  | 'gender_mixed_score'
  | 'changing_table_score'
  | 'step_free_score'
  | 'wide_door_score'
  | 'turning_space_score'
  | 'grab_bars_score'
  | 'menstrual_cup_score'
>;
  