import React, { useState } from 'react';
import { PlayerState } from '../types';
import { ASSETS, VOCABULARY_JOURNAL } from '../data/gameData';
import { audio } from '../utils/audio';

interface ProfileViewProps {
  playerState: PlayerState;
  onUpdateHat: (hat: PlayerState['equippedHat']) => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
  onResetProgress: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  playerState,
  onUpdateHat,
  onToggleSound,
  onToggleHaptics,
  onResetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'journal' | 'settings'>('wardrobe');
  const [selectedWord, setSelectedWord] = useState<{ word: string; definition: string; world: string } | null>(null);

  const hats: { id: PlayerState['equippedHat']; name: string; icon: string; locked: boolean; unlockHint?: string }[] = [
    { id: 'none', name: 'Scout Scarf', icon: 'checkroom', locked: false },
    { id: 'explorer', name: 'Loki Explorer Hat', icon: 'backpack', locked: !playerState.unlockedHats.includes('explorer'), unlockHint: 'Day 7 Streak Jackpot' },
    { id: 'crown', name: 'Word Master Crown', icon: 'military_tech', locked: !playerState.unlockedHats.includes('crown'), unlockHint: 'Earn 300 Stars' },
    { id: 'sunglasses', name: 'Beach Sunglasses', icon: 'sunglasses', locked: false },
  ];

  return (
    <div className="flex flex-col w-full px-4 pb-28 pt-16 select-none max-w-[430px] mx-auto space-y-4">
      {/* Player Hero Card */}
      <div
        className="rounded-3xl p-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
          border: '1px solid rgba(40,107,234,0.2)',
          boxShadow: '0 6px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="relative w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-[#9B7EFF]/30 shrink-0"
          style={{ background: 'linear-gradient(135deg, #7652D9 0%, #286BEA 100%)', boxShadow: '0 4px 0 #5A3BB5' }}
        >
          <span className="material-symbols-outlined text-[42px] text-white">smart_toy</span>
          {/* Hat Accessory Overlay */}
          {playerState.equippedHat === 'explorer' && (
            <span className="material-symbols-outlined absolute -top-3 -right-2 text-[24px] text-[#FFC928]">backpack</span>
          )}
          {playerState.equippedHat === 'crown' && (
            <span className="material-symbols-outlined absolute -top-4 -right-1 text-[24px] text-[#FFC928]">military_tech</span>
          )}
          {playerState.equippedHat === 'sunglasses' && (
            <span className="material-symbols-outlined absolute -top-1 -right-1 text-[22px] text-[#286BEA]">sunglasses</span>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-1.5">
            <h2 className="font-rubik font-black text-[18px] text-[#EEF1FF]">
              Captain Loki
            </h2>
            <span className="material-symbols-outlined text-[#4D8AFF] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          </div>

          <p className="font-nunito font-bold text-[12px] text-[#9B7EFF]">
            Level 34 Master Lexicographer
          </p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-[13px] font-rubik font-bold text-[#EEF1FF]">
              <span className="material-symbols-outlined text-[16px] text-[#FFC928]">monetization_on</span>
              <span>{playerState.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-rubik font-bold text-[#EEF1FF]">
              <span className="material-symbols-outlined text-[16px] text-[#FFC928]">star</span>
              <span>{playerState.stars}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl" style={{ background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(40,107,234,0.15)' }}>
        <button
          onClick={() => {
            audio.playLetterTap(1);
            setActiveTab('wardrobe');
          }}
          className={`py-2 rounded-xl font-rubik font-bold text-[12px] transition-all cursor-pointer ${
            activeTab === 'wardrobe'
              ? 'bg-[#286BEA] text-white shadow-xs'
              : 'text-[#7B8AB8] hover:text-[#EEF1FF]'
          }`}
        >
          Wardrobe
        </button>

        <button
          onClick={() => {
            audio.playLetterTap(2);
            setActiveTab('journal');
          }}
          className={`py-2 rounded-xl font-rubik font-bold text-[12px] transition-all cursor-pointer ${
            activeTab === 'journal'
              ? 'bg-[#286BEA] text-white shadow-xs'
              : 'text-[#7B8AB8] hover:text-[#EEF1FF]'
          }`}
        >
          Journal
        </button>

        <button
          onClick={() => {
            audio.playLetterTap(3);
            setActiveTab('settings');
          }}
          className={`py-2 rounded-xl font-rubik font-bold text-[12px] transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-[#286BEA] text-white shadow-xs'
              : 'text-[#7B8AB8] hover:text-[#EEF1FF]'
          }`}
        >
          Settings
        </button>
      </div>

      {/* TAB 1: WARDROBE */}
      {activeTab === 'wardrobe' && (
        <div className="space-y-3">
          <div
            className="rounded-3xl p-4"
            style={{
              background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
              border: '1px solid rgba(40,107,234,0.2)',
              boxShadow: '0 4px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <h3 className="font-rubik font-bold text-[15px] text-[#EEF1FF] mb-1">
              Loki's Gear &amp; Accessories
            </h3>
            <p className="font-nunito text-[12px] text-[#7B8AB8] mb-3">
              Equip unlocked cosmetic items found across your journey.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {hats.map((hat) => {
                const isEquipped = playerState.equippedHat === hat.id;
                return (
                  <div
                    key={hat.id}
                    onClick={() => {
                      if (hat.locked) {
                        alert(`${hat.name} is locked! ${hat.unlockHint}`);
                        return;
                      }
                      audio.playLetterTap(2);
                      onUpdateHat(hat.id);
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer ${
                      isEquipped
                        ? ''
                        : hat.locked
                        ? 'opacity-40'
                        : ''
                    }`}
                    style={
                      isEquipped
                        ? { background: 'rgba(40,107,234,0.15)', border: '2px solid #286BEA', boxShadow: '0 3px 0 #1B4FBB' }
                        : hat.locked
                        ? { background: 'rgba(30,52,104,0.4)', border: '1px solid rgba(40,107,234,0.1)' }
                        : { background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(40,107,234,0.15)' }
                    }
                  >
                    <div className="my-1 relative flex items-center justify-center">
                      <span className="material-symbols-outlined text-[32px] text-[#EEF1FF]">
                        {hat.icon}
                      </span>
                      {hat.locked && (
                        <span className="material-symbols-outlined text-[16px] text-[#7B8AB8] absolute -bottom-1 -right-1">
                          lock
                        </span>
                      )}
                    </div>
                    <span className="font-rubik font-bold text-[12px] text-[#EEF1FF] leading-tight mt-1">
                      {hat.name}
                    </span>
                    <span className="font-nunito text-[10px] text-[#7B8AB8] mt-0.5">
                      {isEquipped ? 'EQUIPPED' : hat.locked ? hat.unlockHint : 'TAP TO EQUIP'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOURNAL */}
      {activeTab === 'journal' && (
        <div
          className="rounded-3xl p-4"
          style={{
            background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
            border: '1px solid rgba(40,107,234,0.2)',
            boxShadow: '0 4px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <h3 className="font-rubik font-bold text-[15px] text-[#EEF1FF] mb-1">
            Word Collector's Dictionary
          </h3>
          <p className="font-nunito text-[12px] text-[#7B8AB8] mb-3">
            Rare terms and vocabulary uncovered across world puzzles:
          </p>

          <div className="flex flex-col gap-2">
            {VOCABULARY_JOURNAL.map((item) => (
              <div
                key={item.word}
                onClick={() => {
                  audio.playLetterTap(1);
                  setSelectedWord(item);
                }}
                className="p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer"
                style={{ background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(40,107,234,0.1)' }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-rubik font-bold text-[14px] text-[#4D8AFF]">
                      {item.word}
                    </span>
                    <span className="font-nunito text-[10px] text-[#9B7EFF] bg-[#7652D9]/15 px-2 py-0.2 rounded-full border border-[#7652D9]/15">
                      {item.world}
                    </span>
                  </div>
                  <p className="font-nunito text-[12px] text-[#7B8AB8] line-clamp-1 mt-0.5">
                    {item.definition}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#7B8AB8]">
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div
          className="rounded-3xl p-4 space-y-3"
          style={{
            background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
            border: '1px solid rgba(40,107,234,0.2)',
            boxShadow: '0 4px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <h3 className="font-rubik font-bold text-[15px] text-[#EEF1FF]">
            Game Settings
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-[#286BEA]/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4D8AFF]">volume_up</span>
              <span className="font-rubik font-bold text-[13px] text-[#EEF1FF]">
                Sound Effects
              </span>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                playerState.soundEnabled ? 'bg-[#35C94A]' : 'bg-[#253D75]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                  playerState.soundEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#286BEA]/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4D8AFF]">vibration</span>
              <span className="font-rubik font-bold text-[13px] text-[#EEF1FF]">
                Haptic Feedback
              </span>
            </div>
            <button
              onClick={onToggleHaptics}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                playerState.hapticsEnabled ? 'bg-[#35C94A]' : 'bg-[#253D75]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 transition-transform ${
                  playerState.hapticsEnabled ? 'right-0.5' : 'left-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all game progress and daily streaks?')) {
                  onResetProgress();
                }
              }}
              className="w-full py-2.5 rounded-full font-rubik font-bold text-[13px] transition-colors cursor-pointer"
              style={{ background: 'rgba(239,59,59,0.15)', color: '#EF3B3B', border: '1px solid rgba(239,59,59,0.2)' }}
            >
              Reset Saved Progress
            </button>
          </div>
        </div>
      )}

      {/* Word Definition Modal */}
      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center"
            style={{
              background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
              border: '2px solid rgba(40,107,234,0.3)',
              boxShadow: '0 8px 0 #0E1A3A, 0 16px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="w-12 h-12 rounded-full bg-[#286BEA]/20 text-[#4D8AFF] flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[26px]">menu_book</span>
            </div>
            <h3 className="font-rubik font-black text-[20px] text-[#4D8AFF]">
              {selectedWord.word}
            </h3>
            <span className="font-nunito font-bold text-[11px] text-[#9B7EFF] bg-[#7652D9]/15 px-2.5 py-0.5 rounded-full mt-1 inline-block border border-[#7652D9]/15">
              {selectedWord.world}
            </span>
            <p className="font-nunito text-[14px] text-[#EEF1FF] my-4 leading-relaxed">
              "{selectedWord.definition}"
            </p>
            <button
              onClick={() => setSelectedWord(null)}
              className="w-full h-11 bg-[#286BEA] text-white rounded-full font-rubik font-bold text-[14px] shadow-[0_3px_0_#1B4FBB] cursor-pointer"
            >
              GOT IT!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
