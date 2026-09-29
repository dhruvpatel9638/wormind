import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TargetWord } from '../types';
import { ASSETS, INITIAL_LEVELS } from '../data/gameData';
import { audio } from '../utils/audio';

interface GameViewProps {
  levelId: number;
  onExit: () => void;
  onCompleteLevel: (levelId: number, stars: number, coinsEarned: number) => void;
  coins: number;
  onDeductCoins: (amount: number) => boolean;
}

export const GameView: React.FC<GameViewProps> = ({
  levelId,
  onExit,
  onCompleteLevel,
  coins,
  onDeductCoins,
}) => {
  // Find current level data or default to level 24 (Beach Day)
  const currentLevel = INITIAL_LEVELS.find((l) => l.id === levelId) || INITIAL_LEVELS.find((l) => l.id === 24)!;

  const [grid, setGrid] = useState<string[][]>(currentLevel.grid);
  const [targetWords, setTargetWords] = useState<TargetWord[]>(currentLevel.targetWords);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [spelledWord, setSpelledWord] = useState<string>('OCEAN');
  const [streak, setStreak] = useState<number>(3);
  const [lives, setLives] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [hintedCells, setHintedCells] = useState<{ r: number; c: number }[]>([]);
  const [lokiSpeech, setLokiSpeech] = useState<string>(
    'I spot <span class="font-bold text-[#4D8AFF]">"OCEAN"</span> swimming across row 4!'
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [boardWiggle, setBoardWiggle] = useState<boolean>(false);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const foundCount = targetWords.filter((w) => w.found).length;
  const totalCount = targetWords.length;

  // Track permanent found cells
  const foundCellSet = new Set<string>();
  targetWords.forEach((tw) => {
    if (tw.found) {
      const minR = Math.min(tw.rowStart, tw.rowEnd);
      const maxR = Math.max(tw.rowStart, tw.rowEnd);
      const minC = Math.min(tw.colStart, tw.colEnd);
      const maxC = Math.max(tw.colStart, tw.colEnd);

      const rStep = tw.rowEnd === tw.rowStart ? 0 : tw.rowEnd > tw.rowStart ? 1 : -1;
      const cStep = tw.colEnd === tw.colStart ? 0 : tw.colEnd > tw.colStart ? 1 : -1;

      const len = Math.max(maxR - minR, maxC - minC);
      for (let i = 0; i <= len; i++) {
        const r = tw.rowStart + i * rStep;
        const c = tw.colStart + i * cStep;
        foundCellSet.add(`${r},${c}`);
      }
    }
  });

  const checkWordSelection = useCallback((cells: { r: number; c: number }[]) => {
    const letters = cells.map((cell) => grid[cell.r]?.[cell.c] || '').join('');
    const reversed = letters.split('').reverse().join('');

    const matchIdx = targetWords.findIndex(
      (tw) => !tw.found && (tw.word === letters || tw.word === reversed)
    );

    if (matchIdx !== -1) {
      // Word found!
      const matched = targetWords[matchIdx];
      audio.playWordFound();

      const newTargetWords = [...targetWords];
      newTargetWords[matchIdx] = { ...matched, found: true };
      setTargetWords(newTargetWords);
      setSelectedCells([]);
      setSpelledWord('—');
      setStreak((prev) => prev + 1);

      setLokiSpeech(`Terrific! You discovered <span class="font-bold text-[#4D8AFF]">"${matched.word}"</span>!`);

      // Check if all words found
      if (newTargetWords.every((w) => w.found)) {
        setTimeout(() => {
          handleVictory();
        }, 500);
      }
    }
  }, [grid, targetWords]);

  const handleVictory = () => {
    setIsVictory(true);
    audio.playVictory();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#286BEA', '#FFC928', '#35C94A', '#7652D9', '#EF3B3B'],
    });
  };

  // Toggle or add tile to selection
  const handleTileClick = (r: number, c: number) => {
    if (isPaused || isVictory) return;

    const existingIdx = selectedCells.findIndex((cell) => cell.r === r && cell.c === c);

    if (existingIdx !== -1) {
      // Unselect if already selected
      const newSelection = selectedCells.filter((_, idx) => idx !== existingIdx);
      setSelectedCells(newSelection);
      const newWord = newSelection.map((cell) => grid[cell.r][cell.c]).join('');
      setSpelledWord(newWord || '—');
      audio.playLetterTap(newSelection.length);
    } else {
      const newSelection = [...selectedCells, { r, c }];
      setSelectedCells(newSelection);
      const newWord = newSelection.map((cell) => grid[cell.r][cell.c]).join('');
      setSpelledWord(newWord);
      audio.playLetterTap(newSelection.length);

      checkWordSelection(newSelection);
    }
  };

  // Drag-to-select support
  const handlePointerDown = (r: number, c: number) => {
    if (isPaused || isVictory) return;
    setIsDragging(true);
    setSelectedCells([{ r, c }]);
    setSpelledWord(grid[r][c]);
    audio.playLetterTap(1);
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (!isDragging || isPaused || isVictory) return;
    const exists = selectedCells.some((cell) => cell.r === r && cell.c === c);
    if (!exists) {
      const newSelection = [...selectedCells, { r, c }];
      setSelectedCells(newSelection);
      const newWord = newSelection.map((cell) => grid[cell.r][cell.c]).join('');
      setSpelledWord(newWord);
      audio.playLetterTap(newSelection.length);
      checkWordSelection(newSelection);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  const handleClearSelection = () => {
    audio.playLetterTap(0);
    setSelectedCells([]);
    setSpelledWord('—');
  };

  // Action: Shuffle (wiggles and visually shifts filler letters)
  const handleShuffle = () => {
    audio.playLetterTap(1);
    setBoardWiggle(true);
    setTimeout(() => setBoardWiggle(false), 300);

    setLokiSpeech('Winds of the beach shuffled your view! Keep an eye on row 4!');
  };

  // Action: Hint (spend 25 coins to highlight first letter of an unfound word)
  const handleHint = () => {
    const unfound = targetWords.find((tw) => !tw.found);
    if (!unfound) return;

    if (!onDeductCoins(25)) {
      alert('Not enough coins! You need 25 coins for a Hint.');
      return;
    }

    audio.playSparkle();
    const hintCell = { r: unfound.rowStart, c: unfound.colStart };
    setHintedCells([hintCell]);
    setLokiSpeech(
      `Clue: Look at row ${unfound.rowStart + 1}, column ${unfound.colStart + 1} for <b>"${unfound.word[0]}"</b>!`
    );

    setTimeout(() => {
      setHintedCells([]);
    }, 3000);
  };

  // Action: Reveal Booster (instantly reveal one unfound word)
  const handleReveal = () => {
    const unfoundIdx = targetWords.findIndex((tw) => !tw.found);
    if (unfoundIdx === -1) return;

    audio.playWordFound();
    const newTargetWords = [...targetWords];
    const revealed = newTargetWords[unfoundIdx];
    newTargetWords[unfoundIdx] = { ...revealed, found: true };
    setTargetWords(newTargetWords);

    setLokiSpeech(`Super Reveal sparked <span class="font-bold text-[#9B7EFF]">"${revealed.word}"</span> into view!`);

    if (newTargetWords.every((w) => w.found)) {
      setTimeout(() => {
        handleVictory();
      }, 500);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[430px] mx-auto px-4 pb-28 pt-16 select-none">
      {/* Level & Gameplay Header Card */}
      <div
        className="flex items-center justify-between gap-2 mt-2 mb-3 p-2.5 rounded-2xl relative z-10"
        style={{
          background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
          border: '1px solid rgba(40,107,234,0.2)',
          boxShadow: '0 6px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="bg-[#286BEA] px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_3px_0_#1B4FBB]">
            <span className="material-symbols-outlined text-[#FFC928] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="font-rubik font-bold text-[13px] text-white tracking-wide">
              LVL {levelId}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(40,107,234,0.15)', border: '1px solid rgba(40,107,234,0.15)' }}>
            <span className="font-rubik font-bold text-[11px] text-[#4D8AFF]">
              {currentLevel.title.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Lives & Pause */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-full shadow-inner" style={{ background: 'rgba(30,52,104,0.6)', border: '1px solid rgba(239,59,59,0.15)' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined text-[16px]"
                style={{
                  color: i < lives ? '#EF3B3B' : '#253D75',
                  fontVariationSettings: "'FILL' 1",
                }}
              >
                favorite
              </span>
            ))}
          </div>

          <button
            onClick={() => {
              audio.playLetterTap(0);
              setIsPaused(true);
            }}
            className="w-8 h-8 rounded-full bg-[#253D75] text-[#7B8AB8] flex items-center justify-center shadow-[0_3px_0_#0E1A3A] active:translate-y-[2px] transition-all cursor-pointer hover:text-[#EEF1FF]"
            title="Pause Game"
          >
            <span className="material-symbols-outlined text-[18px]">pause</span>
          </button>
        </div>
      </div>

      {/* Target Words Drawer (Sticker Tag Cluster) */}
      <div
        className="p-3 rounded-2xl mb-3"
        style={{
          background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
          border: '1px solid rgba(40,107,234,0.2)',
          boxShadow: '0 6px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#4D8AFF] text-[18px]">
              search_check
            </span>
            <span className="font-rubik font-bold text-[13px] text-[#EEF1FF]">
              HIDDEN WORDS
            </span>
          </div>
          <span className="font-rubik font-bold text-[11px] text-[#9B7EFF] bg-[#7652D9]/20 px-2.5 py-0.5 rounded-full border border-[#7652D9]/20">
            {foundCount} / {totalCount} FOUND
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {targetWords.map((tw) => {
            const isFound = tw.found;
            const isNextTarget = !isFound && tw.word === 'OCEAN';

            if (isFound) {
              return (
                <div
                  key={tw.word}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full opacity-50 scale-95"
                  style={{ background: 'rgba(53,201,74,0.1)', border: '1px solid rgba(53,201,74,0.15)', boxShadow: '0 2px 0 rgba(14,26,58,0.5)' }}
                >
                  <span className="material-symbols-outlined text-[14px] text-[#35C94A]">
                    check_circle
                  </span>
                  <span className="font-rubik font-bold text-[11px] line-through tracking-wider text-[#35C94A]/70">
                    {tw.word}
                  </span>
                </div>
              );
            }

            if (isNextTarget) {
              return (
                <div
                  key={tw.word}
                  onClick={() => {
                    audio.playChirp();
                    setLokiSpeech(`Target <span class="font-bold text-white">"OCEAN"</span> spans across row 4!`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#286BEA] text-white shadow-[0_3px_0_#1B4FBB] animate-bounce cursor-pointer"
                  style={{ boxShadow: '0 3px 0 #1B4FBB, 0 0 12px rgba(40,107,234,0.4)' }}
                >
                  <span className="font-rubik font-bold text-[11px] tracking-wider">
                    {tw.word}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFC928] animate-ping"></span>
                </div>
              );
            }

            return (
              <div
                key={tw.word}
                onClick={() => {
                  audio.playChirp();
                  setLokiSpeech(`Searching for <b>"${tw.word}"</b>? Look carefully across all rows!`);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full active:scale-95 transition-transform cursor-pointer"
                style={{ background: 'rgba(40,107,234,0.1)', border: '1px solid rgba(40,107,234,0.15)', boxShadow: '0 3px 0 rgba(14,26,58,0.5)' }}
              >
                <span className="font-rubik font-bold text-[11px] tracking-wider text-[#EEF1FF]">
                  {tw.word}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Word Selection Banner */}
      <div
        className="flex items-center justify-between px-4 py-2 rounded-full mb-3 shadow-inner"
        style={{ background: 'rgba(40,107,234,0.12)', border: '1px solid rgba(40,107,234,0.15)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-rubik font-bold text-[#4D8AFF]">SPELLING:</span>
          <div className="font-rubik font-extrabold text-[18px] text-[#4D8AFF] tracking-widest min-h-[24px] flex items-center">
            {spelledWord}
          </div>
        </div>

        <button
          onClick={handleClearSelection}
          className="w-6 h-6 rounded-full bg-[#253D75] text-[#7B8AB8] hover:text-[#EF3B3B] flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer"
          title="Clear Spelling"
        >
          <span className="material-symbols-outlined text-[14px]">close</span>
        </button>
      </div>

      {/* 8x8 Interactive Word Search Matrix */}
      <div
        className={`relative w-full p-2 rounded-3xl transition-all duration-300 ${
          boardWiggle ? 'rotate-1 scale-[0.98]' : ''
        }`}
        style={{
          background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
          border: '2px solid rgba(40,107,234,0.2)',
          boxShadow: '0 8px 0 #0E1A3A, inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div
          ref={gridContainerRef}
          className="grid grid-cols-8 gap-1 w-full aspect-square touch-none select-none"
        >
          {grid.map((row, r) =>
            row.map((letter, c) => {
              const isFound = foundCellSet.has(`${r},${c}`);
              const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);
              const isHinted = hintedCells.some((cell) => cell.r === r && cell.c === c);

              let tileClass = 'tile-normal';
              if (isFound) {
                tileClass = 'tile-found';
              }
              if (isSelected) {
                tileClass = 'tile-selected';
              }
              if (isHinted) {
                tileClass = 'tile-hinted';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onPointerDown={() => handlePointerDown(r, c)}
                  onPointerEnter={() => handlePointerEnter(r, c)}
                  onClick={() => handleTileClick(r, c)}
                  className={`tile flex items-center justify-center rounded-xl font-rubik font-black text-[18px] sm:text-[20px] cursor-pointer ${tileClass}`}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Mascot Companion & Interactive Dialog Deck */}
      <div className="mt-4 flex items-end justify-between gap-2 relative">
        <div className="flex items-center gap-2">
          {/* Loki Mascot Avatar */}
          <div
            onClick={() => {
              audio.playChirp();
              setLokiSpeech('Keep paddling, Captain! You are solving at supersonic speed!');
            }}
            className="w-14 h-14 rounded-full bg-[#7652D9] p-1 cursor-pointer active:scale-95 transition-transform shrink-0 flex items-center justify-center relative border-2 border-[#9B7EFF]/30"
            style={{ boxShadow: '0 5px 0 #5A3BB5' }}
          >
            <img
              alt="Loki Mascot"
              className="w-10 h-10 object-contain drop-shadow-md"
              src={ASSETS.logo}
            />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFC928] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FFC928] text-[10px] items-center justify-center text-[#172858]">
                <span className="material-symbols-outlined text-[10px]">bolt</span>
              </span>
            </span>
          </div>

          {/* Speech Bubble */}
          <div
            className="py-2 px-3 rounded-2xl rounded-bl-none max-w-[210px] relative"
            style={{
              background: 'linear-gradient(145deg, #1E3468 0%, #253D75 100%)',
              border: '1px solid rgba(40,107,234,0.2)',
              boxShadow: '0 4px 0 #0E1A3A',
            }}
          >
            <p
              className="font-nunito font-semibold text-[13px] text-[#EEF1FF] leading-tight"
              dangerouslySetInnerHTML={{ __html: lokiSpeech }}
            />
          </div>
        </div>

        {/* Streak Meter */}
        <div className="flex flex-col items-center px-2 py-1 rounded-xl" style={{ background: 'rgba(255,201,40,0.1)', border: '1px solid rgba(255,201,40,0.15)' }}>
          <span className="font-rubik font-bold text-[10px] text-[#FFC928]/70">STREAK</span>
          <span className="font-rubik font-black text-[15px] text-[#FFC928] flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-[#EF3B3B]">local_fire_department</span>
            <span>{streak}x</span>
          </span>
        </div>
      </div>

      {/* 3 Chunky Extruded Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {/* Shuffle Button */}
        <button
          onClick={handleShuffle}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl active:translate-y-[4px] transition-all cursor-pointer"
          style={{ background: 'rgba(118,82,217,0.15)', border: '1px solid rgba(118,82,217,0.2)', boxShadow: '0 5px 0 rgba(14,26,58,0.6)' }}
        >
          <span className="material-symbols-outlined text-[22px] text-[#9B7EFF]">shuffle</span>
          <span className="font-rubik font-bold text-[11px] mt-0.5 text-[#9B7EFF]">SHUFFLE</span>
        </button>

        {/* Hint Button (25 coins) */}
        <button
          onClick={handleHint}
          className="flex flex-col items-center justify-center py-2.5 px-2 bg-[#FFC928] text-[#172858] rounded-2xl active:translate-y-[4px] transition-all cursor-pointer"
          style={{ boxShadow: '0 5px 0 #D4A200, 0 8px 12px rgba(255,201,40,0.2)', border: '1px solid rgba(255,201,40,0.4)' }}
        >
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            <span className="font-rubik font-black text-[11px]">HINT</span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            <span className="material-symbols-outlined text-[12px] text-[#172858]/60">
              monetization_on
            </span>
            <span className="font-rubik font-bold text-[11px]">25</span>
          </div>
        </button>

        {/* Reveal Booster */}
        <button
          onClick={handleReveal}
          className="flex flex-col items-center justify-center py-2.5 px-2 rounded-2xl active:translate-y-[4px] transition-all cursor-pointer"
          style={{ background: 'rgba(40,107,234,0.15)', border: '1px solid rgba(40,107,234,0.2)', boxShadow: '0 5px 0 rgba(14,26,58,0.6)' }}
        >
          <span className="material-symbols-outlined text-[22px] text-[#4D8AFF]">auto_fix_high</span>
          <span className="font-rubik font-bold text-[11px] mt-0.5 text-[#4D8AFF]">REVEAL</span>
        </button>
      </div>

      {/* VICTORY CELEBRATION MODAL */}
      {isVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="rounded-3xl p-6 w-full max-w-xs shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
            style={{
              background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
              border: '4px solid #35C94A',
              boxShadow: '0 8px 0 #0E1A3A, 0 16px 32px rgba(0,0,0,0.4), 0 0 40px rgba(53,201,74,0.2)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-[#FFC928] text-[#172858] flex items-center justify-center shadow-[0_5px_0_#D4A200] -mt-12 ring-4 ring-[#172858] animate-bounce">
              <span className="material-symbols-outlined text-[32px] text-[#172858]">emoji_events</span>
            </div>

            <h2 className="font-rubik font-black text-[24px] text-[#4D8AFF] mt-3">
              LEVEL COMPLETE!
            </h2>
            <p className="font-nunito font-semibold text-[14px] text-[#7B8AB8] mt-1">
              You found all hidden words!
            </p>

            <div className="flex items-center justify-center gap-2 my-4">
              <span className="material-symbols-outlined text-[#FFC928] text-[32px] animate-pulse">star</span>
              <span className="material-symbols-outlined text-[#FFC928] text-[36px] animate-pulse">star</span>
              <span className="material-symbols-outlined text-[#FFC928] text-[32px] animate-pulse">star</span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full mb-5">
              <div className="p-2.5 rounded-2xl flex items-center gap-2" style={{ background: 'rgba(255,201,40,0.1)', border: '1px solid rgba(255,201,40,0.15)' }}>
                <span className="material-symbols-outlined text-[24px] text-[#FFC928]">monetization_on</span>
                <div className="flex flex-col text-left">
                  <span className="font-rubik font-black text-[15px] text-[#EEF1FF]">+50</span>
                  <span className="font-nunito text-[10px] text-[#7B8AB8]">Coins</span>
                </div>
              </div>
              <div className="p-2.5 rounded-2xl flex items-center gap-2" style={{ background: 'rgba(118,82,217,0.1)', border: '1px solid rgba(118,82,217,0.15)' }}>
                <span className="material-symbols-outlined text-[24px] text-[#FFC928]">star</span>
                <div className="flex flex-col text-left">
                  <span className="font-rubik font-black text-[15px] text-[#EEF1FF]">+100</span>
                  <span className="font-nunito text-[10px] text-[#7B8AB8]">XP</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                audio.playCoin();
                onCompleteLevel(levelId, 3, 50);
              }}
              className="w-full h-12 bg-[#35C94A] text-white rounded-full font-rubik font-black text-[16px] shadow-[0_4px_0_#218A30] active:translate-y-1 transition-all cursor-pointer"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* PAUSE MODAL */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="rounded-3xl p-6 w-full max-w-xs shadow-2xl flex flex-col items-center text-center"
            style={{
              background: 'linear-gradient(145deg, #1E3468 0%, #172858 100%)',
              border: '2px solid rgba(40,107,234,0.3)',
              boxShadow: '0 8px 0 #0E1A3A, 0 16px 32px rgba(0,0,0,0.4)',
            }}
          >
            <h3 className="font-rubik font-black text-[22px] text-[#EEF1FF] mb-1">
              GAME PAUSED
            </h3>
            <p className="font-nunito text-[13px] text-[#7B8AB8] mb-4">
              Level {levelId} • {currentLevel.title}
            </p>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => {
                  audio.playLetterTap(2);
                  setIsPaused(false);
                }}
                className="w-full h-12 bg-[#286BEA] text-white rounded-full font-rubik font-bold text-[15px] shadow-[0_4px_0_#1B4FBB] active:translate-y-1 transition-all cursor-pointer"
              >
                RESUME
              </button>
              <button
                onClick={() => {
                  audio.playLetterTap(0);
                  setIsPaused(false);
                  onExit();
                }}
                className="w-full h-11 bg-[#253D75] text-[#EF3B3B] rounded-full font-rubik font-bold text-[14px] hover:bg-[#EF3B3B]/15 transition-colors cursor-pointer"
              >
                EXIT TO HOME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
