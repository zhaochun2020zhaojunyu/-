
import React from 'react';
import { CardData, Vector3 } from '../types';
import { SPHERE_RADIUS } from '../constants';

interface SphereCardProps {
  card: CardData;
  position: Vector3;
  isActive: boolean;
  onClick: () => void;
}

const SphereCard: React.FC<SphereCardProps> = ({ card, position, isActive, onClick }) => {
  const phi = Math.acos(position.y / SPHERE_RADIUS);
  const theta = Math.atan2(position.z, position.x);

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        card-3d absolute w-[168px] h-[168px] -ml-[84px] -mt-[84px]
        rounded-xl overflow-hidden cursor-pointer
        transition-all duration-700 ease-out
        border-[0.5px] shadow-[0_4px_12px_rgba(0,0,0,0.5)]
        ${isActive 
          ? 'scale-125 grayscale-0 border-indigo-400/90 shadow-[0_0_30px_rgba(99,102,241,0.6)] z-50' 
          : 'grayscale border-white/5 scale-100 opacity-50 hover:opacity-80'
        }
      `}
      style={{
        transform: `
          translate3d(${position.x}px, ${position.y}px, ${position.z}px) 
          rotateY(${-theta + Math.PI/2}rad) 
          rotateX(${phi - Math.PI/2}rad)
        `,
      }}
    >
      <img 
        src={card.imageUrl} 
        alt={card.title} 
        className="w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />
      
      {/* Dynamic Overlay */}
      <div className={`absolute inset-0 bg-slate-950 transition-opacity duration-500 ${isActive ? 'opacity-0' : 'opacity-20'}`} />
      
      {/* Light Edge on Active */}
      {isActive && (
        <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none" />
      )}

      {/* Focus Label */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/20 backdrop-blur-[1px] animate-in fade-in duration-500">
           <div className="px-3 py-1.5 bg-black/60 rounded-lg border border-white/10">
              <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                View Details
              </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default SphereCard;
