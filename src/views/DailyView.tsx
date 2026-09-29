import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ASSETS } from '../data/gameData';
import { audio } from '../utils/audio';

interface DailyViewProps {
  hasClaimedDay5: boolean;
  onClaimDay5: () => void;
  onAddCoins: (amount: number) => void;
  onAddHints: (amount: number) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  hasClaimedDay5,
  onClaimDay5,
  onAddCoins,
  onAddHints,
}) => {
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [doubleClaimed, setDoubleClaimed] = useState<boolean>(false);
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);
  const [isSpinningWheel, setIsSpinningWheel] = useState<boolean>(false);
  const [wheelDegree, setWheelDegree] = useState<number>(0);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);

  const handleClaim = () => {
    if (hasClaimedDay5) return;

    audio.playCoin();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#286BEA', '#FFC928', '#35C94A', '#7652D9', '#EF3B3B'],
    });

    onClaimDay5();
    onAddCoins(150);
    onAddHints(2);
    setShowClaimModal(true);
  };

  const handleWatchAd = () => {
    if (doubleClaimed) return;
    setIsWatchingAd(true);
    audio.playLetterTap(1);

    setTimeout(() => {
      setIsWatchingAd(false);
      setDoubleClaimed(true);
      onAddCoins(150);
      audio.playVictory();
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
      });
    }, 2000);
  };

  const handleSpinWheel = () => {
    if (isSpinningWheel) return;
    setIsSpinningWheel(true);
    audio.playSparkle();

    const randomAdditional = 1440 + Math.floor(Math.random() * 360);
    setWheelDegree((prev) => prev + randomAdditional);

    setTimeout(() => {
      setIsSpinningWheel(false);
      const prizes = ['+50 Coins', '2x Hints', '+100 Coins', 'Rare Loki Pin'];
      const won = prizes[Math.floor(Math.random() * prizes.length)];
      setWheelPrize(won);
      audio.playVictory();

      if (won.includes('50')) onAddCoins(50);
      else if (won.includes('100')) onAddCoins(100);
      else if (won.includes('Hints')) onAddHints(2);
    }, 3200);
  };

  return (
    <div className="flex flex-col w-full px-4 pb-28 pt-16 select-none max-w-[430px] mx-auto space-y-4">
      {/* Streak & Reset Status Banner */}
      <div
        className="relative rounded-3xl p-4 overflow-hidden flex flex-col gap-2"
        style={{
          background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
          border: '1px solid rgba(239,59,59,0.2)',
          boxShadow: '0 6px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FFC928]/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-[#7652D9]/10 rounded-full blur-lg pointer-events-none"></div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#EF3B3B]/20 text-[#EF3B3B]" style={{ boxShadow: '0 3px 0 rgba(198,40,40,0.3)' }}>
              <span className="material-symbols-outlined text-[24px] animate-bounce" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF3B3B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#EF3B3B]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-rubik font-black text-[18px] text-[#EEF1FF]">
                  5 DAY STREAK!
                </span>
                <span className="font-rubik font-bold text-[10px] bg-[#FFC928] text-[#172858] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  On Fire!
                </span>
              </div>
              <p className="font-nunito font-semibold text-[11px] text-[#7B8AB8] flex items-center gap-1 mt-0.5">
                <span className="material-symbols-outlined text-[13px]">schedule</span> Resets in 14h 22m 10s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#253D75] px-2.5 py-1.5 rounded-full border border-[#FFC928]/15">
            <span className="material-symbols-outlined text-[#FFC928] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
            <span className="font-rubik font-bold text-[12px] text-[#FFC928]">LVL 2</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full rounded-full h-3.5 p-0.5 shadow-inner mt-1 relative overflow-hidden" style={{ background: 'rgba(239,59,59,0.1)' }}>
          <div className="bg-gradient-to-r from-[#FFC928] to-[#EF3B3B] h-full rounded-full w-[71%] shadow-sm relative transition-all duration-700">
            <div className="absolute inset-x-0 top-0 h-[30%] bg-white/20 rounded-full"></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] font-rubik font-bold text-[#7B8AB8]">
          <span>Day 1</span>
          <span className="text-[#4D8AFF]">5/7 Days Towards Mega Vault</span>
          <span>Day 7</span>
        </div>
      </div>

      {/* Mascot Loki Celebration & Speech Bubble */}
      <div className="relative flex items-end gap-3 pt-1">
        <div className="relative w-24 h-24 shrink-0 animate-[bounce_3s_ease-in-out_infinite]">
          <img
            alt="Loki The Word Scout"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_6px_rgba(0,0,0,0.3)]"
            src={ASSETS.lokiDaily}
          />
          <div className="absolute bottom-0 left-2 right-2 h-3 bg-[#7652D9]/10 rounded-full blur-sm -z-10"></div>
        </div>

        <div
          className="relative flex-1 p-3.5 rounded-3xl rounded-bl-none flex flex-col justify-center"
          style={{
            background: 'linear-gradient(145deg, #1E3468 0%, #253D75 100%)',
            border: '1px solid rgba(118,82,217,0.2)',
            boxShadow: '0 4px 0 #0E1A3A',
          }}
        >
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-rubik font-bold text-[13px] text-[#9B7EFF]">
              Loki The Word Scout
            </span>
            <span className="material-symbols-outlined text-[#FFC928] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>
          <p className="font-nunito font-semibold text-[13px] text-[#EEF1FF] leading-tight">
            "Woohoo! Day 5 is unlocked! Keep the flame alive to grab my legendary explorer hat!"
          </p>
        </div>
      </div>

      {/* 7-Day Reward Trail Track */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-rubik font-black text-[16px] text-[#EEF1FF] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#4D8AFF] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_month
            </span>
            7-Day Reward Trail
          </h2>
          <span className="font-rubik font-bold text-[11px] text-[#4D8AFF] bg-[#286BEA]/15 px-2.5 py-0.5 rounded-full border border-[#286BEA]/15">
            Week 1
          </span>
        </div>

        {/* Days 1-6 Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* DAY 1: CLAIMED */}
          <div
            className="relative rounded-2xl p-2 flex flex-col items-center justify-between h-28 opacity-60"
            style={{ background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(53,201,74,0.15)', boxShadow: '0 4px 0 #0E1A3A' }}
          >
            <div className="w-full flex justify-between items-center">
              <span className="font-nunito font-bold text-[10px] text-[#7B8AB8]">DAY 1</span>
              <span className="material-symbols-outlined text-[16px] text-[#35C94A]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#253D75] flex items-center justify-center text-[18px]">
              <span className="material-symbols-outlined text-[#D4A200] text-[20px]">monetization_on</span>
            </div>
            <span className="font-rubik font-bold text-[11px] text-[#7B8AB8] line-through">+50 Coins</span>
            <div className="absolute inset-0 bg-[#172858]/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="font-rubik font-bold text-[9px] text-[#7B8AB8] bg-[#253D75]/90 px-1.5 py-0.5 rounded-full shadow-xs">
                CLAIMED
              </span>
            </div>
          </div>

          {/* DAY 2: CLAIMED */}
          <div
            className="relative rounded-2xl p-2 flex flex-col items-center justify-between h-28 opacity-60"
            style={{ background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(53,201,74,0.15)', boxShadow: '0 4px 0 #0E1A3A' }}
          >
            <div className="w-full flex justify-between items-center">
              <span className="font-nunito font-bold text-[10px] text-[#7B8AB8]">DAY 2</span>
              <span className="material-symbols-outlined text-[16px] text-[#35C94A]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#253D75] flex items-center justify-center text-[18px]">
              <span className="material-symbols-outlined text-[#D4A200] text-[20px]">monetization_on</span>
            </div>
            <span className="font-rubik font-bold text-[11px] text-[#7B8AB8] line-through">+80 Coins</span>
            <div className="absolute inset-0 bg-[#172858]/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="font-rubik font-bold text-[9px] text-[#7B8AB8] bg-[#253D75]/90 px-1.5 py-0.5 rounded-full shadow-xs">
                CLAIMED
              </span>
            </div>
          </div>

          {/* DAY 3: CLAIMED */}
          <div
            className="relative rounded-2xl p-2 flex flex-col items-center justify-between h-28 opacity-60"
            style={{ background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(53,201,74,0.15)', boxShadow: '0 4px 0 #0E1A3A' }}
          >
            <div className="w-full flex justify-between items-center">
              <span className="font-nunito font-bold text-[10px] text-[#7B8AB8]">DAY 3</span>
              <span className="material-symbols-outlined text-[16px] text-[#35C94A]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#253D75] flex items-center justify-center text-[18px]">
              <span className="material-symbols-outlined text-[#FFC928] text-[20px]">lightbulb</span>
            </div>
            <span className="font-rubik font-bold text-[11px] text-[#7B8AB8] line-through">1 Hint</span>
            <div className="absolute inset-0 bg-[#172858]/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="font-rubik font-bold text-[9px] text-[#7B8AB8] bg-[#253D75]/90 px-1.5 py-0.5 rounded-full shadow-xs">
                CLAIMED
              </span>
            </div>
          </div>

          {/* DAY 4: CLAIMED */}
          <div
            className="relative rounded-2xl p-2 flex flex-col items-center justify-between h-28 opacity-60"
            style={{ background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(53,201,74,0.15)', boxShadow: '0 4px 0 #0E1A3A' }}
          >
            <div className="w-full flex justify-between items-center">
              <span className="font-nunito font-bold text-[10px] text-[#7B8AB8]">DAY 4</span>
              <span className="material-symbols-outlined text-[16px] text-[#35C94A]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#253D75] flex items-center justify-center text-[18px]">
              <span className="material-symbols-outlined text-[#D4A200] text-[20px]">monetization_on</span>
            </div>
            <span className="font-rubik font-bold text-[11px] text-[#7B8AB8] line-through">+100 Coins</span>
            <div className="absolute inset-0 bg-[#172858]/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="font-rubik font-bold text-[9px] text-[#7B8AB8] bg-[#253D75]/90 px-1.5 py-0.5 rounded-full shadow-xs">
                CLAIMED
              </span>
            </div>
          </div>

          {/* DAY 5: TODAY (SUPER HIGHLIGHTED) */}
          <div
            onClick={handleClaim}
            className={`relative col-span-2 rounded-2xl p-2.5 flex flex-col justify-between h-28 overflow-hidden transition-all cursor-pointer ${
              hasClaimedDay5
                ? ''
                : 'scale-[1.02]'
            }`}
            style={
              hasClaimedDay5
                ? { background: 'rgba(53,201,74,0.1)', border: '2px solid #35C94A', boxShadow: '0 4px 0 #218A30' }
                : { background: 'linear-gradient(135deg, #FFC928 0%, #D4A200 100%)', border: '2px solid #FFC928', boxShadow: '0 5px 0 #D4A200, 0 0 20px rgba(255,201,40,0.3)' }
            }
          >
            <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/15 rounded-t-2xl pointer-events-none"></div>

            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full shadow-xs">
                <span className="material-symbols-outlined text-[#EF3B3B] text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span className={`font-rubik font-bold text-[10px] ${hasClaimedDay5 ? 'text-[#EEF1FF]' : 'text-[#172858]'}`}>
                  TODAY • DAY 5
                </span>
              </div>
              <span className={`font-rubik font-extrabold text-[10px] uppercase tracking-wider ${hasClaimedDay5 ? 'text-[#35C94A]' : 'text-[#172858] animate-pulse'}`}>
                {hasClaimedDay5 ? 'CLAIMED' : 'READY!'}
              </span>
            </div>

            <div className="flex items-center justify-around my-1 relative z-10">
              <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full shadow-xs">
                <span className="material-symbols-outlined text-[#172858] text-[16px]">monetization_on</span>
                <span className={`font-rubik font-bold text-[13px] ${hasClaimedDay5 ? 'text-[#EEF1FF]' : 'text-[#172858]'}`}>+150</span>
              </div>
              <span className={`font-rubik font-bold text-[13px] ${hasClaimedDay5 ? 'text-[#EEF1FF]' : 'text-[#172858]'}`}>+</span>
              <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full shadow-xs">
                <span className="material-symbols-outlined text-[#172858] text-[16px]">lightbulb</span>
                <span className={`font-rubik font-bold text-[13px] ${hasClaimedDay5 ? 'text-[#EEF1FF]' : 'text-[#172858]'}`}>2 Hints</span>
              </div>
            </div>

            <div className="text-center relative z-10">
              <span className={`font-nunito font-bold text-[11px] tracking-wide ${hasClaimedDay5 ? 'text-[#7B8AB8]' : 'text-[#172858]'}`}>
                {hasClaimedDay5 ? 'Enjoy your reward!' : 'Tap to collect!'}
              </span>
            </div>
          </div>

          {/* DAY 6: LOCKED */}
          <div
            className="relative rounded-2xl p-2 flex flex-col items-center justify-between h-28 opacity-50"
            style={{ background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(40,107,234,0.1)', boxShadow: '0 4px 0 #0E1A3A' }}
          >
            <div className="w-full flex justify-between items-center">
              <span className="font-nunito font-bold text-[10px] text-[#7B8AB8]">DAY 6</span>
              <span className="material-symbols-outlined text-[#7B8AB8] text-[14px]">lock</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#253D75] flex items-center justify-center text-[18px]">
              <span className="material-symbols-outlined text-[#FFC928] text-[20px]">inventory_2</span>
            </div>
            <div className="text-center leading-none">
              <p className="font-rubik font-bold text-[11px] text-[#7B8AB8]">+200 Coins</p>
              <p className="font-nunito text-[9px] text-[#7B8AB8]/60 mt-0.5">+50 XP</p>
            </div>
          </div>
        </div>

        {/* DAY 7: GRAND MILESTONE HERO CARD */}
        <div
          className="relative rounded-3xl p-4 overflow-hidden text-white flex flex-col gap-2 mt-1"
          style={{
            background: 'linear-gradient(135deg, #7652D9 0%, #5A3BB5 50%, #286BEA 100%)',
            border: '2px solid rgba(155,126,255,0.3)',
            boxShadow: '0 6px 0 #0E1A3A, 0 0 30px rgba(118,82,217,0.2)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 pointer-events-none rounded-t-3xl"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 bg-[#FFC928] text-[#172858] px-3 py-1 rounded-full shadow-xs">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                military_tech
              </span>
              <span className="font-rubik font-black text-[11px] tracking-wide">
                FINAL DAY 7 JACKPOT
              </span>
            </div>
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-rubik font-bold">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>In 2 Days</span>
            </div>
          </div>

          <div className="flex items-center gap-3 py-1 relative z-10">
            <div className="relative w-20 h-20 shrink-0">
              <img
                alt="Ultra Word Chest"
                className="w-full h-full object-contain filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)] animate-pulse"
                src={ASSETS.ultraChest}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <h3 className="font-rubik font-black text-[16px] text-[#FFC928] leading-tight">
                ULTRA WORD CHEST
              </h3>
              <p className="font-nunito text-[12px] text-white/70 leading-snug">
                Grand streak milestone! Unlocks exclusive character cosmetic and massive riches.
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="font-rubik font-bold text-[10px] bg-white/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#FFC928]">monetization_on</span> 500 Coins
                </span>
                <span className="font-rubik font-bold text-[10px] bg-white/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-[#FFC928]">star</span> 300 XP
                </span>
                <span className="font-rubik font-bold text-[10px] bg-[#FFC928] text-[#172858] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">military_tech</span> Loki Hat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Claim CTA */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={handleClaim}
          disabled={hasClaimedDay5}
          className={`group relative w-full h-14 rounded-full p-0 flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
            hasClaimedDay5
              ? 'bg-[#35C94A] text-white opacity-90'
              : 'bg-[#FFC928] text-[#172858] active:translate-y-1'
          }`}
          style={
            hasClaimedDay5
              ? { boxShadow: '0 3px 0 #218A30' }
              : { boxShadow: '0 5px 0 #D4A200, 0 8px 16px rgba(255,201,40,0.3)' }
          }
        >
          <div className="absolute inset-x-3 top-0 h-1/2 bg-white/25 rounded-t-full pointer-events-none"></div>
          <div className="flex items-center gap-2 font-rubik font-black text-[16px] tracking-wide relative z-10">
            <span className="material-symbols-outlined text-[24px]">
              {hasClaimedDay5 ? 'task_alt' : 'redeem'}
            </span>
            <span>
              {hasClaimedDay5 ? 'DAY 5 REWARD CLAIMED!' : 'CLAIM DAY 5 REWARD!'}
            </span>
          </div>
        </button>

        {/* Secondary 2X Video Bonus */}
        <button
          onClick={handleWatchAd}
          disabled={doubleClaimed || isWatchingAd}
          className={`relative w-full h-11 rounded-full p-0 flex items-center justify-center cursor-pointer transition-all active:translate-y-0.5 ${
            doubleClaimed ? 'opacity-70' : ''
          }`}
          style={{
            background: doubleClaimed ? 'rgba(30,52,104,0.6)' : 'rgba(30,52,104,0.8)',
            border: '1px solid rgba(40,107,234,0.2)',
            boxShadow: '0 3px 0 #0E1A3A',
          }}
        >
          <div className="flex items-center gap-1.5 font-rubik font-bold text-[12px] text-[#EEF1FF]">
            <span className="material-symbols-outlined text-[#9B7EFF] text-[18px]">
              smart_display
            </span>
            <span>
              {isWatchingAd
                ? 'Watching Sponsor Clip...'
                : doubleClaimed
                ? '2X BONUS APPLIED (+150 COINS)'
                : 'WATCH VIDEO FOR'}
            </span>
            {!doubleClaimed && !isWatchingAd && (
              <span className="bg-[#FFC928] text-[#172858] px-2 py-0.5 rounded-full text-[10px] font-black">
                2X BONUS (+150 COINS)
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Daily Word Wheel / Fortune Spin */}
      <div
        className="relative rounded-3xl p-4 flex items-center justify-between gap-3"
        style={{
          background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
          border: '1px solid rgba(40,107,234,0.2)',
          boxShadow: '0 4px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 relative transition-transform duration-700 ease-out"
            style={{
              background: 'linear-gradient(135deg, #286BEA 0%, #7652D9 100%)',
              transform: `rotate(${wheelDegree}deg)`,
              boxShadow: '0 3px 0 #0E1A3A',
            }}
          >
            <span className="material-symbols-outlined text-[26px]">rotate_right</span>
            <span className="absolute -top-1 -right-1 bg-[#FFC928] text-[#172858] text-[9px] font-black px-1.5 py-0.2 rounded-full border border-[#D4A200]">
              NEW
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <h3 className="font-rubik font-bold text-[14px] text-[#EEF1FF]">
                Daily Word Wheel
              </h3>
              <span className="material-symbols-outlined text-[#FFC928] text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
            </div>
            <p className="font-nunito text-[12px] text-[#7B8AB8] line-clamp-1">
              {wheelPrize ? `Won: ${wheelPrize}` : 'Spin for rare avatar pins, tiles & hints!'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSpinWheel}
          disabled={isSpinningWheel}
          className="shrink-0 bg-[#286BEA] text-white font-rubik font-bold text-[11px] px-3.5 py-2.5 rounded-full active:translate-y-0.5 transition-all cursor-pointer border border-[#4D8AFF]/30"
          style={{ boxShadow: '0 3px 0 #1B4FBB, 0 0 12px rgba(40,107,234,0.3)' }}
        >
          {isSpinningWheel ? 'SPINNING...' : 'SPIN (1 FREE)'}
        </button>
      </div>

      {/* Claimed Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="rounded-3xl p-6 w-full max-w-xs shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            style={{
              background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
              border: '4px solid #35C94A',
              boxShadow: '0 8px 0 #0E1A3A, 0 0 40px rgba(53,201,74,0.2)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-[#FFC928] text-[#172858] flex items-center justify-center shadow-[0_5px_0_#D4A200] -mt-12 ring-4 ring-[#172858] animate-bounce">
              <span className="material-symbols-outlined text-[32px] text-[#172858]">emoji_events</span>
            </div>

            <h3 className="font-rubik font-black text-[22px] text-[#4D8AFF] mt-3">
              DAY 5 CLAIMED!
            </h3>
            <p className="font-nunito text-[13px] text-[#7B8AB8] mt-1">
              Awesome streak! You added to your treasury:
            </p>

            <div className="grid grid-cols-2 gap-2 w-full my-4">
              <div className="p-2.5 rounded-2xl flex items-center gap-2" style={{ background: 'rgba(255,201,40,0.1)', border: '1px solid rgba(255,201,40,0.15)' }}>
                <span className="material-symbols-outlined text-[24px] text-[#D4A200]">monetization_on</span>
                <div className="flex flex-col text-left">
                  <span className="font-rubik font-black text-[15px] text-[#EEF1FF]">+150</span>
                  <span className="font-nunito text-[10px] text-[#7B8AB8]">Coins</span>
                </div>
              </div>
              <div className="p-2.5 rounded-2xl flex items-center gap-2" style={{ background: 'rgba(118,82,217,0.1)', border: '1px solid rgba(118,82,217,0.15)' }}>
                <span className="material-symbols-outlined text-[24px] text-[#FFC928]">lightbulb</span>
                <div className="flex flex-col text-left">
                  <span className="font-rubik font-black text-[15px] text-[#EEF1FF]">+2</span>
                  <span className="font-nunito text-[10px] text-[#7B8AB8]">Hints</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowClaimModal(false)}
              className="w-full h-12 bg-[#35C94A] text-white rounded-full font-rubik font-bold text-[15px] shadow-[0_4px_0_#218A30] active:translate-y-1 transition-all cursor-pointer"
            >
              AWESOME!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
