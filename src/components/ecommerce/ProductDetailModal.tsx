import React, { useState } from 'react';
import { Product } from '../../types';
import { motion } from 'motion/react';
import { X, ShoppingBag, Ruler, Info, Minus, Plus } from 'lucide-react';
import { formatRupiah } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const SIZES = ['S', 'M', 'L', 'XL', 'Custom'];

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { product, size: selectedSize, quantity }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-luxury-charcoal/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-6xl max-h-full overflow-hidden shadow-premium flex flex-col lg:flex-row"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Image Gallery */}
        <div className="lg:w-1/2 bg-luxury-offwhite overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <img src={product.image} alt={product.name} className="w-full aspect-[3/4] object-cover" referrerPolicy="no-referrer" />
            {product.hoverImage && (
              <img src={product.hoverImage} alt={product.name} className="w-full aspect-[3/4] object-cover" referrerPolicy="no-referrer" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:w-1/2 p-8 lg:p-16 overflow-y-auto no-scrollbar flex flex-col">
          <div className="flex-1 space-y-10">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold">{product.category}</p>
              <h2 className="font-serif text-4xl lg:text-5xl text-luxury-charcoal leading-tight">{product.name}</h2>
              <p className="text-2xl font-light text-luxury-charcoal">{formatRupiah(product.price)}</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Select Size</h4>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-luxury-gold hover:text-luxury-charcoal transition-colors">
                  <Ruler size={14} />
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      selectedSize === size 
                        ? 'bg-luxury-charcoal text-white border-luxury-charcoal' 
                        : 'border-slate-200 text-slate-500 hover:border-luxury-gold'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quantity</h4>
              <div className="flex items-center border border-slate-200 w-fit">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-slate-50 text-slate-500"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm font-bold w-12 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-slate-50 text-slate-500"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-luxury-gold shrink-0 mt-1" />
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Material & Care</h4>
                  <p className="text-xs text-slate-500 font-serif italic leading-relaxed">
                    {product.material || 'Premium Italian wool blend. Dry clean only. Handle with the utmost care to preserve the integrity of the fibers.'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest">Description</h4>
                <p className="text-sm text-slate-600 font-serif leading-relaxed">
                  {product.description || 'A masterpiece of contemporary tailoring. This piece features a structured silhouette that commands attention while maintaining a sense of effortless grace.'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-12">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-luxury-charcoal text-white py-5 font-bold uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 hover:bg-luxury-gold transition-all shadow-xl shadow-luxury-charcoal/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={20} />
              {product.stock === 0 ? 'Sold Out' : 'Add to Collection'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
