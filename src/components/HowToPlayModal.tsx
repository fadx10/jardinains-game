import React from 'react';
import { HelpCircle, Heart, X, Sparkles, Trophy, Zap, Shield } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-3.5 sm:p-6 shadow-2xl relative flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                HOW TO PLAY JARDINAINS!
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Master scoring, combos & 'nain juggling across 1,000 levels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4 text-xs text-slate-300 pr-1">
          {/* Section 1: Official Scoring Table */}
          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700">
            <div className="font-extrabold text-sm text-amber-300 mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Official Scoring Table
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-700/80">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Action / Target</th>
                    <th className="py-2 px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-3 font-sans text-slate-200">Normal Brick (1-Hit)</td>
                    <td className="py-1.5 px-3 text-right text-emerald-400 font-bold">+50</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-3 font-sans text-slate-200">Strong Brick (2-Hit)</td>
                    <td className="py-1.5 px-3 text-right text-emerald-400 font-bold">+100</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-3 font-sans text-slate-200">Very Strong Brick (3-Hit)</td>
                    <td className="py-1.5 px-3 text-right text-emerald-400 font-bold">+150</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-3 font-sans text-slate-200">Bonus Brick (Golden Spark)</td>
                    <td className="py-1.5 px-3 text-right text-amber-400 font-bold">+250</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-3 font-sans text-slate-200">Jardinain Direct Hit & Reward Drop</td>
                    <td className="py-1.5 px-3 text-right text-sky-400 font-bold">+500 to +2,000 + Bonus</td>
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-1.5 px-3 font-sans text-slate-200">Level Completed (Base Clear)</td>
                    <td className="py-1.5 px-3 text-right text-purple-400 font-bold">+1,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Rapid Combo Bonus */}
          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700">
            <div className="font-extrabold text-sm text-amber-300 mb-1 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Rapid Combo Multipliers
            </div>
            <p className="text-slate-400 leading-relaxed mb-2">
              Destroying bricks in rapid succession (within 2 seconds) activates the arcade combo multiplier:
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-amber-400 font-black font-mono">2 BRICKS</div>
                <div className="text-slate-300 text-[10px] font-semibold">+25 Combo Bonus</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-amber-300 font-black font-mono">3-4 BRICKS</div>
                <div className="text-slate-300 text-[10px] font-semibold">+75 Larger Bonus</div>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-emerald-400 font-black font-mono">5+ BRICKS</div>
                <div className="text-slate-300 text-[10px] font-semibold">+150 High Combo!</div>
              </div>
            </div>
          </div>

          {/* Section 3: Level-Clear Bonus Calculation */}
          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700">
            <div className="font-extrabold text-sm text-emerald-400 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Level-Clear Bonus Breakdown
            </div>
            <p className="text-slate-400 leading-relaxed mb-2">
              When all breakable bricks are destroyed, you are rewarded with full victory clear points:
            </p>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Brick / Stage Bonus:</span>
                <span className="text-emerald-400 font-bold">+1,000</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Life Bonus (per life remaining):</span>
                <span className="text-rose-400 font-bold">+250</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>'Nain Juggling Mastery:</span>
                <span className="text-amber-400 font-bold">+100 per juggle</span>
              </div>
            </div>
          </div>

          {/* Section 4: Controls */}
          <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700">
            <div className="font-extrabold text-sm text-white mb-1">Game Controls</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li><strong className="text-white">Mouse Movement</strong> or <strong className="text-white">◀ ▶ / A D Keys</strong> to glide your paddle.</li>
              <li><strong className="text-white">Click or SPACE</strong> to launch the ball from your paddle or fire lasers.</li>
              <li><strong className="text-white">P or Escape</strong> to pause the game.</li>
              <li><strong className="text-white">F</strong> to toggle Full Screen mode anytime.</li>
            </ul>
          </div>

          {/* Dedication Banner */}
          <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <Heart className="w-4 h-4 fill-rose-400 text-rose-400 shrink-0" />
            <span>1,000 Levels of arcade joy • Dedicated with love for Yesra!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl transition text-sm shadow-lg"
          >
            LET'S PLAY!
          </button>
        </div>
      </div>
    </div>
  );
}
