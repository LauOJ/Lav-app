export interface WC {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
  
    accessible: boolean;
    gender_neutral: boolean;
    has_changing_table: boolean;
    only_for_customers: boolean;
    has_intimate_hygiene_products: boolean;
  
    description: string | null;
    created_at: string;
    avg_cleanliness: number | null;
    avg_safety: number | null;
    reviews_count: number;
  }

export type WCCreate = Omit<
  WC,
  'id' | 'created_at' | 'avg_cleanliness' | 'avg_safety' | 'reviews_count'
>;
  