import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Lock, ArrowLeft, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string) => void;
  onBack: () => void;
}

export default function LoginView({ onLogin, onBack }: LoginViewProps) {
  const [username, setUsername] = useState('ivana');
  const [password, setPassword] = useState('123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      onLogin(username || 'IVANA');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-luxury-offwhite flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-luxury-charcoal transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Boutique
        </button>

        <div className="bg-white p-10 lg:p-12 shadow-premium rounded-3xl space-y-10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-luxury-charcoal text-luxury-gold rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-3xl text-luxury-charcoal">Admin Gateway</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Authorized Personnel Only</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="USERNAME" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-luxury-offwhite border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:border-luxury-gold focus:ring-4 focus:ring-luxury-gold/5 outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  placeholder="PASSWORD" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-luxury-offwhite border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:border-luxury-gold focus:ring-4 focus:ring-luxury-gold/5 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-luxury-charcoal text-white py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-luxury-gold transition-all shadow-xl shadow-luxury-charcoal/10 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Authenticate'
              )}
            </button>
          </form>

          <p className="text-center text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Secure Session Management Active
          </p>
        </div>
      </motion.div>
    </div>
  );
}
