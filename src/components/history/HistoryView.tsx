import React, { useState, useEffect, useRef } from 'react';
import { Transaction } from '../../types';
import { transactionsDB } from '../../services/db';
import { Search, Calendar, Filter, Printer, Eye, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRupiah, formatDate } from '../../lib/utils';
import { toPng } from 'html-to-image';

export default function HistoryView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
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
      link.download = `receipt-${selectedTransaction?.id || 'order'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download receipt:', err);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await transactionsDB.getAll();
      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transaction History</h1>
            <p className="text-slate-500 mt-1">Review and manage all past sales and receipts.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Calendar size={18} />
              Filter Date
            </button>
          </div>
        </div>

      <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or customer..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-40" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">No transactions found.</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{tx.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(tx.date)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{tx.customer}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatRupiah(tx.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedTransaction(tx)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-premium max-w-sm w-full overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Printer size={18} /> Detail Struk
                </h3>
                <button onClick={() => setSelectedTransaction(null)} className="p-1 hover:bg-slate-200 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 bg-white font-mono text-xs text-slate-800 space-y-4 overflow-y-auto max-h-[70vh] no-scrollbar" ref={receiptRef}>
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-bold uppercase tracking-widest">LUMEN & ARCE</h2>
                  <p>Jl. Premium Luxury No. 88</p>
                  <p>Jakarta, Indonesia</p>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>No. Transaksi:</span>
                    <span>{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{formatDate(selectedTransaction.date)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-4 space-y-2">
                  {selectedTransaction.items.map((item, idx) => (
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
                    <span>{formatRupiah(selectedTransaction.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak (10%):</span>
                    <span>{formatRupiah(selectedTransaction.tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2">
                    <span>TOTAL:</span>
                    <span>{formatRupiah(selectedTransaction.totalAmount)}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Metode Bayar:</span>
                    <span className="uppercase">{selectedTransaction.paymentMethod || 'cash'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tunai:</span>
                    <span>{formatRupiah(selectedTransaction.amountPaid || selectedTransaction.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kembali:</span>
                    <span>{formatRupiah(selectedTransaction.change || 0)}</span>
                  </div>
                </div>

                <div className="pt-8 text-center space-y-4">
                  <div className="inline-block border-4 border-double border-slate-900 px-6 py-2 text-xl font-black rotate-[-5deg]">
                    LUNAS
                  </div>
                  <p className="italic">Terima kasih atas kunjungan Anda</p>
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
