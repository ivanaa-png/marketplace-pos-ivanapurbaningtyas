import React from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { Stat } from '../../types';
import { motion } from 'motion/react';

const iconMap: Record<string, any> = {
  DollarSign,
  ShoppingCart,
  Package
};

export default function StatCard({ stat }: { stat: Stat }) {
  const Icon = iconMap[stat.icon];
  const isUp = stat.trend === 'up';

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100"
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl ${isUp ? 'bg-primary/10 text-primary' : 'bg-slate-50 text-slate-600'}`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {stat.change}%
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
      </div>
      
      {/* Simple SVG Chart Placeholder */}
      <div className="mt-4 h-12 w-full">
        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path 
            d={isUp ? "M0 35 Q 25 30, 50 20 T 100 5" : "M0 5 Q 25 10, 50 20 T 100 35"} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={isUp ? "text-emerald-400" : "text-rose-400"}
          />
        </svg>
      </div>
    </motion.div>
  );
}
