import React, { useState } from 'react';
import { User, Moon, Sun, Shield, Bell, Globe, Save } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  user: {
    name: string;
    role: string;
  };
  onUpdateUser: (name: string) => void;
}

export default function SettingsView({ user, onUpdateUser }: SettingsViewProps) {
  const [name, setName] = useState(user.name);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(name);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="p-6 lg:p-10 space-y-8 max-w-4xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500">Manage your account preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar Tabs */}
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
              <User size={20} />
              <span>Profile</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-all">
              <Shield size={20} />
              <span>Security</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-all">
              <Bell size={20} />
              <span>Notifications</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-all">
              <Globe size={20} />
              <span>Language</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Section */}
            <section className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
                  <p className="text-sm text-slate-500">Update your profile details and avatar.</p>
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
            </section>

            {/* Data Management Section */}
            <section className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Data Management</h3>
                <p className="text-sm text-slate-500">Manage your local boutique data.</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-2">
                <p className="text-xs text-amber-800 font-bold">Note on Data Persistence:</p>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Currently, all data (products, transactions, settings) is stored **locally in your browser** using IndexedDB. 
                  This means data is not shared between different browsers or devices. If you open the "Shared App URL" in a new browser, 
                  it will start with a fresh set of default products.
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
