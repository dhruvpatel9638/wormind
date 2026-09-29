import React, { useState } from 'react';
import { audio } from '../utils/audio';

interface WorldsViewProps {
  onStartLevel: (levelId: number) => void;
  activeLevelId: number;
}

export const WorldsView: React.FC<WorldsViewProps> = ({ onStartLevel }) => {
  const [selectedLevelModal, setSelectedLevelModal] = useState<number | null>(null);

  const handleLevelClick = (lvl: number, locked: boolean) => {
    if (locked) { audio.playLetterTap(0); alert(`Level ${lvl} is locked!`); return; }
    audio.playLetterTap(2);
    setSelectedLevelModal(lvl);
  };

  return (
    <div className="flex flex-col w-full relative px-4 pb-36 pt-16 select-none max-w-[430px] mx-auto" style={{ fontFamily: "'Quicksand'" }}>
      {/* Chapter Card */}
      <div className="kids-card p-4 mb-4 relative z-10" style={{ border: '3px solid #7FFFB0' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#35C94A] animate-ping"></span>
            <h2 className="font-bold text-[17px] text-[#35C94A] tracking-tight" style={{ fontFamily: "'Fredoka'" }}>CHAPTER 1: SUNNY VALLEY</h2>
          </div>
          <div className="flex items-center gap-1 font-bold text-[14px] text-[#D4A200] px-2.5 py-0.5 rounded-full" style={{ fontFamily: "'Fredoka'", background: '#FFF3B0', border: '2px solid #FFE066' }}>
            <span className="material-symbols-outlined text-[16px]">star</span>
            <span>18/25</span>
          </div>
        </div>
        <div className="w-full rounded-full h-4 p-1 overflow-hidden" style={{ background: 'rgba(127,255,176,0.2)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: '72%', background: 'linear-gradient(90deg, #FFC928, #35C94A)', boxShadow: '0 0 6px rgba(53,201,74,0.3)' }}></div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-[12px] text-white cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(135deg, #5DE86E, #35C94A)', boxShadow: '0 3px 0 #218A30' }}>
            <span className="material-symbols-outlined text-[16px]">wb_sunny</span>Sunny Valley
          </button>
          <button onClick={() => alert('Bubble Ocean unlocks at Chapter 2!')} className="flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-[12px] text-[#9B8EC0] opacity-70 cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'rgba(255,255,255,0.5)', border: '2px solid #E8DDFF' }}>
            <span className="material-symbols-outlined text-[16px]">water_drop</span>Ocean
          </button>
          <button onClick={() => alert('Candy Clouds unlocks at Chapter 3!')} className="flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold text-[12px] text-[#9B8EC0] opacity-70 cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'rgba(255,255,255,0.5)', border: '2px solid #E8DDFF' }}>
            <span className="material-symbols-outlined text-[16px]">cloud</span>Candy
          </button>
        </div>
      </div>

      {/* Road Map */}
      <div className="relative w-full min-h-[680px] rounded-3xl p-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.4)', border: '3px solid rgba(255,255,255,0.6)', boxShadow: 'inset 0 2px 8px rgba(118,82,217,0.08)' }}>
        {/* Decorations */}
        <div className="absolute top-8 left-4 w-7 h-7 rounded-full bg-pink-300/30 anim-float"></div>
        <div className="absolute top-48 right-3 w-8 h-8 rounded-full bg-yellow-300/30 anim-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-20 left-6 w-6 h-6 rounded-full bg-green-300/30 anim-float" style={{ animationDelay: '1s' }}></div>

        {/* Letter Tree */}
        <div className="absolute top-16 left-6 flex flex-col items-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-[22px]" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #5DE86E, #35C94A)', boxShadow: '0 4px 0 #218A30', border: '3px solid #7FFFB0' }}>T</div>
          <div className="w-3 h-6 bg-[#D4A200] rounded-b-sm -mt-0.5"></div>
        </div>

        {/* Valley Gate */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="text-white px-4 py-2 rounded-2xl flex items-center gap-2" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(135deg, #9B7EFF, #7652D9)', boxShadow: '0 4px 0 #5A3BB5', border: '3px solid #D4B5FF' }}>
            <span className="material-symbols-outlined text-[20px]">castle</span>
            <div><span className="font-bold text-[12px] tracking-wide">VALLEY GATE</span><br/><span className="text-[10px] text-[#D4B5FF]">Word Riddle 8</span></div>
            <span className="material-symbols-outlined text-[16px] text-[#FFC928]">lock</span>
          </div>
        </div>

        {/* SVG Road */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 680" preserveAspectRatio="none">
          <path d="M 180 50 C 180 140, 290 180, 240 280 C 180 380, 70 420, 160 520 C 220 580, 240 620, 140 680" fill="none" stroke="rgba(212,181,255,0.4)" strokeWidth="56" strokeLinecap="round" />
          <path d="M 180 50 C 180 140, 290 180, 240 280 C 180 380, 70 420, 160 520 C 220 580, 240 620, 140 680" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="42" strokeLinecap="round" />
          <path d="M 180 50 C 180 140, 290 180, 240 280 C 180 380, 70 420, 160 520 C 220 580, 240 620, 140 680" fill="none" stroke="rgba(118,82,217,0.2)" strokeWidth="3" strokeDasharray="8 8" />
        </svg>

        {/* Level 1: Done */}
        <div onClick={() => handleLevelClick(1, false)} className="absolute bottom-6 left-[140px] z-20 flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
          <div className="w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-[18px]" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #5DE86E, #35C94A)', boxShadow: '0 4px 0 #218A30', border: '3px solid #7FFFB0' }}>
            <span className="material-symbols-outlined text-[22px]">check</span>
          </div>
          <div className="flex gap-0.5 text-[#FFC928] mt-0.5">
            <span className="material-symbols-outlined text-[13px]">star</span>
            <span className="material-symbols-outlined text-[13px]">star</span>
            <span className="material-symbols-outlined text-[13px]">star</span>
          </div>
          <span className="font-bold text-[11px] text-[#35C94A]" style={{ fontFamily: "'Fredoka'" }}>1</span>
        </div>

        {/* Level 2: Done */}
        <div onClick={() => handleLevelClick(2, false)} className="absolute bottom-36 right-[115px] z-20 flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
          <div className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-[20px]" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #5DE86E, #35C94A)', boxShadow: '0 4px 0 #218A30', border: '3px solid #7FFFB0' }}>
            <span className="material-symbols-outlined text-[22px]">check</span>
          </div>
          <div className="flex gap-0.5 text-[#FFC928] mt-0.5">
            <span className="material-symbols-outlined text-[13px]">star</span>
            <span className="material-symbols-outlined text-[13px]">star</span>
            <span className="material-symbols-outlined text-[13px]">star</span>
          </div>
          <span className="font-bold text-[11px] text-[#35C94A]" style={{ fontFamily: "'Fredoka'" }}>2</span>
        </div>

        {/* Level 3: Done */}
        <div onClick={() => handleLevelClick(3, false)} className="absolute bottom-64 left-[155px] z-20 flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
          <div className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-[20px]" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #5DE86E, #35C94A)', boxShadow: '0 4px 0 #218A30', border: '3px solid #7FFFB0' }}>
            <span className="material-symbols-outlined text-[22px]">check</span>
          </div>
          <div className="flex gap-0.5 mt-0.5">
            <span className="material-symbols-outlined text-[13px] text-[#FFC928]">star</span>
            <span className="material-symbols-outlined text-[13px] text-[#FFC928]">star</span>
            <span className="material-symbols-outlined text-[13px] text-[#D4B5FF]">star</span>
          </div>
          <span className="font-bold text-[11px] text-[#35C94A]" style={{ fontFamily: "'Fredoka'" }}>3</span>
        </div>

        {/* Level 4: ACTIVE */}
        <div className="absolute top-[300px] left-[45px] z-20 flex flex-col items-center">
          <div className="px-3 py-1 rounded-full mb-1.5 flex items-center gap-1 animate-bounce" style={{ fontFamily: "'Fredoka'", background: 'rgba(255,255,255,0.9)', border: '2px solid #4DA6FF', boxShadow: '0 3px 0 #B0D8FF' }}>
            <span className="font-bold text-[11px] text-[#286BEA]">Let's go!</span>
          </div>
          <div onClick={() => handleLevelClick(4, false)} className="relative w-20 h-20 rounded-full text-white flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform ring-4 ring-[#4DA6FF]/40" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #4DA6FF, #286BEA)', boxShadow: '0 6px 0 #1B4FBB, 0 0 24px rgba(40,107,234,0.3)', border: '4px solid #4DA6FF' }}>
            <span className="font-bold text-[26px] leading-none">4</span>
            <span className="font-bold text-[10px] text-[#FFC928]">PLAY</span>
            <div className="absolute -bottom-3 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase flex items-center gap-0.5" style={{ background: '#286BEA', border: '2px solid #4DA6FF' }}>
              READY <span className="material-symbols-outlined text-[11px]">play_arrow</span>
            </div>
          </div>
          <div className="absolute -left-4 top-8 w-7 h-7 rounded-full text-[#5A3800] flex items-center justify-center font-bold text-[10px]" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(135deg, #FFE066, #FFC928)', boxShadow: '0 2px 0 #D4A200' }}>+10</div>
          <div className="absolute -right-8 top-6 w-9 h-9 rounded-full flex items-center justify-center text-white text-[16px] animate-pulse" style={{ background: 'linear-gradient(135deg, #D4B5FF, #9B7EFF)', boxShadow: '0 3px 0 #7652D9' }}>
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
        </div>

        {/* Bonus Chest */}
        <div onClick={() => { audio.playCoin(); alert('Chest opened! 50 Coins + 1 Hint!'); }} className="absolute top-[260px] right-[135px] z-20 flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
          <div className="relative text-[#D4A200] animate-pulse">
            <span className="material-symbols-outlined text-[36px]">inventory_2</span>
          </div>
          <span className="px-2 py-0.5 rounded-full font-bold text-[9px] text-[#7652D9]" style={{ fontFamily: "'Fredoka'", background: 'rgba(255,255,255,0.8)', border: '2px solid #D4B5FF' }}>CHEST</span>
        </div>

        {/* Level 6: Locked */}
        <div onClick={() => handleLevelClick(6, true)} className="absolute top-[180px] right-[80px] z-20 flex flex-col items-center opacity-50 cursor-pointer">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.5)', border: '3px solid #E8DDFF', boxShadow: '0 4px 0 #D4B5FF' }}>
            <span className="material-symbols-outlined text-[20px] text-[#9B8EC0]">lock</span>
          </div>
          <div className="flex gap-0.5 text-[#E8DDFF] mt-0.5">
            <span className="material-symbols-outlined text-[12px]">star</span>
            <span className="material-symbols-outlined text-[12px]">star</span>
            <span className="material-symbols-outlined text-[12px]">star</span>
          </div>
          <span className="font-bold text-[11px] text-[#9B8EC0]" style={{ fontFamily: "'Fredoka'" }}>6</span>
        </div>

        {/* Level 7: Locked */}
        <div onClick={() => handleLevelClick(7, true)} className="absolute top-[120px] left-[105px] z-20 flex flex-col items-center opacity-50 cursor-pointer">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.5)', border: '3px solid #E8DDFF', boxShadow: '0 4px 0 #D4B5FF' }}>
            <span className="material-symbols-outlined text-[20px] text-[#9B8EC0]">lock</span>
          </div>
          <div className="flex gap-0.5 text-[#E8DDFF] mt-0.5">
            <span className="material-symbols-outlined text-[12px]">star</span>
            <span className="material-symbols-outlined text-[12px]">star</span>
            <span className="material-symbols-outlined text-[12px]">star</span>
          </div>
          <span className="font-bold text-[11px] text-[#9B8EC0]" style={{ fontFamily: "'Fredoka'" }}>7</span>
        </div>
      </div>

      {/* Sticky Play Banner */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-40 pointer-events-none">
        <button onClick={() => { audio.playLetterTap(3); onStartLevel(4); }} className="pointer-events-auto w-full h-14 text-white rounded-full flex items-center justify-between px-5 active:translate-y-1 transition-all cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #5DE86E, #35C94A)', boxShadow: '0 6px 0 #218A30, 0 12px 24px rgba(53,201,74,0.25), inset 0 2px 0 rgba(255,255,255,0.3)', border: '3px solid #7FFFB0' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center font-bold text-[18px]">4</div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-[10px] uppercase text-white/70 tracking-wider">Next</span>
              <span className="font-bold text-[16px] leading-tight">CONTINUE ADVENTURE</span>
            </div>
          </div>
          <div className="bg-white/20 px-3.5 py-1.5 rounded-full font-bold text-[12px] flex items-center gap-1">
            PLAY <span className="material-symbols-outlined text-[14px]">play_arrow</span>
          </div>
        </button>
      </div>

      {/* Level Modal */}
      {selectedLevelModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="kids-card p-6 w-full max-w-xs flex flex-col items-center text-center anim-pop" style={{ border: '3px solid #4DA6FF' }}>
            <div className="w-16 h-16 rounded-full text-white flex items-center justify-center font-bold text-[28px] mb-3" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #4DA6FF, #286BEA)', boxShadow: '0 5px 0 #1B4FBB, 0 0 20px rgba(40,107,234,0.3)', border: '4px solid #4DA6FF' }}>{selectedLevelModal}</div>
            <h3 className="font-bold text-[22px] text-[#286BEA]" style={{ fontFamily: "'Fredoka'" }}>Level {selectedLevelModal}</h3>
            <p className="text-[13px] text-[#9B8EC0] mt-1 mb-4 font-semibold">Word Search • 5 Hidden Words</p>
            <div className="flex items-center justify-center gap-1 mb-5">
              <span className="material-symbols-outlined text-[24px] text-[#FFC928]">star</span>
              <span className="material-symbols-outlined text-[24px] text-[#FFC928]">star</span>
              <span className="material-symbols-outlined text-[24px] text-[#E8DDFF]">star</span>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button onClick={() => { setSelectedLevelModal(null); onStartLevel(selectedLevelModal); }} className="w-full h-12 text-white rounded-full font-bold text-[16px] active:translate-y-1 transition-all cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #5DE86E, #35C94A)', boxShadow: '0 5px 0 #218A30, inset 0 2px 0 rgba(255,255,255,0.3)' }}>START PUZZLE!</button>
              <button onClick={() => setSelectedLevelModal(null)} className="w-full h-10 rounded-full font-bold text-[13px] text-[#9B8EC0] cursor-pointer transition-colors" style={{ fontFamily: "'Fredoka'", background: 'rgba(212,181,255,0.2)', border: '2px solid #E8DDFF' }}>BACK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
