export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string; // Base64 or URL
  hoverImage?: string;
  description?: string;
  sizes?: string[];
  material?: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface StoreConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  newsletterText: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  customer: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  amountPaid: number;
  change: number;
  paymentMethod: 'cash' | 'qris' | 'transfer';
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Stat {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: string;
}
