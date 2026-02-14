export type OrderStatus =
  | 'pending'
  | 'picking'
  | 'ready'
  | 'en_route'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  scanned_quantity?: number;
  barcode?: string | null;
}

export interface Order {
  id: number;
  code?: string | null;
  customer_id: number;
  customer_name?: string | null;
  customer_email?: string | null;
  status: OrderStatus;
  total: number;
  commune_name?: string | null;
  delivery_fee?: number | null;
  courier_id?: number | null;
  courier_name?: string | null;
  eta_minutes?: number | null;
  receiver_rut?: string | null;
  delivery_photo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  timeline?: Array<{ at: string; status: OrderStatus; note?: string | null }>;
}

export interface Paginated<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
