import React from 'react';
import { ActivePowerUp } from '../game/types';
import { POWERUP_CONFIGS } from '../game/powerups';

interface PowerUpTimersProps {
  activePowerUps: ActivePowerUp[];
}

export const PowerUpTimers: React.FC<PowerUpTimersProps> = ({ activePowerUps }) => {
  if (activePowerUps.length === 0) return null;

  return (
    <div
      id="powerup-timers-hud"
      className="flex flex-wrap items-center justify-center gap-2.5 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl max-w-2xl mx-auto transition-all duration-200"
    >
      {activePowerUps.map(pw => {
        const cfg = POWERUP_CONFIGS[pw.type];
        const pct = Math.max(0, Math.min(100, (pw.remainingTime / pw.totalDuration) * 100));
        const secondsLeft = Math.ceil(pw.remainingTime / 1000);
        const isUrgent = secondsLeft <= 3;

        return (
          <div
            key={pw.type}
            id={`powerup-badge-${pw.type}`}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono select-none transition-all ${
              cfg?.isNegative
                ? 'bg-rose-950/70 border-rose-600/60 text-rose-200 shadow-rose-950/50 shadow-md'
                : 'bg-slate-800/85 border-slate-600/70 text-slate-100 shadow-sm'
            } ${isUrgent ? 'animate-pulse' : ''}`}
          >
            {/* Icon Sphere */}
            <span
              className="flex items-center justify-center w-5 h-5 rounded-md text-sm font-bold text-white shadow-inner"
              style={{ backgroundColor: pw.color }}
            >
              {pw.icon}
            </span>

            {/* Label */}
            <span className="font-bold tracking-wider text-[11px] uppercase">
              {pw.label}
            </span>

            {/* Visual Progress Bar (████████░░) */}
            <div className="w-16 sm:w-20 h-2 bg-slate-950/80 rounded-full overflow-hidden border border-slate-700/50 p-0.5 flex items-center">
              <div
                className="h-full rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isUrgent ? '#ef4444' : pw.color,
                  boxShadow: `0 0 6px ${isUrgent ? '#ef4444' : pw.color}`,
                }}
              />
            </div>

            {/* Seconds Countdown */}
            <span
              className={`font-mono font-bold text-[11px] min-w-[20px] text-right ${
                isUrgent ? 'text-rose-400 font-extrabold' : 'text-slate-300'
              }`}
            >
              {secondsLeft}s
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PowerUpTimers;
