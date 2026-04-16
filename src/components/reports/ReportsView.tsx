import React, { useState, useEffect, useMemo } from 'react';
import { transactionsDB, productsDB } from '../../services/db';
import { Transaction, Product } from '../../types';
import { formatRupiah, safeDate, formatDate } from '../../lib/utils';
import { 
  Download, 
  TrendingUp, 
  BarChart3, 
  Calendar, 
  Package, 
  ArrowUpRight,
  ChevronRight,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ReportsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dbTx, dbProducts] = await Promise.all([
          transactionsDB.getAll(),
          productsDB.getAll()
        ]);
        setTransactions(dbTx);
        setProducts(dbProducts);
      } catch (error) {
        console.error('Failed to load report data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const reportData = useMemo(() => {
    const now = new Date();
    let filtered = [...transactions];

    if (reportType === 'daily') {
      filtered = transactions.filter(tx => {
        const d = safeDate(tx.date);
        return d.toDateString() === now.toDateString();
      });
    } else if (reportType === 'weekly') {
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      filtered = transactions.filter(tx => safeDate(tx.date) >= startOfWeek);
    } else {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = transactions.filter(tx => safeDate(tx.date) >= startOfMonth);
    }

    const totalRevenue = filtered.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const totalOrders = filtered.length;
    
    // Top Products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filtered.forEach(tx => {
      tx.items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, quantity: 0, revenue: 0 };
        }
        productSales[item.id].quantity += item.quantity;
        productSales[item.id].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      filtered,
      totalRevenue,
      totalOrders,
      topProducts,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }, [transactions, reportType]);

  const handleDownloadReport = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Total Amount', 'Payment Method'];
    const rows = reportData.filtered.map(tx => [
      tx.id,
      formatDate(tx.date),
      tx.customer,
      tx.items.map(i => `${i.name} (${i.quantity})`).join('; '),
      tx.totalAmount.toString(),
      tx.paymentMethod
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Sales_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="p-6 lg:p-10 space-y-8 max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Sales Reports</h1>
            <p className="text-slate-500 mt-1">Detailed analysis of your boutique performance.</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl shadow-soft border border-slate-100 self-start">
            {(['daily', 'weekly', 'monthly'] as const).map(type => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                  reportType === type 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{formatRupiah(reportData.totalRevenue)}</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Orders</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{reportData.totalOrders}</h3>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <ArrowUpRight size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Order Value</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{formatRupiah(reportData.avgOrderValue)}</h3>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg text-rose-500">
                <Package size={20} />
              </div>
              <h3 className="font-bold text-slate-900">Top Selling Products</h3>
            </div>
            <div className="flex-1 p-6">
              {reportData.topProducts.length > 0 ? (
                <div className="space-y-6">
                  {reportData.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{p.name}</h4>
                        <p className="text-xs text-slate-500">{p.quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatRupiah(p.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                  <Package size={40} strokeWidth={1.5} className="mb-3 opacity-20" />
                  <p className="text-sm font-medium italic">No sales recorded for this period</p>
                </div>
              )}
            </div>
          </div>

          {/* Download & Export Section */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10 h-full flex flex-col">
              <div className="mb-6">
                <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-6">
                  <FileText size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Export Data</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                  Generate and download your {reportType} sales report. The report includes order details, 
                  customer information, and financial breakdown in CSV format.
                </p>
              </div>
              
              <div className="mt-auto space-y-3">
                <button 
                  onClick={handleDownloadReport}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 group"
                >
                  <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                  Download CSV Report
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                  <Calendar size={12} />
                  Includes {reportData.filtered.length} transactions
                </div>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />
          </div>
        </div>

        {/* Transactions Table Mini Version */}
        <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Period Transactions</h3>
            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100">
              {reportType}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reportData.filtered.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{tx.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{tx.customer}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{formatDate(tx.date)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">{formatRupiah(tx.totalAmount)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-primary transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {reportData.filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                      No matching records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
