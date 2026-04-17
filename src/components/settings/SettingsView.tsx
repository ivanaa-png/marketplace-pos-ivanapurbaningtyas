import React, { useState, useEffect } from 'react';
import { User, Save, Settings as SettingsIcon, Store, Percent, DollarSign, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { configDB } from '../../services/db';
import { StoreConfig } from '../../types';

interface SettingsViewProps {
  user: {
    name: string;
    role: string;
  };
  onUpdateUser: (name: string) => void;
}

export default function SettingsView({ user, onUpdateUser }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'account' | 'system' | 'data'>('account');
  const [systemTab, setSystemTab] = useState<'profile' | 'margin'>('profile');
  const [name, setName] = useState(user.name);
  const [isSaved, setIsSaved] = useState(false);
  
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [isStoreSaving, setIsStoreSaving] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await configDB.get('store_config');
      if (config) setStoreConfig(config);
    };
    loadConfig();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(name);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveStoreConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeConfig) return;
    
    setIsStoreSaving(true);
    try {
      await configDB.set('store_config', storeConfig);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save store config:', error);
    } finally {
      setIsStoreSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500">Manage your account and boutique preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="space-y-1">
            <button 
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'account' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User size={20} />
              <span>Account</span>
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'system' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Store size={20} />
              <span>Pengaturan</span>
            </button>
            <button 
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'data' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database size={20} />
              <span>Data & Storage</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <motion.section 
                  key="account"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                      <p className="text-sm text-slate-500">Update your profile details.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Role</label>
                      <input 
                        type="text" 
                        value={user.role}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-primary/20"
                    >
                      <Save size={18} />
                      {isSaved ? 'Saved!' : 'Save Changes'}
                    </button>
                  </form>
                </motion.section>
              )}

              {activeTab === 'system' && storeConfig && (
                <motion.div 
                  key="system"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200/50">
                    <button 
                      onClick={() => setSystemTab('profile')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        systemTab === 'profile' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Store size={18} />
                      Profil Aplikasi
                    </button>
                    <button 
                      onClick={() => setSystemTab('margin')}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        systemTab === 'margin' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Percent size={18} />
                      Margin Profit
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={systemTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <section className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-8">
                        <form onSubmit={handleSaveStoreConfig} className="space-y-8">
                          {systemTab === 'profile' ? (
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                  <Store size={28} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-slate-900">Boutique Profile</h3>
                                  <p className="text-sm text-slate-500">Informasi yang muncul di struk dan landing page.</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700">App/Store Name</label>
                                  <input 
                                    type="text" 
                                    value={storeConfig.name}
                                    onChange={(e) => setStoreConfig({ ...storeConfig, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700">Contact Email</label>
                                  <input 
                                    type="email" 
                                    value={storeConfig.email}
                                    onChange={(e) => setStoreConfig({ ...storeConfig, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold text-slate-700">Phone</label>
                                  <input 
                                    type="text" 
                                    value={storeConfig.phone}
                                    onChange={(e) => setStoreConfig({ ...storeConfig, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <label className="text-sm font-bold text-slate-700">Address</label>
                                  <textarea 
                                    rows={2}
                                    value={storeConfig.address}
                                    onChange={(e) => setStoreConfig({ ...storeConfig, address: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                  <DollarSign size={28} />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-slate-900">Profit Margin Settings</h3>
                                  <p className="text-sm text-slate-500">Aturan global untuk kalkulasi harga jual otomatis.</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                  <label className="text-sm font-bold text-slate-700">Margin Type</label>
                                  <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button 
                                      type="button"
                                      onClick={() => setStoreConfig({ ...storeConfig, marginType: 'percentage' })}
                                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                        storeConfig.marginType === 'percentage' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                                      }`}
                                    >
                                      <Percent size={14} />
                                      Percentage
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => setStoreConfig({ ...storeConfig, marginType: 'nominal' })}
                                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                        storeConfig.marginType === 'nominal' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
                                      }`}
                                    >
                                      <DollarSign size={14} />
                                      Fixed Nominal
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <label className="text-sm font-bold text-slate-700">Margin Value</label>
                                  <div className="relative">
                                    <input 
                                      type="number" 
                                      value={storeConfig.marginValue}
                                      onChange={(e) => setStoreConfig({ ...storeConfig, marginValue: parseFloat(e.target.value) || 0 })}
                                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                      {storeConfig.marginType === 'percentage' ? '%' : 'IDR'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="pt-6 border-t border-slate-100">
                            <button 
                              type="submit"
                              disabled={isStoreSaving}
                              className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                              <Save size={18} />
                              {isStoreSaving ? 'Saving...' : 'Save Boutique Settings'}
                            </button>
                          </div>
                        </form>
                      </section>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'data' && (
                <motion.section 
                  key="data"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-6"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Data Management</h3>
                    <p className="text-sm text-slate-500">Manage your local boutique data.</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-2">
                    <p className="text-xs text-amber-800 font-bold">Note on Data Persistence:</p>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Currently, all data (products, transactions, settings) is stored **locally in your browser** using IndexedDB. 
                      This means data is not shared between different browsers or devices.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={async () => {
                        if (window.confirm('This will reset all products to default. Continue?')) {
                          const { productsDB } = await import('../../services/db');
                          const { PRODUCTS } = await import('../../constants');
                          const existing = await productsDB.getAll();
                          for (const p of existing) {
                            await productsDB.delete(p.id);
                          }
                          await productsDB.bulkAdd(PRODUCTS);
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                      Reset Products to Default
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear ALL local data? This cannot be undone.')) {
                          indexedDB.deleteDatabase('lumina_store_db');
                          window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all"
                    >
                      Clear All Local Storage
                    </button>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
