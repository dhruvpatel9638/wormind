import React, { useState } from 'react';
import { audio } from '../utils/audio';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCoins: (amount: number) => void;
  onRefillHearts: () => void;
  currentHearts: number;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen, onClose, onAddCoins, onRefillHearts, currentHearts,
}) => {
  const [adWatched, setAdWatched] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="kids-card p-5 w-full max-w-xs flex flex-col items-center relative anim-pop" style={{ fontFamily: "'Fredoka'" }}>
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#FFD6E8] text-[#EF3B3B] flex items-center justify-center cursor-pointer active:scale-90 hover:bg-[#FFB0C0] transition-colors">
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>

        <div className="w-16 h-16 rounded-full flex items-center justify-center text-[32px] -mt-12 ring-4 ring-white" style={{ background: 'linear-gradient(135deg, #FFE066, #FFC928)', boxShadow: '0 5px 0 #D4A200' }}>
          <span className="material-symbols-outlined text-[32px] text-[#5A3800]">monetization_on</span>
        </div>

        <h3 className="font-bold text-[22px] text-[#7652D9] mt-2">Treasure Vault!</h3>
        <p className="text-[12px] text-[#9B8EC0] text-center mb-4" style={{ fontFamily: "'Quicksand'", fontWeight: 600 }}>Grab goodies for your adventure!</p>

        <div className="flex flex-col gap-2.5 w-full mb-4">
          <div className="p-3 rounded-2xl flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #E8FFE5, #C8FFC0)', border: '2px solid #7FFFB0' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#1A6B2A]">inventory_2</span>
              <div><span className="font-semibold text-[13px] text-[#1A6B2A]">Explorer Gift</span><br/><span className="text-[11px] text-[#35C94A] font-bold">+100 Coins FREE!</span></div>
            </div>
            <button onClick={() => { audio.playCoin(); onAddCoins(100); alert('+100 Coins!'); }} className="text-white px-3 py-1.5 rounded-full font-bold text-[12px] active:translate-y-0.5 cursor-pointer" style={{ background: 'linear-gradient(180deg, #5DE86E, #35C94A)', boxShadow: '0 3px 0 #218A30' }}>FREE</button>
          </div>

          <div className="p-3 rounded-2xl flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #E0F0FF, #B0D8FF)', border: '2px solid #4DA6FF' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#1B4FBB]">smart_display</span>
              <div><span className="font-semibold text-[13px] text-[#1B4FBB]">Quick Clip</span><br/><span className="text-[11px] text-[#286BEA] font-bold">+250 Coins</span></div>
            </div>
            <button onClick={() => { audio.playCoin(); setAdWatched(true); onAddCoins(250); setTimeout(() => setAdWatched(false), 2000); }} className="text-white px-3 py-1.5 rounded-full font-bold text-[12px] active:translate-y-0.5 cursor-pointer" style={{ background: 'linear-gradient(180deg, #4DA6FF, #286BEA)', boxShadow: '0 3px 0 #1B4FBB' }}>{adWatched ? 'DONE' : 'WATCH'}</button>
          </div>

          <div className="p-3 rounded-2xl flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #FFE8E8, #FFB0B0)', border: '2px solid #FF8080' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#C62828]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <div><span className="font-semibold text-[13px] text-[#C62828]">Instant Energy</span><br/><span className="text-[11px] text-[#EF3B3B] font-bold">{currentHearts===5 ? 'Full! (5/5)' : 'Refill (5/5)'}</span></div>
            </div>
            <button onClick={() => { audio.playSparkle(); onRefillHearts(); alert('Lives Full!'); }} disabled={currentHearts>=5} className={`px-3 py-1.5 rounded-full font-bold text-[12px] cursor-pointer ${currentHearts>=5 ? 'bg-[#DDD] text-[#999] opacity-60' : 'text-white active:translate-y-0.5'}`} style={currentHearts<5 ? { background: 'linear-gradient(180deg, #FF6060, #EF3B3B)', boxShadow: '0 3px 0 #C62828' } : {}}>REFILL</button>
          </div>
        </div>

        <button onClick={onClose} className="w-full py-2.5 rounded-full font-bold text-[13px] text-[#9B8EC0] cursor-pointer transition-colors" style={{ background: 'rgba(212,181,255,0.2)', border: '2px solid rgba(212,181,255,0.3)' }}>CLOSE</button>
      </div>
    </div>
  );
};
