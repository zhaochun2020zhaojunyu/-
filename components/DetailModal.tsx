
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { CardData } from '../types';

interface DetailModalProps {
  card: CardData;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ card, onClose }) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with reduced opacity for enhanced Glassmorphism Effect */}
      <div 
        className="absolute inset-0 bg-slate-950/20 backdrop-blur-xl transition-opacity duration-700 ease-in-out"
        onClick={onClose}
      />
      
      {/* Modal Content with Easing Zoom-in Animation and reduced background opacity */}
      <div className="relative w-full max-w-4xl bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row backdrop-blur-2xl animate-modal-zoom">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-slate-950/50 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 border border-white/5"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
          <img 
            src={card.imageUrl} 
            alt={card.title} 
            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
          />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="space-y-6">
            <header>
              <h4 className="text-indigo-400 text-xs font-bold tracking-[0.3em] uppercase mb-2">Project Case Study</h4>
              <h2 className="text-3xl md:text-4xl font-light text-white leading-tight">{card.title}</h2>
            </header>
            
            <p className="text-slate-300 leading-relaxed font-light text-lg">
              {card.description}
            </p>

            <div className="pt-8 flex flex-wrap gap-3">
              <span className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-[10px] text-slate-400 uppercase tracking-widest">
                Interactive
              </span>
              <span className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-[10px] text-slate-400 uppercase tracking-widest">
                3D Visuals
              </span>
              <span className="px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-[10px] text-slate-400 uppercase tracking-widest">
                Real-time
              </span>
            </div>
            
            <div className="pt-8">
              <button 
                onClick={onClose}
                className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-600/30"
              >
                Back to Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
