export interface Product {
  id: string;
  name: string;
  price: number; // This will be the Selling Price (Harga Jual)
  purchasePrice: number; // Harga Beli
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
  marginType: 'percentage' | 'nominal';
  marginValue: number;
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

export interface Supplier {
  id: string; // Using string as keyPath but will allow auto-gen in UI/DB logic
  nama_vendor: string;
  kontak_person: string;
  telepon: string;
  alamat: string;
  kategori: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  qty_beli: number;
  harga_beli_per_unit: number;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  supplier_name: string;
  tanggal_beli: string;
  total_biaya: number;
  status: 'Pending' | 'Selesai';
  items: PurchaseItem[];
}
