import React from 'react';
import { Search, Bell, User, Menu, LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  user: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
}

export default function Header({ onMenuClick, user, onLogout }: HeaderProps) {
  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="fixed top-0 right-0 left-0 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-6 lg:px-10">
      <div className="flex items-center lg:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
        >
          <Menu size={24} />
        </button>
      </div>
      
      <div className="flex-1 flex justify-center px-4 md:px-10">
        <div className="relative max-w-xl w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Cari produk atau transaksi..." 
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-sm font-medium text-slate-900 shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-all">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-100 rounded-xl transition-all group">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
              <p className="text-xs text-slate-500 mt-1">{user.role}</p>
            </div>
          </button>
          
          {onLogout && (
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout to Boutique"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
