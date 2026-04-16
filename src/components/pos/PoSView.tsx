import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CATEGORIES, PRODUCTS } from '../../constants';
import { Product, CartItem, Transaction } from '../../types';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import { Search, Filter, CheckCircle2, Printer, X, Download, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productsDB, transactionsDB } from '../../services/db';
import { formatRupiah } from '../../lib/utils';
import { toPng } from 'html-to-image';

export default function PoSView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleDownloadReceipt = async () => {
    if (receiptRef.current === null) return;
    
    try {
      const dataUrl = await toPng(receiptRef.current, { 
        cacheBust: true, 
        backgroundColor: '#fff',
        style: {
          padding: '20px'
        }
      });
      const link = document.createElement('a');
      link.download = `receipt-${lastTransaction?.id || 'order'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download receipt:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        let dbProducts = await productsDB.getAll();
        if (dbProducts.length === 0) {
          await productsDB.bulkAdd(PRODUCTS);
          dbProducts = await productsDB.getAll();
        }
        setProducts(dbProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = async (amountPaid: number, change: number, paymentMethod: 'cash' | 'qris' | 'transfer') => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const newTransaction: Transaction = {
      id: `TX-${Date.now()}`,
      date: new Date().toLocaleString('id-ID'),
      customer: 'Walk-in Customer',
      items: [...cart],
      subtotal,
      tax,
      totalAmount: total,
      amountPaid,
      change,
      paymentMethod,
      status: 'completed'
    };

    try {
      await transactionsDB.add(newTransaction);
      
      for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) {
          await productsDB.update({
            ...product,
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      }

      const updatedProducts = await productsDB.getAll();
      setProducts(updatedProducts);
      
      setLastTransaction(newTransaction);
      setShowReceipt(true);
      setCart([]);
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50">
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="p-6 bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="flex flex-col md:flex-row gap-4 max-w-[1400px] mx-auto w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari produk premium..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
              <Shield size={16} />
              <div className="text-[10px] leading-tight font-bold uppercase tracking-wider">
                Local Mode<br/>Device Only
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            {filteredProducts.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-soft mb-6">
                  <Filter size={40} className="text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Produk tidak ditemukan</h3>
                <p className="text-sm">Coba kata kunci lain atau kategori berbeda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8">
                {isLoading 
                  ? Array.from({ length: 10 }).map((_, i) => <ProductCard key={i} product={{} as any} onAddToCart={() => {}} isLoading />)
                  : filteredProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={handleAddToCart} 
                      />
                    ))
                }
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 lg:relative lg:inset-auto"
          >
            <CartSidebar 
              items={cart} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveFromCart}
              onCheckout={handleCheckout}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thermal Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-premium max-w-sm w-full overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Printer size={18} /> Struk Pembayaran
                </h3>
                <button onClick={() => setShowReceipt(false)} className="p-1 hover:bg-slate-200 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 bg-white font-mono text-xs text-slate-800 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar" ref={receiptRef}>
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold uppercase tracking-widest">LUMEN & ARCE</h2>
                  <p>Jl. Premium Luxury No. 88</p>
                  <p>Jakarta, Indonesia</p>
                  <p>Telp: (021) 1234-5678</p>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>No. Transaksi:</span>
                    <span>{lastTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{lastTransaction.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>IVANA</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-4 space-y-2">
                  {lastTransaction.items.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>{item.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{item.quantity} x {formatRupiah(item.price)}</span>
                        <span>{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(lastTransaction.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak (10%):</span>
                    <span>{formatRupiah(lastTransaction.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2">
                    <span>TOTAL:</span>
                    <span>{formatRupiah(lastTransaction.totalAmount)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Metode Bayar:</span>
                    <span className="uppercase">{lastTransaction.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tunai:</span>
                    <span>{formatRupiah(lastTransaction.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kembali:</span>
                    <span>{formatRupiah(lastTransaction.change)}</span>
                  </div>
                </div>

                <div className="pt-8 text-center space-y-4">
                  <div className="inline-block border-4 border-double border-slate-900 px-6 py-2 text-xl font-black rotate-[-5deg]">
                    LUNAS
                  </div>
                  <p className="italic">Terima kasih atas kunjungan Anda</p>
                  <p>Barang yang sudah dibeli tidak dapat ditukar/dikembalikan</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-primary/20"
                >
                  <Download size={18} /> Unduh Struk
                </button>
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                >
                  <Printer size={18} /> Cetak
                </button>
                <button 
                  onClick={() => setShowReceipt(false)}
                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
