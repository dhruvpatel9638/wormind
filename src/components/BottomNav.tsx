import React from 'react';
import { Screen } from '../types';
import { audio } from '../utils/audio';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hasClaimableDaily?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  hasClaimableDaily = false,
}) => {
  const navItems: { id: Screen; label: string; icon: string; color: string; fillable?: boolean }[] = [
    { id: 'home', label: 'Home', icon: 'home', color: '#286BEA' },
    { id: 'worlds', label: 'Worlds', icon: 'explore', color: '#35C94A' },
    { id: 'daily', label: 'Daily', icon: 'local_fire_department', color: '#EF3B3B', fillable: true },
    { id: 'profile', label: 'Profile', icon: 'backpack', color: '#7652D9' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 pb-safe pointer-events-none">
      <div className="w-full px-3 pb-2">
        <div
          className="pointer-events-auto rounded-full p-1.5 flex items-center justify-around"
          style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            border: '3px solid rgba(212,181,255,0.5)',
            boxShadow: '0 -2px 16px rgba(118,82,217,0.12), 0 4px 0 rgba(212,181,255,0.3)',
          }}
        >
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { audio.playLetterTap(isActive ? 0 : 2); onNavigate(item.id); }}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full transition-all duration-200 cursor-pointer ${
                  isActive ? 'text-white scale-105' : 'text-[#9B8EC0] active:scale-95'
                }`}
                style={isActive ? {
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}DD)`,
                  boxShadow: `0 4px 12px ${item.color}40`,
                  fontFamily: "'Fredoka'",
                } : { fontFamily: "'Fredoka'" }}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive && item.fillable ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >{item.icon}</span>
                <span className="text-[13px] font-semibold tracking-wide">{item.label}</span>

                {item.id === 'daily' && hasClaimableDaily && (
                  <span className="absolute -top-1 -right-0.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF3B3B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#EF3B3B] border-2 border-white"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
