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
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group relative aspect-[4/5] overflow-hidden cursor-pointer"
            onClick={() => {
              onCategorySelect(cat.id);
              document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <img 
              src={cat.image} 
              alt={cat.label} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
              <h3 className="font-serif text-3xl mb-2">{cat.label}</h3>
              <p className="text-[10px] uppercase tracking-widest text-luxury-gold opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                Explore Collection
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
