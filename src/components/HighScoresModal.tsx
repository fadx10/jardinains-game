import React, { useState, useEffect } from 'react';
import { Trophy, Award, X, RotateCcw, Heart, Plus, Check } from 'lucide-react';
import { HighScoreEntry } from '../types';

interface HighScoresModalProps {
  scores: HighScoreEntry[];
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  pendingScore?: {
    score: number;
    level: number;
    nainsJuggled: number;
  } | null;
  onSaveScore?: (name: string, score: number, level: number, nainsJuggled: number) => void;
}

export default function HighScoresModal({
  scores,
  isOpen,
  onClose,
  onReset,
  pendingScore,
  onSaveScore,
}: HighScoresModalProps) {
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem('jardinains_player_name') || 'PLAYER 1';
    } catch {
      return 'PLAYER 1';
    }
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      try {
        setPlayerName(localStorage.getItem('jardinains_player_name') || 'PLAYER 1');
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingScore || !onSaveScore) return;
    const finalName = playerName.trim() || 'ANONYMOUS';
    try {
      localStorage.setItem('jardinains_player_name', finalName);
    } catch {}
    onSaveScore(finalName, pendingScore.score, pendingScore.level, pendingScore.nainsJuggled);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-3.5 sm:p-6 shadow-2xl relative flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                ARCADE HIGH SCORES
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">All-time legendary garden jugglers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedication Accent */}
        <div className="my-3 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            Top record dedicated with love for Yesra
          </span>
          <span className="text-[11px] font-mono text-rose-400/80 font-bold">1,000 Levels</span>
        </div>

        {/* Optional Record Entry Prompt */}
        {pendingScore && !submitted && onSaveScore && (
          <form
            onSubmit={handleSave}
            className="mb-3 p-3.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Save Your New Record!
              </div>
              <div className="font-mono font-black text-amber-400 text-base">
                {pendingScore.score.toLocaleString()} PTS
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={16}
                value={playerName}
                onChange={e => setPlayerName(e.target.value.toUpperCase())}
                placeholder="ENTER YOUR NAME"
                className="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono font-bold text-sm tracking-wider focus:outline-none focus:border-amber-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl transition flex items-center gap-1 shadow"
              >
                <Check className="w-4 h-4" /> Save
              </button>
            </div>
          </form>
        )}

        {/* High Score Table */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 pr-1 my-2">
          {scores.map((entry, idx) => {
            const rankBadgeColor =
              idx === 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : idx === 1
                ? 'bg-slate-400/20 text-slate-200 border-slate-400/40'
                : idx === 2
                ? 'bg-amber-700/20 text-amber-500 border-amber-700/40'
                : 'bg-slate-800 text-slate-400 border-slate-700';

            return (
              <div
                key={entry.id || idx}
                className={`py-2.5 px-3 flex items-center justify-between rounded-xl transition ${
                  idx === 0
                    ? 'bg-amber-500/5 hover:bg-amber-500/10'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 flex items-center justify-center font-mono font-black text-xs rounded-lg border ${rankBadgeColor}`}
                  >
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      {entry.name}
                      {idx === 0 && (
                        <Award className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>Lvl {entry.level}</span>
                      <span>•</span>
                      <span>{entry.nainsJuggled || 0} 'nains juggled</span>
                      <span>•</span>
                      <span>{entry.date}</span>
                    </div>
                  </div>
                </div>

                <div className="font-mono font-extrabold text-base text-amber-400 tracking-wider">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onReset}
            className="text-slate-500 hover:text-red-400 transition flex items-center gap-1.5 py-1 px-2 rounded hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Records
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
