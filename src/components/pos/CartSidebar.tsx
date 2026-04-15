import React, { useState } from 'react';
import { CartItem } from '../../types';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRupiah } from '../../lib/utils';

interface CartSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (amountPaid: number, change: number, paymentMethod: 'cash' | 'qris' | 'transfer') => void;
}

export default function CartSidebar({ items, onUpdateQuantity, onRemove, onCheckout }: CartSidebarProps) {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash');
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  
  const paidValue = paymentMethod === 'cash' 
    ? (parseInt(amountPaid.replace(/[^0-9]/g, ''), 10) || 0)
    : total; // For QRIS/Transfer, assume exact payment for now
    
  const change = paidValue - total;

  const handlePaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAmountPaid(val);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full lg:w-[420px] shadow-2xl">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <ShoppingBag size={20} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Current Order</h3>
        </div>
        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
          {items.length} items
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingBag size={32} />
              </div>
              <p className="text-sm font-medium">Your cart is empty</p>
            </motion.div>
          ) : (
            items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 p-4 bg-slate-50/50 rounded-2xl group border border-slate-100 hover:border-primary/20 transition-all"
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-20 h-20 rounded-xl object-cover bg-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{formatRupiah(item.price)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-white border-t border-slate-100 space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Payment Method</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'cash', label: 'Cash', icon: Banknote },
              { id: 'qris', label: 'QRIS', icon: CreditCard },
              { id: 'transfer', label: 'Bank', icon: CreditCard },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id as any)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  paymentMethod === method.id 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                }`}
              >
                <method.icon size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span className="font-medium">{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>Tax (10%)</span>
            <span className="font-medium">{formatRupiah(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
            <span>Total</span>
            <span className="text-primary">{formatRupiah(total)}</span>
          </div>
        </div>

        {items.length > 0 && (
          <div className="space-y-3">
            {paymentMethod === 'cash' && (
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Nominal Bayar (Rp)"
                  value={amountPaid ? formatRupiah(paidValue).replace('Rp', '').trim() : ''}
                  onChange={handlePaidChange}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-900"
                />
              </div>
            )}
            
            {paidValue > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex justify-between items-center p-4 rounded-xl border ${
                  change >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">
                  {change >= 0 ? 'Kembalian' : 'Kurang'}
                </span>
                <span className="font-bold text-lg">{formatRupiah(Math.abs(change))}</span>
              </motion.div>
            )}
          </div>
        )}

        <button 
          disabled={items.length === 0 || paidValue < total}
          onClick={() => onCheckout(paidValue, change, paymentMethod)}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard size={20} />
          {paymentMethod === 'cash' ? 'Bayar Tunai' : paymentMethod === 'qris' ? 'Bayar QRIS' : 'Bayar Transfer'}
        </button>
      </div>
    </div>
  );
}
