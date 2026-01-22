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
  description?: string;
  created_at: string;
}

export interface WcFilters {
  accessible?: boolean;
  gender_neutral?: boolean;
  has_changing_table?: boolean;
  only_for_customers?: boolean;
  has_intimate_hygiene_products?: boolean;
}
