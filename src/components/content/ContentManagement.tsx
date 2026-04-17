import React, { useState, useEffect } from 'react';
import { configDB } from '../../services/db';
import { HeroSlide, StoreConfig } from '../../types';
import { Save, Plus, Trash2, Image as ImageIcon, Layout, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1558997519-83bc9c02c639?q=80&w=2000&auto=format&fit=crop',
    title: 'Timeless Elegance',
    subtitle: 'For Modern Icons',
    description: 'Discover the art of bespoke tailoring and premium materials crafted for those who define excellence.'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
    title: 'The Evening Edit',
    subtitle: 'Sophistication Redefined',
    description: 'Elevate your presence with our curated collection of evening wear designed for unforgettable moments.'
  }
];

const DEFAULT_STORE: StoreConfig = {
  name: 'LUMEN & ARCE',
  address: 'Jl. Premium Luxury No. 88, Jakarta, Indonesia',
  phone: '+62 897-4220-209',
  email: 'concierge@lumenarce.com',
  newsletterText: 'Join our inner circle for exclusive previews and sartorial insights.',
  marginType: 'percentage',
  marginValue: 30
};

export default function ContentManagement() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [store, setStore] = useState<StoreConfig>(DEFAULT_STORE);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'store'>('hero');

  useEffect(() => {
    const loadContent = async () => {
      const savedSlides = await configDB.get('hero_slides');
      const savedStore = await configDB.get('store_config');
      
      setSlides(savedSlides || DEFAULT_SLIDES);
      setStore(savedStore || DEFAULT_STORE);
    };
    loadContent();
  }, []);

  const handleSaveHero = async () => {
    setIsSaving(true);
    try {
      await configDB.set('hero_slides', slides);
      alert('Hero content saved successfully!');
    } catch (error) {
      console.error('Failed to save hero content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStore = async () => {
    setIsSaving(true);
    try {
      await configDB.set('store_config', store);
      alert('Store configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save store config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now().toString(),
      image: '',
      title: 'New Collection',
      subtitle: 'Coming Soon',
      description: 'Describe your new collection here.'
    };
    setSlides([...slides, newSlide]);
  };

  const removeSlide = (id: string) => {
    setSlides(slides.filter(s => s.id !== id));
  };

  const updateSlide = (id: string, field: keyof HeroSlide, value: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
          <p className="text-slate-500">Customize your boutique's landing page and store information.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setActiveTab('hero')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'hero' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-2">
              <Layout size={16} />
              Hero Slides
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('store')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'store' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <div className="flex items-center gap-2">
              <Info size={16} />
              Store Info
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'hero' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Hero Slider Configuration</h2>
            <div className="flex gap-3">
              <button 
                onClick={addSlide}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
              >
                <Plus size={18} /> Add Slide
              </button>
              <button 
                onClick={handleSaveHero}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {slides.map((slide, index) => (
              <motion.div 
                key={slide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                    Slide #{index + 1}
                  </span>
                  <button 
                    onClick={() => removeSlide(slide.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-4">
                    <div className="aspect-video bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 overflow-hidden relative group">
                      {slide.image ? (
                        <img src={slide.image} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon size={32} strokeWidth={1} />
                          <span className="text-[10px] font-bold uppercase mt-2">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Image URL</label>
                      <input 
                        type="text" 
                        value={slide.image}
                        onChange={(e) => updateSlide(slide.id, 'image', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Main Title</label>
                      <input 
                        type="text" 
                        value={slide.title}
                        onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subtitle</label>
                      <input 
                        type="text" 
                        value={slide.subtitle}
                        onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                      <textarea 
                        rows={3}
                        value={slide.description}
                        onChange={(e) => updateSlide(slide.id, 'description', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Store Configuration</h2>
            <button 
              onClick={handleSaveStore}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Store Name</label>
              <input 
                type="text" 
                value={store.name}
                onChange={(e) => setStore({ ...store, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Email</label>
              <input 
                type="email" 
                value={store.email}
                onChange={(e) => setStore({ ...store, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
              <input 
                type="text" 
                value={store.phone}
                onChange={(e) => setStore({ ...store, phone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Store Address</label>
              <input 
                type="text" 
                value={store.address}
                onChange={(e) => setStore({ ...store, address: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Newsletter Description</label>
              <textarea 
                rows={3}
                value={store.newsletterText}
                onChange={(e) => setStore({ ...store, newsletterText: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
