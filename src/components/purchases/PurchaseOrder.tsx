import React, { useState, useEffect } from 'react';
import { Supplier, Product, Purchase, PurchaseItem } from '../../types';
import { suppliersDB, productsDB, purchasesDB } from '../../services/db';
import { Plus, Trash2, ShoppingBag, Check, X } from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

export default function PurchaseOrder({ onComplete }: { onComplete: () => void }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [status, setStatus] = useState<'Pending' | 'Selesai'>('Pending');
  const [items, setItems] = useState<Omit<PurchaseItem, 'id' | 'purchase_id'>[]>([]);
  
  // Selection state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [hargaBeli, setHargaBeli] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [splList, prodList] = await Promise.all([
      suppliersDB.getAll(),
      productsDB.getAll()
    ]);
    setSuppliers(splList);
    setProducts(prodList);
  };

  const addItem = () => {
    if (!selectedProductId) return;
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    setItems(prev => [
      ...prev,
      {
        product_id: product.id,
        product_name: product.name,
        qty_beli: qty,
        harga_beli_per_unit: hargaBeli
      }
    ]);
    
    // Reset selection
    setSelectedProductId('');
    setQty(1);
    setHargaBeli(0);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.harga_beli_per_unit * item.qty_beli), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || items.length === 0) return;

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    const purchaseId = `PUR-${Date.now()}`;

    const newPurchase: Purchase = {
      id: purchaseId,
      supplier_id: selectedSupplierId,
      supplier_name: supplier?.nama_vendor || 'Unknown',
      tanggal_beli: new Date().toISOString(),
      total_biaya: subtotal,
      status,
      items: items.map((item, index) => ({
        ...item,
        id: `PI-${Date.now()}-${index}`,
        purchase_id: purchaseId
      }))
    };

    try {
      await purchasesDB.add(newPurchase);
      alert(`Transaksi ${purchaseId} berhasil disimpan.${status === 'Selesai' ? ' Stok produk telah diperbarui.' : ''}`);
      onComplete();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Gagal menyimpan transaksi pembelian.');
    }
  };

  return (
    <div className="bg-white rounded-[40px] shadow-soft border border-slate-100">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <ShoppingBag size={28} className="text-primary" /> Transaksi Restock Baru
        </h3>
        <button onClick={onComplete} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1">Pilih Supplier</label>
              <select
                required
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-medium appearance-none"
              >
                <option value="">-- Pilih Vendor --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.nama_vendor} ({s.kategori})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700 ml-1">Status Pembelian</label>
              <div className="flex gap-3">
                {(['Pending', 'Selesai'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-4 rounded-2xl border-2 font-black text-sm tracking-wider uppercase transition-all ${
                      status === s 
                        ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {status === 'Selesai' && (
                <p className="text-[10px] text-emerald-600 font-bold mt-2 px-1 flex items-center gap-1 uppercase tracking-widest">
                  <Check size={12} /> Otomatis update stok saat disimpan
                </p>
              )}
            </div>
          </div>

          <div className="p-8 bg-slate-900 rounded-[32px] text-white flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2 relative z-10">Total Biaya Pembelian</p>
            <h2 className="text-5xl font-black text-white tracking-tighter relative z-10">{formatRupiah(subtotal)}</h2>
            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center relative z-10">
              <span className="text-slate-400 text-sm font-medium">Item dalam list</span>
              <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold">{items.length} Items</span>
            </div>
          </div>
        </div>

        {/* Dynamic Item Entry */}
        <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 space-y-6">
          <p className="text-sm font-black text-slate-900 uppercase tracking-widest px-1">Entri Produk</p>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
            <div className="sm:col-span-6 space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Pilih Produk</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setHargaBeli(p.price * 0.7);
                }}
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 font-medium appearance-none"
              >
                <option value="">-- Katalog Produk --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Qty</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value))}
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 font-bold"
              />
            </div>
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Harga Beli Unit</label>
              <input
                type="number"
                value={hargaBeli}
                onChange={(e) => setHargaBeli(parseInt(e.target.value))}
                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/5 font-bold text-slate-900"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="w-full py-4 bg-white border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl font-bold hover:border-primary hover:text-primary hover:bg-white transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            <Plus size={18} className="group-hover:scale-110 transition-transform" /> Tambahkan ke Daftar
          </button>
        </div>

        {/* Order Summary Table */}
        <div className="space-y-4 font-sans">
          <div className="rounded-[24px] border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-[0.1em]">
                <tr>
                  <th className="px-6 py-4">Nama Produk</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">Harga Unit</th>
                  <th className="px-6 py-4 text-right">Subtotal</th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {items.map((item, i) => (
                  <tr key={i} className="text-sm">
                    <td className="px-6 py-5 font-bold text-slate-800">{item.product_name}</td>
                    <td className="px-6 py-5 text-center font-black">{item.qty_beli}</td>
                    <td className="px-6 py-5 text-right text-slate-500">{formatRupiah(item.harga_beli_per_unit)}</td>
                    <td className="px-6 py-5 text-right font-black text-slate-900">{formatRupiah(item.harga_beli_per_unit * item.qty_beli)}</td>
                    <td className="px-6 py-5 text-center">
                      <button 
                        type="button"
                        onClick={() => removeItem(i)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-300 italic">No products added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pt-10 flex flex-col sm:flex-row gap-5 font-sans">
          <button
            type="button"
            onClick={onComplete}
            className="px-10 py-5 bg-slate-100 text-slate-600 rounded-[20px] font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            Batalkan
          </button>
          <button
            type="submit"
            disabled={items.length === 0 || !selectedSupplierId}
            className="flex-1 py-5 bg-primary text-white rounded-[20px] font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95"
          >
            <Check size={24} /> Finalisasi Transaksi Masuk
          </button>
        </div>
      </form>
    </div>
  );
}
