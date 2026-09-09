import React from 'react';
import { 
  Settings, Volume2, VolumeX, Music, Maximize, Minimize, 
  Keyboard, MousePointer, X, Check, Gamepad2, Heart 
} from 'lucide-react';
import { GameOptions } from '../types';

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: GameOptions;
  onOptionsChange: (newOptions: Partial<GameOptions>) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function OptionsModal({
  isOpen,
  onClose,
  options,
  onOptionsChange,
  isFullscreen,
  onToggleFullscreen,
}: OptionsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide">
                GAME OPTIONS
              </h3>
              <p className="text-xs text-slate-400">Audio, controls & display preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Content */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {/* Sound FX Toggle */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${options.soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                  {options.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">Sound Effects (SFX)</div>
                  <div className="text-xs text-slate-400">Arcade pops, bounces, squeaks & bangs</div>
                </div>
              </div>

              <button
                onClick={() => onOptionsChange({ soundEnabled: !options.soundEnabled })}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                  options.soundEnabled
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {options.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {options.soundEnabled && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-700/60">
                <span className="text-xs text-slate-400 w-16">Volume:</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={options.soundVolume}
                  onChange={(e) => onOptionsChange({ soundVolume: parseFloat(e.target.value) })}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono text-xs text-white font-bold w-10 text-right">
                  {Math.round(options.soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Music Toggle (Procedural 8-bit Synth Arcade Garden Track) */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${options.musicEnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">Arcade Chiptune Music</div>
                  <div className="text-xs text-slate-400">Procedural 8-bit garden retro soundtrack</div>
                </div>
              </div>

              <button
                onClick={() => onOptionsChange({ musicEnabled: !options.musicEnabled })}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                  options.musicEnabled
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {options.musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {options.musicEnabled && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-700/60">
                <span className="text-xs text-slate-400 w-16">Volume:</span>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={options.musicVolume}
                  onChange={(e) => onOptionsChange({ musicVolume: parseFloat(e.target.value) })}
                  className="flex-1 accent-purple-500 cursor-pointer"
                />
                <span className="font-mono text-xs text-white font-bold w-10 text-right">
                  {Math.round(options.musicVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Full Screen Mode */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-extrabold text-sm text-white">Full Screen Mode</div>
                <div className="text-xs text-slate-400">Shortcut: Press <strong>F</strong> anytime in game</div>
              </div>
            </div>

            <button
              onClick={onToggleFullscreen}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                isFullscreen
                  ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4" /> Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4" /> Enter Fullscreen
                </>
              )}
            </button>
          </div>

          {/* Controls Information */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
            <div className="flex items-center gap-2 mb-3">
              <Gamepad2 className="w-5 h-5 text-amber-400" />
              <div className="font-extrabold text-sm text-white">Controls Reference</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Move Paddle</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  Mouse or ◀ ▶ / A D
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Launch Ball / Shoot</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  SPACE or Click
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Pause / Resume</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  P or Esc
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Toggle Full Screen</span>
                <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                  F
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="text-rose-400 flex items-center gap-1.5 font-medium">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            <span>with love for Yesra</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
