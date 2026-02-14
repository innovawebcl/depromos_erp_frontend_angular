export interface PickingScanResponse {
  ok: boolean;
  message?: string;
  item?: {
    id: number;
    product_id: number;
    product_name: string;
    size: string;
    quantity: number;
    scanned_quantity: number;
    barcode?: string | null;
  };
  order?: any;
}
