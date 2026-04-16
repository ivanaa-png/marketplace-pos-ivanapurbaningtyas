import React, { useState, useEffect } from 'react';
import { productsDB } from '../../services/db';
import { Product } from '../../types';
import { Plus, Search, Edit2, Trash2, X, Upload, Package, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../../constants';
import { formatRupiah, parseRupiah } from '../../lib/utils';

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<Product> & { priceInput: string }>({
    name: '',
    price: 0,
    priceInput: '',
    stock: 0,
    category: 'Men',
    image: '',
    description: '',
    material: '',
    sizes: ['S', 'M', 'L', 'XL']
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const dbProducts = await productsDB.getAll();
      setProducts(dbProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        ...product,
        priceInput: formatRupiah(product.price).replace('Rp', '').trim(),
        sizes: product.sizes || ['S', 'M', 'L', 'XL']
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: 0,
        priceInput: '',
        stock: 0,
        category: 'Men',
        image: '',
        description: '',
        material: '',
        sizes: ['S', 'M', 'L', 'XL']
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    const numericVal = parseInt(val, 10) || 0;
    setFormData(prev => ({
      ...prev,
      price: numericVal,
      priceInput: formatRupiah(numericVal).replace('Rp', '').trim()
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { priceInput, ...rest } = formData;
      const productData = {
        ...rest,
        id: editingProduct ? editingProduct.id : `P-${Date.now()}`,
      } as Product;

      if (editingProduct) {
        await productsDB.update(productData);
      } else {
        await productsDB.add(productData);
      }
      
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsDB.delete(id);
        await loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Management</h1>
            <p className="text-slate-500 mt-1">Manage your premium inventory and stock levels.</p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
              <Shield size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Local Storage Only</span>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-primary/20 transition-all"
          >
            <Plus size={20} />
            Add New Product
          </button>
        </div>

      <div className="bg-white rounded-2xl shadow-soft border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-10 bg-slate-100 rounded w-48" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-12" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatRupiah(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                        <span className="text-sm text-slate-600 font-medium">{product.stock} units</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-premium max-w-2xl w-full overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Product Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Price (Rp)</label>
                        <input 
                          type="text" 
                          required
                          value={formData.priceInput}
                          onChange={handlePriceInputChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Stock</label>
                        <input 
                          type="number" 
                          required
                          value={formData.stock}
                          onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        >
                          {CATEGORIES.filter(c => c !== 'All').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Material</label>
                        <input 
                          type="text" 
                          value={formData.material}
                          onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                          placeholder="e.g. Italian Silk"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700 mb-1">Product Image</label>
                    <div className="relative aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden group">
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="cursor-pointer p-3 bg-white rounded-full text-slate-900 shadow-lg">
                              <Upload size={24} />
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
                          <Upload size={32} className="text-slate-400 mb-2" />
                          <span className="text-xs font-bold text-slate-500">Click to upload</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                      placeholder="Brief description of the product..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Available Sizes (comma separated)</label>
                    <input 
                      type="text" 
                      value={formData.sizes?.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') }))}
                      placeholder="S, M, L, XL"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                    <p className="text-[10px] text-slate-400 mt-2 italic">Example: S, M, L, XL, Custom</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-primary/20 transition-all"
                  >
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
