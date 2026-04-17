import React, { useState, useEffect } from 'react';
import { DASHBOARD_STATS } from '../../constants';
import StatCard from './StatCard';
import RecentTransactions from './RecentTransactions';
import RevenueChart from './RevenueChart';
import { motion } from 'motion/react';
import { productsDB, transactionsDB } from '../../services/db';
import { Transaction, Product } from '../../types';
import { formatRupiah, safeDate } from '../../lib/utils';
import { Database, Plus, AlertTriangle, ArrowRight } from 'lucide-react';

export default function DashboardView({ onRestock }: { onRestock: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [dbTx, dbProducts] = await Promise.all([
        transactionsDB.getAll(),
        productsDB.getAll()
      ]);
      setTransactions(dbTx.sort((a, b) => safeDate(b.date).getTime() - safeDate(a.date).getTime()));
      setProducts(dbProducts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateSampleData = async () => {
    setIsLoading(true);
    try {
      const samples: Transaction[] = [];
      const item = products[0] || { id: 'P-001', name: 'Sample Item', price: 1000000, category: 'Men' };
      
      // Generate some random transactions for the last 7 days
      for (let i = 0; i < 10; i++) {
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 7));
        
        const tx: Transaction = {
          id: `SAMPLE-${Date.now()}-${i}`,
          date: d.toISOString(),
          customer: `Sample Customer ${i + 1}`,
          items: [{ ...item, quantity: 1 } as any],
          subtotal: item.price,
          tax: item.price * 0.1,
          totalAmount: item.price * 1.1,
          amountPaid: item.price * 1.1,
          change: 0,
          paymentMethod: 'qris',
          status: 'completed'
        };
        await transactionsDB.add(tx);
      }
      await loadData();
    } catch (error) {
      console.error('Failed to generate sample data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dynamic stats based on DB data
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
  const totalSales = transactions.length;
  const activeProducts = products.length;

  // Calculate Top Categories
  const categorySales: Record<string, number> = {};
  transactions.forEach(tx => {
    tx.items.forEach(item => {
      categorySales[item.category] = (categorySales[item.category] || 0) + item.quantity;
    });
  });

  const totalItemsSold = Object.values(categorySales).reduce((a, b) => a + b, 0);
  const topCategories = Object.entries(categorySales)
    .map(([name, count]) => ({
      name,
      value: totalItemsSold > 0 ? Math.round((count / totalItemsSold) * 100) : 0,
      color: name === 'Men' ? 'bg-primary' : name === 'Women' ? 'bg-rose-500' : name === 'Accessories' ? 'bg-emerald-500' : 'bg-amber-500'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  const dynamicStats = [
    { ...DASHBOARD_STATS[0], value: formatRupiah(totalRevenue) },
    { ...DASHBOARD_STATS[1], value: totalSales.toString() },
    { ...DASHBOARD_STATS[2], value: activeProducts.toString() },
  ];

  const handleDownloadReport = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Total Amount', 'Payment Method', 'Status'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.date,
      tx.customer,
      tx.totalAmount.toString(),
      tx.paymentMethod,
      tx.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `Full_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            {transactions.length === 0 && (
              <button 
                onClick={handleGenerateSampleData}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-sm font-semibold text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <Database size={18} /> Generate Demo Data
              </button>
            )}
            <button 
              onClick={handleDownloadReport}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Download Report
            </button>
          </div>
        </div>

      <LowStockAlert products={products} onRestock={onRestock} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dynamicStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard stat={stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <RevenueChart transactions={transactions} />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          {isLoading ? (
            <div className="h-64 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ) : (
            <RecentTransactions transactions={transactions} />
          )}
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-premium relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-2">Upgrade to Pro</h4>
              <p className="text-slate-400 text-sm mb-6">Get access to advanced analytics and multi-store management.</p>
              <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all">
                Learn More
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4">Top Categories</h4>
            <div className="space-y-4">
              {topCategories.length > 0 ? (
                topCategories.map(cat => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-slate-500">{cat.name}</span>
                      <span className="text-slate-900">{cat.value}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.value}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${cat.color}`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  Belum ada data penjualan
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

const LowStockAlert = ({ products, onRestock }: { products: Product[], onRestock: () => void }) => {
  const lowStockProducts = products.filter(p => p.stock < 5);
  
  if (lowStockProducts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900">Low Stock Alert</h4>
          <p className="text-xs text-amber-600">Ada {lowStockProducts.length} produk di bawah batas minimum stok (5 unit).</p>
        </div>
      </div>
      <div className="space-y-2">
        {lowStockProducts.map(p => (
          <div key={p.id} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-amber-200/50">
            <div className="flex items-center gap-3">
              <img src={p.image} className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-bold text-slate-900">{p.name}</p>
                <p className="text-[10px] text-slate-500">Stok saat ini: <span className="text-amber-600 font-bold">{p.stock} unit</span></p>
              </div>
            </div>
            <button 
              onClick={onRestock}
              className="px-3 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1"
            >
              Restock <ArrowRight size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
