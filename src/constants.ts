import { Product, Transaction, Stat } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'P-001',
    name: 'Midnight Silk Evening Gown',
    price: 12500000,
    stock: 5,
    category: 'Women',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop',
    description: 'Exquisite midnight blue silk gown with hand-stitched detailing.',
  },
  {
    id: 'P-002',
    name: 'Tailored Charcoal Wool Suit',
    price: 18500000,
    stock: 8,
    category: 'Men',
    image: 'https://images.unsplash.com/photo-1594932224828-b4b057b7d6ee?q=80&w=1000&auto=format&fit=crop',
    description: 'Italian wool charcoal suit, perfectly tailored for the modern gentleman.',
  },
  {
    id: 'P-003',
    name: 'Matching Cashmere Lounge Set',
    price: 21000000,
    stock: 12,
    category: 'Couple',
    image: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1000&auto=format&fit=crop',
    description: 'Ultra-soft cashmere sets designed for elegant coordination.',
  },
  {
    id: 'P-004',
    name: 'Diamond Encrusted Timepiece',
    price: 154000000,
    stock: 2,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop',
    description: 'Luxury timepiece featuring VVS diamonds and 18k gold.',
  },
  {
    id: 'P-005',
    name: 'Handcrafted Leather Oxford',
    price: 6500000,
    stock: 15,
    category: 'Men',
    image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000&auto=format&fit=crop',
    description: 'Full-grain leather oxfords with Goodyear welt construction.',
  },
  {
    id: 'P-006',
    name: 'Velvet Clutch with Gold Chain',
    price: 4500000,
    stock: 20,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fd143c5b?q=80&w=1000&auto=format&fit=crop',
    description: 'Deep emerald velvet clutch with a detachable 24k gold plated chain.',
  },
];

export const CATEGORIES = ['All', 'Men', 'Women', 'Couple', 'Accessories'];

export const DASHBOARD_STATS: Stat[] = [
  { label: 'Total Revenue', value: 'Rp 428.430.000', change: 15.2, trend: 'up', icon: 'DollarSign' },
  { label: 'Total Sales', value: '840', change: 5.2, trend: 'up', icon: 'ShoppingCart' },
  { label: 'Active Products', value: '42', change: 2.1, trend: 'up', icon: 'Package' },
];
