export interface WC {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  is_public: boolean;
  has_changing_table: boolean;
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
>;
  