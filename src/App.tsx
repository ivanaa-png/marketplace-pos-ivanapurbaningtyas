/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardView from './components/dashboard/DashboardView';
import PoSView from './components/pos/PoSView';
import ProductManagement from './components/products/ProductManagement';
import HistoryView from './components/history/HistoryView';
import SettingsView from './components/settings/SettingsView';
import ContentManagement from './components/content/ContentManagement';
import LandingPage from './components/ecommerce/LandingPage';
import LoginView from './components/auth/LoginView';
import { AnimatePresence, motion } from 'motion/react';
import { CartProvider } from './context/CartContext';
import { productsDB } from './services/db';
import { PRODUCTS } from './constants';

export default function App() {
  const [view, setView] = useState<'ecommerce' | 'login' | 'admin'>('ecommerce');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // User Profile State
  const [user, setUser] = useState({
    name: 'IVANA',
    role: 'Administrator'
  });

  // Seed data on first load
  useEffect(() => {
    const seed = async () => {
      const existing = await productsDB.getAll();
      if (existing.length === 0) {
        await productsDB.bulkAdd(PRODUCTS);
      }
    };
    seed();
  }, []);

  const updateUser = (newName: string) => setUser(prev => ({ ...prev, name: newName }));

  const handleAdminLogin = (username: string) => {
    setUser(prev => ({ ...prev, name: username }));
    setView('admin');
  };

  const renderAdminView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <PoSView />;
      case 'products':
        return <ProductManagement />;
      case 'content':
        return <ContentManagement />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return (
          <SettingsView 
            user={user} 
            onUpdateUser={updateUser} 
          />
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p>The {activeTab} module is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  if (view === 'ecommerce') {
    return (
      <CartProvider>
        <LandingPage onAdminClick={() => setView('login')} />
      </CartProvider>
    );
  }

  if (view === 'login') {
    return <LoginView onLogin={handleAdminLogin} onBack={() => setView('ecommerce')} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-[70] lg:hidden"
            >
              <Sidebar 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }} 
                isCollapsed={false}
                setIsCollapsed={() => {}}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div 
        className={`transition-all duration-300 min-h-screen flex flex-col ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-[260px]'
        }`}
      >
        <Header 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          user={user}
          onLogout={() => setView('ecommerce')}
        />
        
        <main className="flex-1 pt-20 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderAdminView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
