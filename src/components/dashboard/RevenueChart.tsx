import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Transaction } from '../../types';
import { formatRupiah, safeDate } from '../../lib/utils';
import { BarChart3 } from 'lucide-react';

interface RevenueChartProps {
  transactions: Transaction[];
}

export default function RevenueChart({ transactions }: RevenueChartProps) {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    const data: { name: string; revenue: number }[] = [];

    if (timeframe === 'daily') {
      // Last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (6 - i));
        return {
          label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          date: d
        };
      });

      last7Days.forEach(item => {
        const dayRevenue = transactions
          .filter(tx => {
            const txDate = safeDate(tx.date);
            return txDate.getDate() === item.date.getDate() && 
                   txDate.getMonth() === item.date.getMonth() &&
                   txDate.getFullYear() === item.date.getFullYear();
          })
          .reduce((sum, tx) => sum + tx.totalAmount, 0);
        
        data.push({ name: item.label, revenue: dayRevenue });
      });
    } else if (timeframe === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekEnd = new Date();
        weekEnd.setDate(now.getDate() - i * 7);
        const weekStart = new Date();
        weekStart.setDate(weekEnd.getDate() - 7);
        
        const label = i === 0 ? 'This Week' : `${i}w ago`;

        const weekRevenue = transactions
          .filter(tx => {
            const txDate = safeDate(tx.date);
            return txDate >= weekStart && txDate <= weekEnd;
          })
          .reduce((sum, tx) => sum + tx.totalAmount, 0);
        
        data.push({ name: label, revenue: weekRevenue });
      }
    } else {
      // Last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(now.getMonth() - (5 - i));
        return {
          label: d.toLocaleDateString('id-ID', { month: 'short' }),
          month: d.getMonth(),
          year: d.getFullYear()
        };
      });

      last6Months.forEach(item => {
        const monthRevenue = transactions
          .filter(tx => {
            const txDate = safeDate(tx.date);
            return txDate.getMonth() === item.month && txDate.getFullYear() === item.year;
          })
          .reduce((sum, tx) => sum + tx.totalAmount, 0);
        
        data.push({ name: item.label, revenue: monthRevenue });
      });
    }

    return data;
  }, [transactions, timeframe]);

  const hasData = useMemo(() => chartData.some(d => d.revenue > 0), [chartData]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h4 className="text-xl font-bold text-slate-900">Revenue Analysis</h4>
          <p className="text-sm text-slate-500">Track your store performance over time.</p>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 self-start">
          {(['daily', 'weekly', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                timeframe === t 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full relative">
        {!hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl">
            <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-3">
              <BarChart3 size={32} />
            </div>
            <p className="text-slate-500 font-bold">No revenue data for this period</p>
            <p className="text-slate-400 text-xs">Start selling to see your growth!</p>
          </div>
        )}
        
        {isMounted && (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                hide={true}
                domain={[0, 'auto']}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
                formatter={(value: number) => [formatRupiah(value), 'Revenue']}
                cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4F46E5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
