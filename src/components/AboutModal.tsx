import React from 'react';
import { Info, Heart, Award, Sparkles, X, Shield, Star } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl sm:rounded-3xl max-w-lg w-full p-3.5 sm:p-6 shadow-2xl relative flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-rose-400" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                ABOUT JARDINAINS!
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">The 1,000-Level Retro Arcade Remake</p>
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
        <div className="flex-1 overflow-y-auto space-y-4 py-4 text-sm text-slate-300 pr-1">
          {/* Dedication Banner */}
          <div className="bg-gradient-to-tr from-rose-950/80 via-purple-950/70 to-rose-900/60 border-2 border-rose-500/50 rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-rose-500/25 border border-rose-400/40 flex items-center justify-center text-rose-300 animate-pulse">
              <Heart className="w-6 h-6 fill-current text-rose-400" />
            </div>
            <h4 className="text-xl font-black text-rose-200 mb-1">Dedicated with Love for Yesra ❤️</h4>
            <p className="text-xs text-rose-100/90 leading-relaxed max-w-md mx-auto">
              Every single one of the <strong>1,000 levels</strong>, from the serene Garden Gates to the Grand Centennial Crown and the Level 1,000 Eternal Citadel, was crafted as a special tribute for Yesra.
            </p>
          </div>

          {/* Tribute & Heritage */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-2 text-xs leading-relaxed text-slate-300">
            <div className="font-extrabold text-white text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>The Classic 'Nain-Bouncing Legacy</span>
            </div>
            <p>
              Originally created in 2001, <em>Jardinains!</em> captured the hearts of arcade fans worldwide with its cheeky garden gnomes ('nains) who taunt players, lob rocks, and can be bounced on your paddle for outrageous combo multipliers.
            </p>
            <p>
              This enhanced remake honors the original classic with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pt-1">
              <li><strong className="text-white">1,000 Diverse Stages</strong> spanning 10 architectural eras.</li>
              <li><strong className="text-white">Full Screen Support</strong> for distraction-free arcade immersion.</li>
              <li><strong className="text-white">Procedural Web Audio Engine</strong> featuring authentic sound effects and 8-bit chiptune melodies.</li>
              <li><strong className="text-white">Paddle Juggling Multipliers</strong> with 500, 1000, 1500+ combo streaks.</li>
              <li><strong className="text-white">All Powerup Arsenals</strong>: Multiball, Laser Cannons, Safety Floor Shield, Fireballs, and Extra Lives.</li>
            </ul>
          </div>

          {/* Engine Specs */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Engine</span>
              <span className="text-white font-bold">HTML5 Canvas 60 FPS</span>
            </div>
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px] uppercase">Audio Engine</span>
              <span className="text-white font-bold">Web Audio Synthesizer</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">v2.0 (1000 Levels Edition)</span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
