/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Screen, PlayerState } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ShopModal } from './components/ShopModal';
import { HomeView } from './views/HomeView';
import { WorldsView } from './views/WorldsView';
import { GameView } from './views/GameView';
import { DailyView } from './views/DailyView';
import { ProfileView } from './views/ProfileView';
import { audio } from './utils/audio';

const STORAGE_KEY = 'wormind_player_state_v1';

// ===== FUN LOADING / SPLASH SCREEN =====
function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [mascotBounce, setMascotBounce] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onFinish, 400);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    const bounceTimer = setInterval(() => {
      setMascotBounce(true);
      setTimeout(() => setMascotBounce(false), 300);
    }, 1500);

    return () => {
      clearInterval(timer);
      clearInterval(bounceTimer);
    };
  }, [onFinish]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(170deg, #A8E6FF 0%, #D4B5FF 30%, #FFD6E8 60%, #FFF3B0 100%)',
      }}
    >
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-6 h-6 rounded-full bg-yellow-300/40 anim-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-[15%] right-[15%] w-8 h-8 rounded-full bg-purple-300/40 anim-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-[60%] left-[8%] w-10 h-10 rounded-full bg-pink-300/30 anim-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[70%] right-[10%] w-6 h-6 rounded-full bg-blue-300/40 anim-float" style={{ animationDelay: '0.3s' }}></div>
        <div className="absolute top-[40%] left-[80%] w-8 h-8 rounded-full bg-green-300/30 anim-float" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-[20%] left-[25%] w-7 h-7 rounded-full bg-yellow-200/40 anim-float" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute top-[25%] left-[50%] w-5 h-5 rounded-full bg-indigo-300/40 anim-float" style={{ animationDelay: '0.6s' }}></div>
        <div className="absolute bottom-[35%] right-[30%] w-9 h-9 rounded-full bg-pink-200/40 anim-float" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Mascot */}
      <div className={`relative mb-6 transition-transform duration-300 ${mascotBounce ? 'scale-110 -rotate-6' : ''}`}>
        <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4B5FF 0%, #9B7EFF 100%)', boxShadow: '0 8px 0 #7652D9, 0 12px 30px rgba(118,82,217,0.3)' }}>
          <div className="w-26 h-26 rounded-full bg-[#7652D9] flex items-center justify-center relative overflow-hidden" style={{ width: '104px', height: '104px' }}>
            {/* Eyes */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#2D1B69] rounded-full translate-x-0.5 -translate-y-0.5"></div>
              </div>
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-[#2D1B69] rounded-full translate-x-0.5 -translate-y-0.5"></div>
              </div>
            </div>
            {/* Mouth */}
            <div className="absolute bottom-5 w-8 h-4 bg-[#FFC928] rounded-b-full"></div>
            {/* Cheeks */}
            <div className="absolute bottom-7 left-4 w-3 h-2 bg-[#FF9EC6] rounded-full opacity-80"></div>
            <div className="absolute bottom-7 right-4 w-3 h-2 bg-[#FF9EC6] rounded-full opacity-80"></div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1
        className="font-fredoka text-[42px] font-bold tracking-tight mb-1 text-center"
        style={{
          fontFamily: "'Fredoka', cursive",
          background: 'linear-gradient(135deg, #7652D9, #286BEA, #35C94A, #FFC928)',
          backgroundSize: '200% 200%',
          animation: 'rainbow-bg 3s ease infinite',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 4px rgba(118,82,217,0.3))',
        }}
      >
        WorMind
      </h1>
      <p
        className="text-[16px] font-semibold mb-8 tracking-wide"
        style={{ fontFamily: "'Quicksand', sans-serif", color: '#7652D9' }}
      >
        Play · Think · Discover!
      </p>

      {/* Loading bar */}
      <div className="w-56 h-5 rounded-full overflow-hidden p-1" style={{ background: 'rgba(255,255,255,0.5)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(progress, 100)}%`,
            background: 'linear-gradient(90deg, #286BEA, #7652D9, #35C94A, #FFC928)',
            backgroundSize: '200% 100%',
            animation: 'rainbow-bg 2s linear infinite',
            boxShadow: '0 0 8px rgba(118,82,217,0.4)',
          }}
        ></div>
      </div>

      {/* Bouncy dots */}
      <div className="flex items-center gap-2 mt-4">
        {['#286BEA', '#7652D9', '#35C94A', '#FFC928'].map((color, i) => (
          <div
            key={i}
            className="loading-dot w-3 h-3 rounded-full"
            style={{ background: color }}
          ></div>
        ))}
      </div>

      <p className="text-[13px] mt-4 font-semibold" style={{ fontFamily: "'Quicksand'", color: '#9B7EFF' }}>
        Loading word adventures...
      </p>
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [activeLevelId, setActiveLevelId] = useState<number>(24);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);

  // Load saved state or default
  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return {
      coins: 1240,
      stars: 380,
      hearts: 5,
      maxHearts: 5,
      heartSeconds: 252, // 04:12
      streak: 5,
      streakLvl: 2,
      streakMax: 7,
      claimedDays: [1, 2, 3, 4],
      hasClaimedDay5: false,
      hintsAvailable: 2,
      equippedHat: 'none',
      unlockedHats: ['none', 'sunglasses'],
      solvedCount: 23,
      wordsDiscovered: 148,
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
    };
  });

  // Save state on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerState));
    audio.setMuted(!playerState.soundEnabled);
  }, [playerState]);

  // Countdown timer for hearts
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayerState((prev) => {
        if (prev.hearts >= prev.maxHearts) {
          return { ...prev, heartSeconds: 252 };
        }
        if (prev.heartSeconds <= 1) {
          return {
            ...prev,
            hearts: Math.min(prev.maxHearts, prev.hearts + 1),
            heartSeconds: 300,
          };
        }
        return { ...prev, heartSeconds: prev.heartSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setCurrentScreen('game');
  };

  const handleCompleteLevel = (levelId: number, starsEarned: number, coinsEarned: number) => {
    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      stars: prev.stars + starsEarned,
      solvedCount: prev.solvedCount + 1,
      wordsDiscovered: prev.wordsDiscovered + 6,
    }));
    setCurrentScreen('worlds');
  };

  const handleAddCoins = (amount: number) => {
    setPlayerState((prev) => ({ ...prev, coins: prev.coins + amount }));
  };

  const handleDeductCoins = (amount: number): boolean => {
    if (playerState.coins < amount) return false;
    setPlayerState((prev) => ({ ...prev, coins: prev.coins - amount }));
    return true;
  };

  const handleAddHints = (amount: number) => {
    setPlayerState((prev) => ({
      ...prev,
      hintsAvailable: prev.hintsAvailable + amount,
    }));
  };

  const handleRefillHearts = () => {
    setPlayerState((prev) => ({
      ...prev,
      hearts: prev.maxHearts,
      heartSeconds: 252,
    }));
  };

  const handleClaimDay5 = () => {
    setPlayerState((prev) => ({
      ...prev,
      hasClaimedDay5: true,
      claimedDays: [...prev.claimedDays, 5],
    }));
  };

  const handleUpdateHat = (hat: PlayerState['equippedHat']) => {
    setPlayerState((prev) => ({ ...prev, equippedHat: hat }));
  };

  const handleToggleSound = () => {
    setPlayerState((prev) => {
      const next = !prev.soundEnabled;
      audio.setMuted(!next);
      return { ...prev, soundEnabled: next };
    });
  };

  const handleToggleHaptics = () => {
    setPlayerState((prev) => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }));
  };

  const handleResetProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayerState({
      coins: 1240,
      stars: 380,
      hearts: 5,
      maxHearts: 5,
      heartSeconds: 252,
      streak: 5,
      streakLvl: 2,
      streakMax: 7,
      claimedDays: [1, 2, 3, 4],
      hasClaimedDay5: false,
      hintsAvailable: 2,
      equippedHat: 'none',
      unlockedHats: ['none', 'sunglasses'],
      solvedCount: 23,
      wordsDiscovered: 148,
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
    });
    alert('Game progress reset!');
  };

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen onFinish={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-[#EBF4FF]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
      {/* Centered Mobile App Container */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative select-none bg-gradient-to-b from-[#A8E6FF]/30 via-[#D4B5FF]/20 to-[#FFF3B0]/30 shadow-2xl overflow-x-hidden border-x border-white/50">
        {/* Top Persistent HUD Header */}
        <Header
          coins={playerState.coins}
          hearts={playerState.hearts}
          maxHearts={playerState.maxHearts}
          heartCountdown={formatCountdown(playerState.heartSeconds)}
          level={activeLevelId}
          onOpenShop={() => setIsShopOpen(true)}
          onRefillHearts={handleRefillHearts}
        />

        {/* Screen Views */}
        <main className="flex-1 w-full overflow-x-hidden">
          {currentScreen === 'home' && (
            <HomeView
              onStartLevel={handleStartLevel}
              onNavigate={setCurrentScreen}
              activeLevelId={activeLevelId}
            />
          )}

          {currentScreen === 'worlds' && (
            <WorldsView
              onStartLevel={handleStartLevel}
              activeLevelId={activeLevelId}
            />
          )}

          {currentScreen === 'game' && (
            <GameView
              levelId={activeLevelId}
              onExit={() => setCurrentScreen('home')}
              onCompleteLevel={handleCompleteLevel}
              coins={playerState.coins}
              onDeductCoins={handleDeductCoins}
            />
          )}

          {currentScreen === 'daily' && (
            <DailyView
              hasClaimedDay5={playerState.hasClaimedDay5}
              onClaimDay5={handleClaimDay5}
              onAddCoins={handleAddCoins}
              onAddHints={handleAddHints}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileView
              playerState={playerState}
              onUpdateHat={handleUpdateHat}
              onToggleSound={handleToggleSound}
              onToggleHaptics={handleToggleHaptics}
              onResetProgress={handleResetProgress}
            />
          )}
        </main>

        {/* Bottom Floating Navigation (shown on home, worlds, daily, profile) */}
        {currentScreen !== 'game' && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            hasClaimableDaily={!playerState.hasClaimedDay5}
          />
        )}

        {/* Interactive Shop Modal */}
        <ShopModal
          isOpen={isShopOpen}
          onClose={() => setIsShopOpen(false)}
          onAddCoins={handleAddCoins}
          onRefillHearts={handleRefillHearts}
          currentHearts={playerState.hearts}
        />
      </div>
    </div>
  );
}
