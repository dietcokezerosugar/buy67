export type UserRole = 'creator' | 'admin';

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price_paise: number;
  slug: string;
  file_path: string;
  cover_image: string | null;
  creator_id: string;
  created_at: string;
  // Joined fields
  creator?: Profile;
}

export type OrderStatus = 'PENDING' | 'COMPLETED';

export interface Order {
  id: string;
  merchant_order_id: string;
  product_id: string | null;
  buyer_email: string;
  amount_paise: number;
  status: OrderStatus;
  baseupi_order_id: string | null;
  created_at: string;
  // Joined fields
  product?: Product;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_paise: number;
  created_at: string;
  // Joined
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  expires_at: string | null;
}

export type PayoutStatus = 'PENDING' | 'PAID';

export interface Payout {
  id: string;
  creator_id: string;
  amount_paise: number;
  status: PayoutStatus;
  created_at: string;
  // Joined
  creator?: Profile;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BaseUPICreateOrderResponse {
  success: boolean;
  data: {
    order_id: string;
    checkout_url: string;
    amount_paise: number;
  };
}

export interface BaseUPIWebhookPayload {
  event: string;
  data: {
    order_id: string;
    merchant_order_id: string;
    amount: number;
    status: string;
  };
}

export interface CreateOrderRequest {
  items: { product_id: string; quantity: number }[];
  buyer_email: string;
  coupon_code?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
