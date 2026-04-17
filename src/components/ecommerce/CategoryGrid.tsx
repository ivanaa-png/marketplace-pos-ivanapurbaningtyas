import React from 'react';
import { motion } from 'motion/react';

const CATEGORIES = [
  {
    id: 'Men',
    label: 'Men',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
    description: 'Precision tailoring for the modern gentleman.'
  },
  {
    id: 'Women',
    label: 'Women',
    image: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1000&auto=format&fit=crop',
    description: 'Elegant silhouettes for powerful presence.'
  },
  {
    id: 'Couple',
    label: 'Couple',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1000&auto=format&fit=crop',
    description: 'Harmonious aesthetics for shared moments.'
  },
  {
    id: 'Accessories',
    label: 'Accessories',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop',
    description: 'The final touch of distinction.'
  }
];

export default function CategoryGrid({ onCategorySelect }: { onCategorySelect: (id: string) => void }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-b border-luxury-charcoal/5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group cursor-pointer py-10 px-8 bg-white border border-slate-100 hover:border-luxury-gold transition-all duration-500 rounded-2xl flex flex-col items-center text-center space-y-4"
            onClick={() => {
              onCategorySelect(cat.id);
              document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="w-12 h-px bg-luxury-gold transition-all duration-500 group-hover:w-24 px-1" />
            <h3 className="font-serif text-3xl text-luxury-charcoal group-hover:text-luxury-gold transition-colors">{cat.label}</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 leading-relaxed font-bold">
              {cat.description}
            </p>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-luxury-gold opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 pt-4 px-1">
              Explore →
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
