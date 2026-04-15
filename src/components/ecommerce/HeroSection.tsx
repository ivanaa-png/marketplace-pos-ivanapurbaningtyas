import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { HeroSlide } from '../../types';

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1594932224828-b4b057b7d6ee?q=80&w=2000&auto=format&fit=crop',
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

interface HeroSectionProps {
  slides?: HeroSlide[];
}

export default function HeroSection({ slides = [] }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-luxury-charcoal">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-luxury-charcoal/40 z-10" />
          <img 
            src={activeSlides[currentSlide].image} 
            alt={activeSlides[currentSlide].title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-6">
        <motion.div
          key={`content-${currentSlide}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="max-w-4xl space-y-8"
        >
          <div className="space-y-2">
            <motion.p 
              initial={{ opacity: 0, letterSpacing: '0.5em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-luxury-gold text-[10px] lg:text-xs font-bold uppercase"
            >
              {activeSlides[currentSlide].subtitle}
            </motion.p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white leading-tight">
              {activeSlides[currentSlide].title}
            </h1>
          </div>
          
          <p className="text-slate-300 text-sm md:text-lg font-serif italic max-w-2xl mx-auto leading-relaxed">
            {activeSlides[currentSlide].description}
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-white text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-luxury-gold hover:text-white transition-all flex items-center gap-3 group"
            >
              Shop Collection
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-4 border border-white/30 text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all">
              Bespoke Service
            </button>
          </div>
        </motion.div>
      </div>

      {/* Slide Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all duration-500 ${currentSlide === idx ? 'w-12 bg-luxury-gold' : 'w-6 bg-white/30'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
