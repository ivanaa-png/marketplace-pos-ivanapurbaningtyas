import React from 'react';
import { Transaction } from '../../types';
import { MoreHorizontal } from 'lucide-react';
import { formatRupiah } from '../../lib/utils';

export default function RecentTransactions({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Recent Transactions</h3>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Transaction ID</th>
              <th className="px-6 py-4 font-semibold">Customer</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{tx.id}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{tx.customer}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{tx.date}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatRupiah(tx.totalAmount)}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tx.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    tx.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                    'bg-rose-50 text-rose-700'
                  }`}>
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
        <button className="text-sm font-semibold text-primary hover:underline">
          View All Transactions
        </button>
      </div>
    </div>
  );
}
