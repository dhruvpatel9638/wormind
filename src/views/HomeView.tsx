import React, { useState } from 'react';
import { Screen } from '../types';
import { ASSETS, LOKI_QUOTES } from '../data/gameData';
import { audio } from '../utils/audio';

interface HomeViewProps {
  onStartLevel: (levelId: number) => void;
  onNavigate: (screen: Screen) => void;
  activeLevelId: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStartLevel, onNavigate, activeLevelId }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [mascotBounce, setMascotBounce] = useState(false);

  const handleMascotTap = () => {
    audio.playChirp();
    setMascotBounce(true);
    setQuoteIndex((prev) => (prev + 1) % LOKI_QUOTES.length);
    setTimeout(() => setMascotBounce(false), 300);
  };

  return (
    <div className="flex flex-col w-full relative px-4 pb-28 pt-16 select-none overflow-hidden max-w-[430px] mx-auto" style={{ fontFamily: "'Quicksand'" }}>
      {/* Fun floating decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-24 left-3 w-8 h-8 rounded-full bg-blue-300/30 anim-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-6 w-6 h-6 rounded-full bg-purple-300/30 anim-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-96 -left-1 w-10 h-10 rounded-full bg-yellow-300/20 anim-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[520px] right-3 w-7 h-7 rounded-full bg-pink-300/20 anim-float" style={{ animationDelay: '0.7s' }}></div>
        <div className="absolute top-[750px] left-4 w-8 h-8 rounded-full bg-indigo-300/20 anim-float" style={{ animationDelay: '1.3s' }}></div>
      </div>

      {/* Greeting */}
      <section className="relative z-10 flex flex-col items-center text-center mt-3 mb-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.7)', border: '2px solid #D4B5FF', boxShadow: '0 3px 0 rgba(212,181,255,0.3)' }}>
          <span className="font-bold text-[12px] text-[#7652D9] uppercase tracking-wider" style={{ fontFamily: "'Fredoka'" }}>Hey, Word Explorer!</span>
        </div>
        <h1 className="font-bold text-[34px] sm:text-[38px] tracking-tight leading-tight" style={{ fontFamily: "'Fredoka'", color: '#5A3BB5' }}>
          WHERE SHALL WE GO?
        </h1>
        <p className="font-semibold text-[14px] text-[#9B8EC0] max-w-[290px] mt-1">
          Tap a world portal to start your word adventure!
        </p>
      </section>

      {/* World Portals */}
      <div className="relative z-10 flex flex-col gap-6">
        {/* BRAIN BOULEVARD */}
        <article className="kids-card overflow-hidden active:translate-y-1 transition-transform" style={{ border: '3px solid #4DA6FF' }}>
          <div className="relative h-44 w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #A8E6FF, #4DA6FF)' }}>
            <img src={ASSETS.brainBoulevard} alt="Brain Boulevard" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-[13px] text-white flex items-center gap-1" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(135deg, #FF6060, #EF3B3B)', boxShadow: '0 3px 0 #C62828' }}>
              <span>HOT</span>
            </div>
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[#286BEA] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              </div>
              <span className="font-bold text-[14px] text-[#1B4FBB] uppercase tracking-wider" style={{ fontFamily: "'Fredoka'", textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>Brain Boulevard</span>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-[26px] text-[#286BEA] leading-none mb-1" style={{ fontFamily: "'Fredoka'" }}>TRAIN</h2>
                <p className="font-semibold text-[13px] text-[#7B8EC0]">Challenge your mind • 120 levels</p>
              </div>
              <span className="font-bold text-[11px] text-[#286BEA] px-2.5 py-0.5 rounded-full" style={{ fontFamily: "'Fredoka'", background: '#E0F0FF', border: '2px solid #B0D8FF' }}>Lv. 34</span>
            </div>
            <button onClick={() => { audio.playLetterTap(3); onStartLevel(4); }} className="w-full h-14 text-white rounded-full font-bold text-[17px] flex items-center justify-center gap-2 active:translate-y-1 transition-all cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #4DA6FF, #286BEA)', boxShadow: '0 6px 0 #1B4FBB, 0 8px 16px rgba(40,107,234,0.25), inset 0 2px 0 rgba(255,255,255,0.3)' }}>
              <span>ENTER BOULEVARD</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </article>

        <article className="kids-card overflow-hidden active:translate-y-1 transition-transform" style={{ border: '3px solid #FFE066' }}>
          <div className="relative h-44 w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF3B0, #FFE066)' }}>
            <img src={ASSETS.dreamyIsland} alt="Dreamy Island" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-[13px] flex items-center gap-1" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(135deg, #FFE066, #FFC928)', color: '#5A3800', boxShadow: '0 3px 0 #D4A200' }}>
              <span>ZEN</span>
            </div>
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[#D4A200] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>beach_access</span>
              </div>
              <span className="font-bold text-[14px] text-[#5A3800] uppercase tracking-wider" style={{ fontFamily: "'Fredoka'", textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>Dreamy Island</span>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-[26px] text-[#D4A200] leading-none mb-1" style={{ fontFamily: "'Fredoka'" }}>RELAX</h2>
                <p className="font-semibold text-[13px] text-[#B8A060]">Chill words • No timers</p>
              </div>
              <span className="font-bold text-[11px] text-[#D4A200] px-2.5 py-0.5 rounded-full" style={{ fontFamily: "'Fredoka'", background: '#FFF3B0', border: '2px solid #FFE066' }}>Endless</span>
            </div>
            <button onClick={() => { audio.playLetterTap(2); onStartLevel(24); }} className="w-full h-14 text-[#5A3800] rounded-full font-bold text-[17px] flex items-center justify-center gap-2 active:translate-y-1 transition-all cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #FFE066, #FFC928)', boxShadow: '0 6px 0 #D4A200, 0 8px 16px rgba(255,201,40,0.25), inset 0 2px 0 rgba(255,255,255,0.4)' }}>
              <span>PLAY CASUAL</span>
              <span className="material-symbols-outlined text-[20px]">play_arrow</span>
            </button>
          </div>
        </article>

        {/* WORD FOREST */}
        <article className="kids-card overflow-hidden active:translate-y-1 transition-transform" style={{ border: '3px solid #D4B5FF' }}>
          <div className="relative h-44 w-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #E8DDFF, #D4B5FF)' }}>
            <img src={ASSETS.wordForest} alt="Word Forest" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full font-bold text-[13px] text-white flex items-center gap-1" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(135deg, #9B7EFF, #7652D9)', boxShadow: '0 3px 0 #5A3BB5' }}>
              <span>NEW</span>
            </div>
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[#7652D9] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>forest</span>
              </div>
              <span className="font-bold text-[14px] text-[#5A3800] uppercase tracking-wider" style={{ fontFamily: "'Fredoka'", textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>Word Forest</span>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-bold text-[26px] text-[#7652D9] leading-none mb-1" style={{ fontFamily: "'Fredoka'" }}>LEARN</h2>
                <p className="font-semibold text-[13px] text-[#9B8EC0]">Discover rare words</p>
              </div>
              <span className="font-bold text-[11px] text-[#7652D9] px-2.5 py-0.5 rounded-full" style={{ fontFamily: "'Fredoka'", background: '#F0E8FF', border: '2px solid #D4B5FF' }}>New!</span>
            </div>
            <button onClick={() => { audio.playLetterTap(2); onNavigate('worlds'); }} className="w-full h-14 text-white rounded-full font-bold text-[17px] flex items-center justify-center gap-2 active:translate-y-1 transition-all cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #9B7EFF, #7652D9)', boxShadow: '0 6px 0 #5A3BB5, 0 8px 16px rgba(118,82,217,0.25), inset 0 2px 0 rgba(255,255,255,0.3)' }}>
              <span>EXPLORE FOREST</span>
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
            </button>
          </div>
        </article>
      </div>

      {/* DAILY QUEST */}
      <section className="relative z-10 mt-8">
        <div className="kids-card p-4" style={{ border: '3px solid #4DA6FF' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[14px]" style={{ background: 'linear-gradient(135deg, #FFE066, #FFC928)', boxShadow: '0 2px 0 #D4A200' }}>
                <span className="material-symbols-outlined text-[#5A3800] text-[16px]">flag</span>
              </div>
              <h3 className="font-bold text-[16px] text-[#7652D9] uppercase tracking-wide" style={{ fontFamily: "'Fredoka'" }}>Daily Quest</h3>
            </div>
            <span className="font-semibold text-[11px] text-[#B8A0D0]">Refreshes in 08:44</span>
          </div>
          <p className="font-semibold text-[15px] text-[#2D1B69] mb-3">
            Find <span className="font-bold text-[#286BEA]" style={{ fontFamily: "'Fredoka'" }}>8 hidden nature words</span>
          </p>
          <div className="relative flex flex-col gap-1.5 mb-4">
            <div className="flex justify-between font-bold text-[13px]" style={{ fontFamily: "'Fredoka'" }}>
              <span className="text-[#7B8EC0]">Found: 5 / 8</span>
              <span className="text-[#286BEA]">62%</span>
            </div>
            <div className="w-full h-5 rounded-full overflow-hidden p-1" style={{ background: 'rgba(212,181,255,0.3)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: '62%', background: 'linear-gradient(90deg, #286BEA, #7652D9, #35C94A)', boxShadow: '0 0 8px rgba(40,107,234,0.3)' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-2xl mb-3" style={{ background: 'rgba(255,255,255,0.5)', border: '2px solid rgba(212,181,255,0.3)' }}>
            <span className="font-bold text-[13px] text-[#9B8EC0]" style={{ fontFamily: "'Fredoka'" }}>Bounty:</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-bold text-[15px] text-[#2D1B69]" style={{ fontFamily: "'Fredoka'" }}>
                <span className="material-symbols-outlined text-[#D4A200] text-[18px]">monetization_on</span> +25
              </div>
              <div className="flex items-center gap-1 font-bold text-[15px] text-[#2D1B69]" style={{ fontFamily: "'Fredoka'" }}>
                <span className="material-symbols-outlined text-[#FFC928] text-[18px]">star</span> +100 XP
              </div>
            </div>
          </div>
          <button onClick={() => { audio.playLetterTap(2); onStartLevel(activeLevelId || 24); }} className="w-full h-12 text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2 active:translate-y-1 transition-all cursor-pointer" style={{ fontFamily: "'Fredoka'", background: 'linear-gradient(180deg, #4DA6FF, #286BEA)', boxShadow: '0 5px 0 #1B4FBB, inset 0 2px 0 rgba(255,255,255,0.3)' }}>
            <span>RESUME QUEST</span>
          </button>
        </div>
      </section>

      {/* Mascot */}
      <section className="relative z-10 flex flex-col items-center mt-10">
        <div onClick={handleMascotTap} className="relative kids-card px-4 py-2.5 mb-3 max-w-[280px] text-center transform -rotate-1 cursor-pointer active:scale-95 transition-transform" style={{ border: '3px solid #D4B5FF' }}>
          <p className="text-[14px] text-[#2D1B69] font-bold" style={{ fontFamily: "'Quicksand'" }}>"{LOKI_QUOTES[quoteIndex]}"</p>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45" style={{ border: '0 3px 3px 0 solid #D4B5FF', borderRight: '3px solid #D4B5FF', borderBottom: '3px solid #D4B5FF' }}></div>
        </div>
        <div onClick={handleMascotTap} className={`relative w-28 h-28 flex items-center justify-center cursor-pointer transition-transform ${mascotBounce ? 'scale-110 -rotate-6' : 'hover:scale-105'}`}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4B5FF, #9B7EFF)', boxShadow: '0 6px 0 #7652D9' }}>
            <div className="w-20 h-20 rounded-full bg-[#7652D9] flex items-center justify-center relative overflow-hidden shadow-inner">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-[#2D1B69] rounded-full translate-x-0.5 -translate-y-0.5"></div></div>
                <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-[#2D1B69] rounded-full translate-x-0.5 -translate-y-0.5"></div></div>
              </div>
              <div className="absolute bottom-4 w-6 h-3 bg-[#FFC928] rounded-b-full"></div>
              <div className="absolute bottom-5 left-3 w-2.5 h-2 bg-[#FF9EC6] rounded-full opacity-80"></div>
              <div className="absolute bottom-5 right-3 w-2.5 h-2 bg-[#FF9EC6] rounded-full opacity-80"></div>
            </div>
          </div>
        </div>
        <div className="w-36 h-4 rounded-full -mt-2 blur-[2px]" style={{ background: 'rgba(118,82,217,0.15)' }}></div>
      </section>
    </div>
  );
};
