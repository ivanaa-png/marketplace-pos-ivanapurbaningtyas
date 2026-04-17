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
import ReportsView from './components/reports/ReportsView';
import SupplierPage from './components/suppliers/SupplierPage';
import PurchaseManager from './components/purchases/PurchaseManager';
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
  
  const [isDataReady, setIsDataReady] = useState(false);
  
  // User Profile State
  const [user, setUser] = useState({
    name: 'IVANA',
    role: 'Administrator'
  });

  // Set Page Title
  useEffect(() => {
    document.title = 'LUMEN & ARCE';
  }, []);

  // Seed data on first load
  useEffect(() => {
    const initApp = async () => {
      try {
        // Ensure DB is initialized and upgraded
        const { getDB, productsDB, configDB, suppliersDB } = await import('./services/db');
        await getDB();
        
        // Seed suppliers
        await suppliersDB.seed();
        
        const existing = await productsDB.getAll();
        if (existing.length === 0) {
          await productsDB.bulkAdd(PRODUCTS);
        } else {
          // Force update images for existing products if they use the old /images/ path
          const outdatedProducts = existing.filter(p => p.image.startsWith('/images/'));
          if (outdatedProducts.length > 0) {
            for (const product of outdatedProducts) {
              const currentProduct = PRODUCTS.find(p => p.id === product.id);
              if (currentProduct) {
                await productsDB.update({ ...product, image: currentProduct.image });
              }
            }
          }
        }

        // Seed/Update hero slides
        const existingSlides = await configDB.get('hero_slides');
        if (!existingSlides) {
          const { DEFAULT_SLIDES } = await import('./components/content/ContentManagement');
          await configDB.set('hero_slides', DEFAULT_SLIDES);
        } else {
          // Ensure slide 1 has the wardrobe image if it's still using the old one
          const slide1 = existingSlides.find((s: any) => s.id === '1');
          const wardrobeImg = 'https://images.unsplash.com/photo-1558997519-83bc9c02c639?q=80&w=2000&auto=format&fit=crop';
          if (slide1 && slide1.image !== wardrobeImg) {
            const updatedSlides = existingSlides.map((s: any) => 
              s.id === '1' ? { ...s, image: wardrobeImg } : s
            );
            await configDB.set('hero_slides', updatedSlides);
          }
        }

        // Seed default store config if not exists
        const existingConfig = await configDB.get('store_config');
        if (!existingConfig) {
          await configDB.set('store_config', {
            name: 'LUMEN & ARCE',
            address: 'Jl. Premium Luxury No. 88, Jakarta, Indonesia',
            phone: '+62 897-4220-209',
            email: 'concierge@lumenarce.com',
            newsletterText: 'Join our inner circle for exclusive previews and sartorial insights.',
            marginType: 'percentage',
            marginValue: 20
          });
        } else if (!existingConfig.marginType) {
          // Update legacy config to include profit margin settings
          await configDB.set('store_config', {
            ...existingConfig,
            marginType: 'percentage',
            marginValue: 20
          });
        } else if (
          existingConfig.phone === '+62 812-5511-1347' || 
          existingConfig.phone === '+62 858-7826-3582' || 
          existingConfig.phone === '(021) 1234-5678' || 
          !existingConfig.phone
        ) {
          // Force update if it's still using any of the old development numbers
          await configDB.set('store_config', {
            ...existingConfig,
            phone: '+62 897-4220-209'
          });
        }
      } catch (error) {
        console.error('Initialization failed:', error);
      } finally {
        setIsDataReady(true);
      }
    };
    initApp();
  }, []);

  if (!isDataReady) {
    return (
      <div className="min-h-screen bg-luxury-offwhite flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif italic text-luxury-charcoal">Preparing your boutique...</p>
        </div>
      </div>
    );
  }

  const updateUser = (newName: string) => setUser(prev => ({ ...prev, name: newName }));

  const handleAdminLogin = (username: string) => {
    setUser(prev => ({ ...prev, name: username }));
    setView('admin');
  };

  const renderAdminView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onRestock={() => setActiveTab('purchases')} />;
      case 'pos':
        return <PoSView />;
      case 'products':
        return <ProductManagement />;
      case 'suppliers':
        return <SupplierPage />;
      case 'purchases':
        return <PurchaseManager />;
      case 'content':
        return <ContentManagement />;
      case 'history':
        return <HistoryView />;
      case 'reports':
        return <ReportsView />;
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
        
        <main className="flex-1 pt-20 overflow-y-auto no-scrollbar">
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
