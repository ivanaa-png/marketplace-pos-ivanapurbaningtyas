import React, { useState } from 'react';
import { Product } from '../../types';
import { ShoppingBag, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { formatRupiah } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface EcomProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const EcomProductCard: React.FC<EcomProductCardProps> = ({ product, onQuickView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { dispatch } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ 
      type: 'ADD_ITEM', 
      payload: { product, quantity: 1 } 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
      onClick={() => onQuickView(product)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-luxury-offwhite mb-4">
        <motion.img 
          src={isHovered && product.hoverImage ? product.hoverImage : product.image} 
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Quick Actions Overlay */}
        <div className={`absolute inset-0 bg-luxury-charcoal/10 transition-opacity duration-300 flex items-end p-4 gap-2 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={handleQuickAdd}
            className="flex-1 bg-luxury-charcoal text-white py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-luxury-gold transition-colors"
          >
            <ShoppingBag size={14} />
            Quick Add
          </button>
          <button 
            className="w-12 bg-white text-luxury-charcoal py-3 flex items-center justify-center hover:bg-luxury-gold hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
          >
            <Eye size={14} />
          </button>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-4 left-4 bg-luxury-gold text-white px-2 py-1 text-[8px] font-bold uppercase tracking-widest">
            Limited Stock
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-charcoal border-b border-luxury-charcoal pb-1">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">{product.category}</p>
        <h3 className="font-serif text-lg text-luxury-charcoal group-hover:text-luxury-gold transition-colors">{product.name}</h3>
        <p className="font-medium text-luxury-charcoal">{formatRupiah(product.price)}</p>
      </div>
    </motion.div>
  );
}
