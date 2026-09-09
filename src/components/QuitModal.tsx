import React from 'react';
import { LogOut, Heart, RotateCcw, X, Play } from 'lucide-react';

interface QuitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmQuit: () => void;
}

export default function QuitModal({
  isOpen,
  onClose,
  onConfirmQuit,
}: QuitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
          <LogOut className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-black text-white mb-2 tracking-wide">
          QUIT JARDINAINS?
        </h3>

        <p className="text-slate-300 text-xs mb-5 leading-relaxed">
          Are you sure you want to exit? Your highest unlocked level and high scores are safely saved in your browser.
        </p>

        {/* Dedication Reminder */}
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-6 text-xs text-rose-300 flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 fill-rose-400 text-rose-400 shrink-0" />
          <span>Crafted with love for Yesra • 1,000 Levels</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition"
          >
            Keep Playing
          </button>
          <button
            onClick={onConfirmQuit}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-600/30 transition"
          >
            Exit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
