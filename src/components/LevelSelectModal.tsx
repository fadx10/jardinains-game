import React, { useState } from 'react';
import { 
  Grid, X, Heart, Check, ChevronLeft, ChevronRight, 
  Search, Sparkles, Trophy 
} from 'lucide-react';
import { LevelConfig } from '../game/types';

interface LevelSelectModalProps {
  levels: LevelConfig[];
  unlockedLevel: number;
  currentLevelIdx: number;
  isPlaying: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelectLevel: (lvlIndex: number) => void;
}

const WORLD_NAMES = [
  'World 1: Royal Gardens (1-100)',
  'World 2: Sunken Ruins (101-200)',
  'World 3: Clockwork Keep (201-300)',
  'World 4: Emerald Canopy (301-400)',
  'World 5: Starlight Terrace (401-500)',
  'World 6: Obsidian Citadel (501-600)',
  'World 7: Crystal Vaults (601-700)',
  'World 8: Zephyr Ramparts (701-800)',
  'World 9: Celestial Spire (801-900)',
  'World 10: Yesra Sanctum (901-1000)',
];

export default function LevelSelectModal({
  levels,
  unlockedLevel,
  currentLevelIdx,
  isPlaying,
  isOpen,
  onClose,
  onSelectLevel,
}: LevelSelectModalProps) {
  const [selectedWorld, setSelectedWorld] = useState(0); // 0 to 9 (each world = 100 levels)
  const [subPage, setSubPage] = useState(0); // 0 to 4 (each subpage = 20 levels)
  const [jumpInput, setJumpInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleJump = () => {
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= levels.length) {
      onSelectLevel(num - 1);
    }
  };

  // Milestone quick picks
  const milestones = [
    { label: 'Lvl 1', idx: 0 },
    { label: 'Lvl 100', idx: 99 },
    { label: 'Lvl 250', idx: 249 },
    { label: 'Lvl 500', idx: 499 },
    { label: 'Lvl 750', idx: 749 },
    { label: 'Lvl 1000 ❤️', idx: 999, isYesra: true },
  ];

  // If search query is active, filter all 1000 levels
  const filteredLevels = searchQuery.trim()
    ? levels
        .map((lvl, idx) => ({ lvl, idx }))
        .filter(
          item =>
            (item.idx + 1).toString().includes(searchQuery.trim()) ||
            item.lvl.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
        .slice(0, 50)
    : null;

  const currentLevelsStart = selectedWorld * 100 + subPage * 20;
  const currentLevelsEnd = Math.min(levels.length, currentLevelsStart + 20);
  const displayedSlice = levels.slice(currentLevelsStart, currentLevelsEnd);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl sm:rounded-3xl max-w-4xl w-full p-3.5 sm:p-6 shadow-2xl relative flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Grid className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-2xl font-black text-white tracking-wide flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span>SELECT FROM 1,000 LEVELS</span>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">
                  With love for Yesra
                </span>
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
                <span className="text-[11px] sm:text-xs text-slate-400">
                  10 Thematic Eras • Jump to any stage or conquer sequentially
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{unlockedLevel} / 1,000 Saved</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestone Quick Jump Bar */}
        <div className="flex items-center gap-2 py-2 overflow-x-auto text-xs border-b border-slate-800/80 scrollbar-none">
          <span className="text-slate-400 text-[11px] uppercase font-bold shrink-0">Milestones:</span>
          {milestones.map(m => (
            <button
              key={m.idx}
              onClick={() => onSelectLevel(m.idx)}
              className={`px-3 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                m.isYesra
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              {m.isYesra && <Heart className="w-3 h-3 fill-current" />}
              {m.label}
            </button>
          ))}

          {/* Quick Search Input */}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search level or name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-44"
              />
            </div>
          </div>
        </div>

        {/* World Selection Tabs (1 to 10) */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 py-2 overflow-x-auto text-xs border-b border-slate-800 scrollbar-none">
            {WORLD_NAMES.map((name, wIdx) => {
              const isSelected = selectedWorld === wIdx;
              const isYesraWorld = wIdx === 9;
              return (
                <button
                  key={wIdx}
                  onClick={() => {
                    setSelectedWorld(wIdx);
                    setSubPage(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? isYesraWorld
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : isYesraWorld
                      ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/40 border border-rose-500/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isYesraWorld && <Heart className="w-3 h-3 fill-current" />}
                  <span>World {wIdx + 1}</span>
                  <span className="text-[10px] opacity-70">
                    ({wIdx * 100 + 1}-{wIdx * 100 + 100})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-page Selector (5 blocks of 20 levels within the world) */}
        {!searchQuery && (
          <div className="flex items-center justify-between py-2 text-xs border-b border-slate-800">
            <span className="text-slate-400 font-semibold">
              {WORLD_NAMES[selectedWorld]}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, sp) => {
                const start = selectedWorld * 100 + sp * 20 + 1;
                const end = selectedWorld * 100 + (sp + 1) * 20;
                return (
                  <button
                    key={sp}
                    onClick={() => setSubPage(sp)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition ${
                      subPage === sp
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-750'
                    }`}
                  >
                    {start}-{end}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Level Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5 py-3 flex-1 overflow-y-auto pr-1">
          {searchQuery ? (
            filteredLevels && filteredLevels.length > 0 ? (
              filteredLevels.map(({ lvl, idx }) => {
                const lvlNum = idx + 1;
                const isUnlocked = lvlNum <= unlockedLevel;
                const isCurrent = idx === currentLevelIdx && isPlaying;
                const isFinal = lvlNum === 1000;

                return (
                  <button
                    key={idx}
                    onClick={() => onSelectLevel(idx)}
                    className={`group relative p-2.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 ${
                      isFinal
                        ? 'bg-gradient-to-tr from-rose-950 via-purple-900 to-rose-900 border-rose-400 hover:border-rose-300 shadow-lg shadow-rose-600/30'
                        : isCurrent
                        ? 'bg-blue-950/90 border-blue-400 shadow-md shadow-blue-500/30'
                        : isUnlocked
                        ? 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-850/60 hover:bg-slate-800 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isFinal
                            ? 'bg-rose-500 text-white'
                            : isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        #{lvlNum}
                      </span>
                      {isFinal ? (
                        <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
                      ) : isUnlocked ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-slate-500">Play</span>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white line-clamp-1">
                        {lvl.name}
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">Play ▶</div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                No levels matched "{searchQuery}"
              </div>
            )
          ) : (
            displayedSlice.map((lvl, sIdx) => {
              const lvlIdx = currentLevelsStart + sIdx;
              const lvlNum = lvlIdx + 1;
              const isUnlocked = lvlNum <= unlockedLevel;
              const isCurrent = lvlIdx === currentLevelIdx && isPlaying;
              const isFinal = lvlNum === 1000;
              const isCentennial = lvlNum % 100 === 0;

              return (
                <button
                  key={lvlIdx}
                  onClick={() => onSelectLevel(lvlIdx)}
                  className={`group relative p-2.5 rounded-2xl border text-left transition flex flex-col justify-between h-24 ${
                    isFinal
                      ? 'bg-gradient-to-tr from-rose-950 via-purple-900 to-rose-900 border-rose-400 hover:border-rose-300 shadow-lg shadow-rose-600/30'
                      : isCentennial
                      ? 'bg-amber-950/60 border-amber-500/60 hover:border-amber-400'
                      : isCurrent
                      ? 'bg-blue-950/90 border-blue-400 shadow-md shadow-blue-500/30'
                      : isUnlocked
                      ? 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-850/60 hover:bg-slate-800 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isFinal
                          ? 'bg-rose-500 text-white'
                          : isCentennial
                          ? 'bg-amber-500 text-black'
                          : isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      #{lvlNum}
                    </span>
                    {isFinal ? (
                      <Heart className="w-4 h-4 fill-rose-400 text-rose-400 animate-pulse" />
                    ) : isUnlocked ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Play</span>
                    )}
                  </div>

                  <div>
                    <div
                      className={`text-[11px] font-bold leading-snug line-clamp-1 ${
                        isFinal ? 'text-rose-200' : isCentennial ? 'text-amber-200' : 'text-white'
                      }`}
                    >
                      {lvl.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{lvl.nainSpawns.length} 'nains</span>
                      <span className="text-emerald-400 group-hover:underline">Play ▶</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Jump & Page Controls */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Page controls */}
          <div className="flex items-center gap-2">
            <button
              disabled={subPage === 0 && selectedWorld === 0}
              onClick={() => {
                if (subPage > 0) setSubPage(p => p - 1);
                else if (selectedWorld > 0) {
                  setSelectedWorld(w => w - 1);
                  setSubPage(4);
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev 20
            </button>
            <span className="text-slate-400 font-mono text-[11px]">
              Levels {currentLevelsStart + 1} - {currentLevelsEnd} of 1,000
            </span>
            <button
              disabled={subPage === 4 && selectedWorld === 9}
              onClick={() => {
                if (subPage < 4) setSubPage(p => p + 1);
                else if (selectedWorld < 9) {
                  setSelectedWorld(w => w + 1);
                  setSubPage(0);
                }
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 font-semibold flex items-center gap-1"
            >
              Next 20 <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to level input */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Direct Jump:</span>
            <input
              type="number"
              min="1"
              max="1000"
              placeholder="1-1000"
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleJump();
              }}
              className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-center focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleJump}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
