
import React, { useState } from 'react';
import Sphere from './components/Sphere';
import DetailModal from './components/DetailModal';
import { MOCK_CARDS } from './constants';
import { CardData } from './types';

const App: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  return (
    <div className="relative w-screen h-screen flex items-center justify-center bg-slate-950 overflow-hidden text-slate-200 font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Instruction Overlay */}
      <div className="absolute top-8 left-0 right-0 text-center z-10 opacity-60 pointer-events-none px-4">
        <h1 className="text-2xl font-light tracking-[0.2em] uppercase">Interactive Archive</h1>
        <p className="mt-2 text-sm text-slate-400">Drag to rotate • Click to focus • Click center to expand</p>
      </div>

      {/* The 3D Sphere Component */}
      <Sphere 
        cards={MOCK_CARDS} 
        onCardClick={(card) => setSelectedCard(card)} 
      />

      {/* Detail View Modal */}
      {selectedCard && (
        <DetailModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}

      {/* Footer Branding */}
      <div className="absolute bottom-8 right-8 z-10 opacity-30 text-xs font-mono uppercase tracking-widest">
        Design Intelligence v3.0
      </div>
    </div>
  );
};

export default App;
