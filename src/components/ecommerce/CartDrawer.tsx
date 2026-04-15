import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { X, ShoppingBag, Trash2, Minus, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRupiah } from '../../lib/utils';
import { transactionsDB, productsDB } from '../../services/db';
import { Transaction } from '../../types';

export default function CartDrawer() {
  const { state, dispatch } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'payment' | 'success'>('cart');
  
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleProceedToPayment = () => {
    if (state.items.length === 0) return;
    setCheckoutStep('payment');
  };

  const handleConfirmPayment = async () => {
    setIsCheckingOut(true);
    try {
      const newTransaction: Transaction = {
        id: `WEB-${Date.now()}`,
        date: new Date().toLocaleString('id-ID'),
        customer: 'Online Customer',
        items: [...state.items],
        subtotal,
        tax,
        totalAmount: total,
        amountPaid: total,
        change: 0,
        paymentMethod: 'qris', // Updated to QRIS
        status: 'completed'
      };

      // Save transaction
      await transactionsDB.add(newTransaction);
      
      // Update stock
      for (const item of state.items) {
        const product = await productsDB.getById(item.id);
        if (product) {
          await productsDB.update({
            ...product,
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      }

      setCheckoutStep('success');
      setTimeout(() => {
        dispatch({ type: 'CLEAR_CART' });
        setCheckoutStep('cart');
        dispatch({ type: 'TOGGLE_CART' });
      }, 4000);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isCheckingOut && dispatch({ type: 'TOGGLE_CART' })}
            className="fixed inset-0 bg-luxury-charcoal/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[110] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-luxury-gold" />
                <h2 className="font-serif text-xl text-luxury-charcoal">
                  {checkoutStep === 'payment' ? 'Secure Payment' : 'Your Wardrobe'}
                </h2>
              </div>
              <button 
                onClick={() => {
                  if (checkoutStep === 'payment') {
                    setCheckoutStep('cart');
                  } else {
                    dispatch({ type: 'TOGGLE_CART' });
                  }
                }}
                disabled={isCheckingOut}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50"
              >
                {checkoutStep === 'payment' ? <ArrowRight className="rotate-180" size={20} /> : <X size={20} />}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar relative">
              {checkoutStep === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-8 space-y-4 z-20"
                >
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="font-serif text-2xl text-luxury-charcoal">Order Confirmed</h3>
                  <p className="text-slate-500 text-sm italic">Thank you for choosing LUMEN & ARCE. Your timeless pieces are being prepared.</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-4">Redirecting to boutique...</p>
                </motion.div>
              ) : checkoutStep === 'payment' ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 py-4"
                >
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total Amount</p>
                    <h3 className="font-serif text-3xl text-luxury-charcoal">{formatRupiah(total)}</h3>
                  </div>

                  <div className="bg-luxury-offwhite p-8 rounded-2xl flex flex-col items-center space-y-6 border border-slate-100">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                      {/* Placeholder QR Code */}
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LUMENARCE-PAYMENT" 
                        alt="QRIS Code" 
                        className="w-48 h-48"
                      />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-luxury-charcoal">Scan with any Payment App</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">GOPAY | OVO | DANA | SHOPEEPAY | BANKING</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Order ID</span>
                      <span className="font-bold text-luxury-charcoal">#{Date.now().toString().slice(-8)}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                      <span className="text-slate-500">Merchant</span>
                      <span className="font-bold text-luxury-charcoal">LUMEN & ARCE</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                    <p className="text-[10px] text-amber-700 leading-relaxed italic">
                      Please complete the payment within 15 minutes. Once paid, click the button below to confirm your order.
                    </p>
                  </div>
                </motion.div>
              ) : state.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-serif italic">Your collection is currently empty.</p>
                  <button 
                    onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                    className="text-xs font-bold uppercase tracking-widest text-luxury-gold border-b border-luxury-gold pb-1"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                state.items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-24 aspect-[3/4] bg-luxury-offwhite overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-sm text-luxury-charcoal">{item.name}</h3>
                          <button 
                            onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                            disabled={isCheckingOut}
                            className="text-slate-300 hover:text-rose-500 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{item.description}</p>
                        <p className="text-xs font-medium text-luxury-gold mt-2">{formatRupiah(item.price)}</p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-slate-200">
                          <button 
                            onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                            disabled={isCheckingOut}
                            className="p-1.5 hover:bg-slate-50 text-slate-500 disabled:opacity-50"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
                            disabled={isCheckingOut}
                            className="p-1.5 hover:bg-slate-50 text-slate-500 disabled:opacity-50"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {state.items.length > 0 && checkoutStep !== 'success' && (
              <div className="p-6 bg-luxury-offwhite space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total</span>
                  <span className="font-serif text-2xl text-luxury-charcoal">{formatRupiah(total)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest">
                  <span>Payment Method</span>
                  <span className="font-bold text-luxury-gold">QRIS / Digital Payment</span>
                </div>
                <button 
                  onClick={checkoutStep === 'payment' ? handleConfirmPayment : handleProceedToPayment}
                  disabled={isCheckingOut}
                  className="w-full bg-luxury-charcoal text-white py-4 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-luxury-gold transition-all group disabled:opacity-50"
                >
                  {isCheckingOut ? 'Processing...' : checkoutStep === 'payment' ? 'I Have Paid' : 'Proceed to Payment'}
                  {!isCheckingOut && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
