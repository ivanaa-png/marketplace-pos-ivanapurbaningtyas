import React, { useState, useEffect } from 'react';
import { Purchase } from '../../types';
import { purchasesDB } from '../../services/db';
import { Plus, ShoppingBag, Eye, Calendar, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRupiah, formatDate } from '../../lib/utils';
import PurchaseOrder from './PurchaseOrder';

export default function PurchaseManager() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    setIsLoading(true);
    const data = await purchasesDB.getAll();
    setPurchases(data.sort((a, b) => new Date(b.tanggal_beli).getTime() - new Date(a.tanggal_beli).getTime()));
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus riwayat transaksi ini? (Stok tidak akan berkurang otomatis)')) {
      await purchasesDB.delete(id);
      loadPurchases();
    }
  };

  if (isAddingNew) {
    return (
      <div className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto">
        <PurchaseOrder onComplete={() => {
          setIsAddingNew(false);
          loadPurchases();
        }} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Riwayat Pembelian</h1>
          <p className="text-slate-500 mt-1">Lacak inventaris masuk dan pengeluaran ke vendor.</p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
        >
          <Plus size={20} /> Buat Pembelian Baru
        </button>
      </div>

      <div className="bg-white rounded-[32px] shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" /> Log Transaksi Masuk
          </h3>
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-[0.1em]">
            <Calendar size={14} /> Sinkronisasi Otomatis
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Order ID</th>
                <th className="px-8 py-5">Vendor</th>
                <th className="px-8 py-5">Tanggal</th>
                <th className="px-8 py-5 text-right">Total Biaya</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-sans">
              {purchases.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold text-slate-900 tracking-tighter">{p.id}</td>
                  <td className="px-8 py-6 text-sm text-slate-600 font-bold">{p.supplier_name}</td>
                  <td className="px-8 py-6 text-[11px] text-slate-400 font-medium">{formatDate(p.tanggal_beli)}</td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900 text-right">{formatRupiah(p.total_biaya)}</td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      p.status === 'Selesai' 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {p.status === 'Selesai' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => setSelectedPurchase(p)}
                        className="p-2.5 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Lihat Detail"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        title="Hapus History"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-8 py-28 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-200">
                      <ShoppingBag size={80} strokeWidth={1} />
                      <p className="text-slate-400 italic font-medium text-sm">Belum ada catatan pembelian barang.</p>
                      <button 
                        onClick={() => setIsAddingNew(true)}
                        className="mt-2 text-primary font-bold hover:underline"
                      >
                        Buat transaksi pertama
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedPurchase && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[48px] shadow-premium w-full max-w-3xl border border-white/20 flex flex-col max-h-[90vh] overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Rincian Pembelian</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedPurchase.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPurchase(null)} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-10 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest font-sans">Vendor / Supplier</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{selectedPurchase.supplier_name}</p>
                    <p className="text-xs text-slate-500 font-medium">ID: {selectedPurchase.supplier_id}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest font-sans">Tanggal Order</p>
                    <p className="text-xl font-bold text-slate-900">{formatDate(selectedPurchase.tanggal_beli)}</p>
                    <span className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] ${
                      selectedPurchase.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {selectedPurchase.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest font-sans px-1">Daftar Item Barang</p>
                  <div className="border border-slate-100 rounded-[28px] overflow-hidden font-sans shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Nama Produk</th>
                          <th className="px-6 py-4 text-center">Qty</th>
                          <th className="px-6 py-4 text-right">Harga Beli</th>
                          <th className="px-6 py-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium">
                        {selectedPurchase.items.map((item, i) => (
                          <tr key={i} className="text-sm">
                            <td className="px-6 py-4 font-bold text-slate-800">{item.product_name}</td>
                            <td className="px-6 py-4 text-center font-black">{item.qty_beli}</td>
                            <td className="px-6 py-4 text-right text-slate-500 font-sans">{formatRupiah(item.harga_beli_per_unit)}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-900 font-sans">{formatRupiah(item.harga_beli_per_unit * item.qty_beli)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest font-sans">Total Investasi Stok</p>
                  </div>
                  <p className="text-4xl font-black text-primary tracking-tighter">{formatRupiah(selectedPurchase.total_biaya)}</p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedPurchase(null)}
                  className="px-10 py-4 bg-slate-900 text-white rounded-[20px] font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                >
                  Tutup Rincian
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
