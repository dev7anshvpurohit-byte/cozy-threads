export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  sizes: string[];
  image_url: string | null;
  in_stock: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: string | null;
  product_id: number | null;
  quantity: number;
  size: string;
  price_paid: number;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  status: string;
  created_at: string;
  product?: Product;
}

export interface Admin {
  id: string;
  email: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}
