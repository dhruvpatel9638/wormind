import React from 'react';

interface HeaderProps {
  coins: number;
  hearts: number;
  maxHearts: number;
  heartCountdown: string;
  level: number;
  onOpenShop: () => void;
  onRefillHearts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  coins,
  hearts,
  maxHearts,
  heartCountdown,
  level,
  onOpenShop,
  onRefillHearts,
}) => {
  return (
    <header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pt-safe"
      style={{
        background: 'linear-gradient(180deg, rgba(168,230,255,0.95) 0%, rgba(212,181,255,0.92) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '3px solid rgba(255,255,255,0.6)',
        boxShadow: '0 4px 16px rgba(118,82,217,0.15)',
      }}
    >
      <div className="h-14 w-full px-3 flex items-center justify-between gap-2">
        {/* Life */}
        <div
          onClick={onRefillHearts}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full cursor-pointer active:scale-95 transition-transform"
          style={{ background: 'rgba(255,255,255,0.85)', border: '2px solid #FFB0C0', boxShadow: '0 2px 0 #FFB0C0' }}
          title="Tap to refill lives"
        >
          <span className="material-symbols-outlined text-[#EF3B3B] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <span className="font-bold text-[13px] text-[#EF3B3B]" style={{ fontFamily: "'Fredoka'" }}>{hearts}/{maxHearts}</span>
          {hearts < maxHearts && (
            <span className="font-semibold text-[10px] text-[#E06080]" style={{ fontFamily: "'Quicksand'" }}>{heartCountdown}</span>
          )}
        </div>

        {/* Money */}
        <div
          className="flex-1 flex items-center justify-between gap-1 pl-2 pr-1 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.85)', border: '2px solid #FFE066', boxShadow: '0 2px 0 #FFE066' }}
        >
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[#D4A200] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
            <span className="font-bold text-[13px] text-[#B8860B]" style={{ fontFamily: "'Fredoka'" }}>{coins.toLocaleString()}</span>
          </div>
          <button
            onClick={onOpenShop}
            className="w-5 h-5 rounded-full bg-[#FFC928] text-[#5A3800] flex items-center justify-center font-bold text-[13px] active:scale-90 transition-transform cursor-pointer"
            style={{ boxShadow: '0 2px 0 #D4A200' }}
            title="Shop"
          >+</button>
        </div>

        {/* Level */}
        <div
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.85)', border: '2px solid #B0D8FF', boxShadow: '0 2px 0 #B0D8FF' }}
        >
          <span className="material-symbols-outlined text-[#286BEA] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="font-bold text-[13px] text-[#286BEA]" style={{ fontFamily: "'Fredoka'" }}>Lv. {level}</span>
        </div>
      </div>
    </header>
  );
};
