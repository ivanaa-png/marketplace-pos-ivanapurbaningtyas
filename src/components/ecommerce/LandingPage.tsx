import React, { useState, useEffect } from 'react';
import { productsDB, configDB } from '../../services/db';
import { Product, HeroSlide, StoreConfig } from '../../types';
import { Search, ShoppingBag, User, Menu, X, Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatRupiah } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { EcomProductCard } from './EcomProductCard';
import CartDrawer from './CartDrawer';
import HeroSection from './HeroSection';
import CategoryGrid from './CategoryGrid';
import ProductDetailModal from './ProductDetailModal';

const SIZES = ['S', 'M', 'L', 'XL', 'Custom'];
const CATEGORIES = ['All', 'Men', 'Women', 'Couple', 'Accessories'];

export default function LandingPage({ onAdminClick }: { onAdminClick: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSize, setActiveSize] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const { state, dispatch } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pData, hData, sData] = await Promise.all([
        productsDB.getAll(),
        configDB.get('hero_slides'),
        configDB.get('store_config')
      ]);
      
      // If products are still empty (e.g. race condition), wait a bit and retry once
      if (pData.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryData = await productsDB.getAll();
        setProducts(retryData);
        setFilteredProducts(retryData);
      } else {
        setProducts(pData);
        setFilteredProducts(pData);
      }

      if (hData) setHeroSlides(hData);
      if (sData) setStoreConfig(sData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = products;
    if (activeCategory !== 'All') {
      result = result.filter(p => p.category === activeCategory);
    }
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    // Size filter would normally be in DB, but we handle it in UI for demo
    setFilteredProducts(result);
  }, [activeCategory, searchQuery, products]);

  return (
    <div className="min-h-screen bg-luxury-offwhite font-sans text-luxury-charcoal">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button className="lg:hidden p-2">
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
              {CATEGORIES.slice(1).map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`hover:text-luxury-gold transition-colors ${activeCategory === cat ? 'text-luxury-gold' : 'text-luxury-charcoal'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-serif text-2xl lg:text-3xl font-bold tracking-[0.1em] text-luxury-charcoal">
              {storeConfig?.name || 'LUMEN & ARCE'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 border-b border-luxury-charcoal/20 pb-1">
              <Search size={16} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-[10px] uppercase tracking-widest outline-none w-24 focus:w-48 transition-all"
              />
            </div>
            <button 
              onClick={onAdminClick}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-luxury-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold transition-all"
            >
              Admin Panel
            </button>
            <button 
              onClick={onAdminClick}
              className="md:hidden hover:text-luxury-gold transition-colors"
            >
              <User size={20} />
            </button>
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="relative hover:text-luxury-gold transition-colors"
            >
              <ShoppingBag size={20} />
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-luxury-gold text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {state.items.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main>
        <HeroSection slides={heroSlides} />
        <CategoryGrid onCategorySelect={setActiveCategory} />

        {/* Product Section */}
        <section className="max-w-7xl mx-auto px-6 py-24" id="collection">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="font-serif text-4xl lg:text-5xl text-luxury-charcoal">The Collection</h2>
              <p className="text-slate-500 max-w-md font-serif italic">Curated pieces for the modern icon. Timeless elegance meets contemporary silhouette.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-slate-200 px-4 py-2 hover:border-luxury-gold transition-all">
                  Size: {activeSize}
                  <ChevronDown size={14} />
                </button>
                <div className="absolute top-full right-0 mt-2 bg-white shadow-premium p-2 hidden group-hover:block z-10 w-32">
                  {['All', ...SIZES].map(size => (
                    <button 
                      key={size}
                      onClick={() => setActiveSize(size)}
                      className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-offwhite hover:text-luxury-gold"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative group">
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-slate-200 px-4 py-2 hover:border-luxury-gold transition-all">
                  Category: {activeCategory}
                  <ChevronDown size={14} />
                </button>
                <div className="absolute top-full right-0 mt-2 bg-white shadow-premium p-2 hidden group-hover:block z-10 w-40">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-offwhite hover:text-luxury-gold"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[3/4] bg-slate-100" />
                  <div className="h-4 bg-slate-100 w-3/4" />
                  <div className="h-4 bg-slate-100 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-24 text-center space-y-6">
              <div className="space-y-2">
                <p className="font-serif italic text-slate-400">No pieces found in this selection.</p>
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">Try adjusting your filters or search query.</p>
              </div>
              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => { setActiveCategory('All'); setActiveSize('All'); setSearchQuery(''); }}
                  className="text-xs font-bold uppercase tracking-widest text-luxury-gold border-b border-luxury-gold pb-1"
                >
                  Clear All Filters
                </button>
                <button 
                  onClick={loadData}
                  className="px-6 py-2 bg-luxury-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold transition-all"
                >
                  Refresh Collection
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {filteredProducts.map(product => (
                <EcomProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickView={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-luxury-charcoal text-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold tracking-widest">{storeConfig?.name || 'LUMEN & ARCE'}</h3>
            <p className="text-slate-400 text-sm font-serif italic leading-relaxed">
              {storeConfig?.address || 'Jl. Premium Luxury No. 88, Jakarta, Indonesia'}
            </p>
            <p className="text-slate-400 text-xs font-serif italic">
              {storeConfig?.phone} | {storeConfig?.email}
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-gold">Collection</h4>
            <ul className="space-y-4 text-xs text-slate-400 uppercase tracking-widest">
              <li><button className="hover:text-white transition-colors">Men's Formal</button></li>
              <li><button className="hover:text-white transition-colors">Women's Evening</button></li>
              <li><button className="hover:text-white transition-colors">Bespoke Tailoring</button></li>
              <li><button className="hover:text-white transition-colors">Accessories</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-gold">Concierge</h4>
            <ul className="space-y-4 text-xs text-slate-400 uppercase tracking-widest">
              <li><button className="hover:text-white transition-colors">Size Guide</button></li>
              <li><button className="hover:text-white transition-colors">Shipping & Returns</button></li>
              <li><button className="hover:text-white transition-colors">Store Locator</button></li>
              <li><button className="hover:text-white transition-colors">Contact Us</button></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-luxury-gold">Newsletter</h4>
            <p className="text-xs text-slate-400 font-serif italic">{storeConfig?.newsletterText || 'Join our inner circle for exclusive previews and sartorial insights.'}</p>
            <div className="flex border-b border-slate-700 pb-2">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="bg-transparent text-[10px] uppercase tracking-widest outline-none flex-1"
              />
              <button className="text-[10px] font-bold uppercase tracking-widest text-luxury-gold">Join</button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-bold uppercase tracking-[0.3em] text-slate-500">
          <p>© 2026 {storeConfig?.name || 'LUMEN & ARCE'}. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>

      <CartDrawer />
      
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
