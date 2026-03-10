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

export interface DeliveryAddress {
  id: number;
  street: string;
  number?: string | null;
  apartment?: string | null;
  city: string;
  commune?: string | null;
  region?: string | null;
  zip_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  instructions?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
}

export interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  transaction_id?: string | null;
  gateway?: string | null;
  paid_at?: string | null;
  created_at?: string;
}

export interface StatusHistoryEntry {
  id: number;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by_user_id?: number | null;
  created_at?: string;
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
  delivery_address?: DeliveryAddress | null;
  payments?: Payment[];
  status_history?: StatusHistoryEntry[];
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
