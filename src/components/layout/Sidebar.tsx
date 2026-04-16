import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Layout,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'content', label: 'Content', icon: Layout },
  { id: 'history', label: 'History', icon: History },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="fixed left-0 top-0 h-screen bg-slate-900 text-slate-300 z-50 flex flex-col shadow-2xl transition-all duration-300"
    >
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-3 font-bold text-xl text-white tracking-tight"
          >
            LUMEN & ARCE
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={22} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-3 font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              
              {/* Active Indicator Dot */}
              {isActive && isCollapsed && (
                <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-800">
        <button className="w-full flex items-center px-3 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
          <LogOut size={22} />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-2 w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-500 transition-all"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </motion.aside>
  );
}
