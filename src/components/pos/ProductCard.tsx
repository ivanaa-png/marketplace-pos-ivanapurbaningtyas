import React from 'react';
import { Product } from '../../types';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { formatRupiah } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isLoading?: boolean;
  key?: React.Key;
}

export default function ProductCard({ product, onAddToCart, isLoading }: ProductCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 animate-pulse">
        <div className="aspect-square bg-slate-100 rounded-xl mb-4" />
        <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-slate-100 rounded w-1/4" />
          <div className="h-10 w-10 bg-slate-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 group transition-all"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-slate-50">
        <img 
          src={product.image} 
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">
          {product.stock} in stock
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1">{product.category}</p>
        <h4 className="font-bold text-slate-900 line-clamp-1">{product.name}</h4>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-slate-900">{formatRupiah(product.price)}</span>
        <button 
          onClick={() => onAddToCart(product)}
          className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-primary hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>
    </motion.div>
  );
}
