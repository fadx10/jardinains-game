import { PowerUp, PowerUpType, ActivePowerUp, Ball, Particle, FloatingText } from './types';
import { playSound, SoundEffect } from './audio';

export interface PowerUpConfig {
  type: PowerUpType;
  label: string;
  shortName: string;
  icon: string;
  symbol: string;
  color: string;
  glowColor: string;
  durationMs: number; // 0 = permanent / instant
  isNegative?: boolean;
  conflictsWith?: PowerUpType[];
  announcement: string;
  sound: SoundEffect;
  description: string;
}

export const POWERUP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  expand: {
    type: 'expand',
    label: 'WIDE PADDLE',
    shortName: 'Wide',
    icon: '↔',
    symbol: '↔',
    color: '#3b82f6', // Sapphire blue
    glowColor: '#60a5fa',
    durationMs: 16000,
    conflictsWith: ['shrink'],
    announcement: 'WIDE PADDLE!',
    sound: 'powerup',
    description: 'Expands paddle width to 160px for easier ball catches',
  },
  shrink: {
    type: 'shrink',
    label: 'SMALL PADDLE',
    shortName: 'Small',
    icon: '↔⁻',
    symbol: '⚠️',
    color: '#ef4444', // Danger crimson
    glowColor: '#f87171',
    durationMs: 12000,
    isNegative: true,
    conflictsWith: ['expand'],
    announcement: 'SMALL PADDLE! ⚠️',
    sound: 'rock_hit',
    description: 'Hazards! Shrinks paddle width to 65px',
  },
  multiball: {
    type: 'multiball',
    label: 'MULTI-BALL',
    shortName: 'Multi',
    icon: '🔵',
    symbol: 'x3',
    color: '#06b6d4', // Cyan
    glowColor: '#22d3ee',
    durationMs: 0, // Permanent until balls lost
    announcement: 'MULTI-BALL x3!',
    sound: 'powerup_multiball',
    description: 'Splits balls into 3 simultaneous active projectiles',
  },
  slow_ball: {
    type: 'slow_ball',
    label: 'SLOW BALL',
    shortName: 'Slow',
    icon: '❄',
    symbol: '❄',
    color: '#10b981', // Emerald ice
    glowColor: '#34d399',
    durationMs: 14000,
    conflictsWith: ['fast_ball'],
    announcement: 'SLOW BALL! ❄',
    sound: 'freeze',
    description: 'Slows down ball velocity by 35% for maximum precision',
  },
  fast_ball: {
    type: 'fast_ball',
    label: 'FAST BALL',
    shortName: 'Fast',
    icon: '⚡',
    symbol: '⚡',
    color: '#f59e0b', // Electric Amber
    glowColor: '#fbbf24',
    durationMs: 12000,
    conflictsWith: ['slow_ball'],
    announcement: 'FAST BALL! ⚡',
    sound: 'powerup',
    description: 'Accelerates ball speed by 35% for lightning combos',
  },
  heart: {
    type: 'heart',
    label: 'EXTRA LIFE',
    shortName: '+1 Life',
    icon: '♥',
    symbol: '♥',
    color: '#f43f5e', // Ruby Rose
    glowColor: '#fb7185',
    durationMs: 0, // Permanent
    announcement: 'EXTRA LIFE! ♥',
    sound: 'powerup',
    description: 'Restores +1 heart to your remaining lives',
  },
  sticky: {
    type: 'sticky',
    label: 'STICKY PADDLE',
    shortName: 'Sticky',
    icon: '🧲',
    symbol: '🧲',
    color: '#8b5cf6', // Violet
    glowColor: '#a78bfa',
    durationMs: 15000,
    announcement: 'STICKY PADDLE! 🧲',
    sound: 'powerup',
    description: 'Catches and holds balls on paddle; launch anytime with Space/Click',
  },
  laser: {
    type: 'laser',
    label: 'LASER CANNONS',
    shortName: 'Laser',
    icon: '🔫',
    symbol: '🔫',
    color: '#eab308', // Gold
    glowColor: '#fde047',
    durationMs: 16000,
    announcement: 'LASER CANNONS! 🔫',
    sound: 'powerup_laser',
    description: 'Mounts twin laser blasters to blast bricks & zap pesky Nains',
  },
  fireball: {
    type: 'fireball',
    label: 'FIRE BALL',
    shortName: 'Fireball',
    icon: '🔥',
    symbol: '🔥',
    color: '#ea580c', // Blazing flame orange
    glowColor: '#fb923c',
    durationMs: 14000,
    announcement: 'FIRE BALL! 🔥',
    sound: 'powerup',
    description: 'Turns balls into flaming meteors that pierce right through bricks',
  },
  bonus_points: {
    type: 'bonus_points',
    label: 'BONUS POINTS',
    shortName: '+500 PTS',
    icon: '⭐',
    symbol: '★',
    color: '#eab308', // Radiant star gold
    glowColor: '#facc15',
    durationMs: 0, // Instant
    announcement: '+500 BONUS POINTS! ⭐',
    sound: 'bonus_brick',
    description: 'Instantly grants 500 bonus points to your score',
  },
  shield: {
    type: 'shield',
    label: 'SAFETY SHIELD',
    shortName: 'Shield',
    icon: '🛡️',
    symbol: '🛡️',
    color: '#14b8a6', // Teal energy
    glowColor: '#2dd4bf',
    durationMs: 16000,
    announcement: 'SAFETY SHIELD! 🛡️',
    sound: 'powerup_shield',
    description: 'Generates a floor barrier that deflects dropped balls safely back up',
  },
};

export const ALL_POWERUP_TYPES: PowerUpType[] = [
  'expand',
  'shrink',
  'multiball',
  'slow_ball',
  'fast_ball',
  'heart',
  'sticky',
  'laser',
  'fireball',
  'bonus_points',
  'shield',
];

// Weighted random selection for standard drops (10-20% rate)
export function getRandomPowerUpType(): PowerUpType {
  const roll = Math.random();
  if (roll < 0.16) return 'expand';
  if (roll < 0.28) return 'multiball';
  if (roll < 0.40) return 'laser';
  if (roll < 0.52) return 'fireball';
  if (roll < 0.62) return 'sticky';
  if (roll < 0.72) return 'slow_ball';
  if (roll < 0.82) return 'shield';
  if (roll < 0.90) return 'bonus_points';
  if (roll < 0.95) return 'heart';
  return Math.random() < 0.5 ? 'shrink' : 'fast_ball'; // Occasional challenging negative/fast hazard
}

export function createPowerUp(x: number, y: number, type?: PowerUpType): PowerUp {
  const chosenType = type || getRandomPowerUpType();
  return {
    id: `pw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    x: x - 13,
    y,
    w: 26,
    h: 18,
    type: chosenType,
    vy: 2.3 + Math.random() * 0.4, // Consistent, comfortable 2.3-2.7 px/frame fall speed
    animFrame: Math.random() * 100,
  };
}

// Draw falling power-up pill capsule with glow, symbol, and bobbing animation
export function drawPowerUp(ctx: CanvasRenderingContext2D, powerup: PowerUp) {
  const cfg = POWERUP_CONFIGS[powerup.type] || POWERUP_CONFIGS.expand;
  const frame = (powerup.animFrame || 0) + 1;
  powerup.animFrame = frame;

  // Gentle hovering bob & slight tilt
  const bobY = Math.sin(frame * 0.08) * 1.5;
  const tilt = Math.sin(frame * 0.06) * 0.08;

  const x = powerup.x;
  const y = powerup.y + bobY;
  const w = powerup.w;
  const h = powerup.h;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(tilt);

  // Outer ambient glow
  ctx.shadowColor = cfg.glowColor;
  ctx.shadowBlur = cfg.isNegative ? 12 : 8;

  // Pill Capsule Outer Base
  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.3, cfg.color);
  grad.addColorStop(1, '#0f172a');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 8);
  ctx.fill();

  // Highlight Border
  ctx.strokeStyle = cfg.isNegative ? '#fca5a5' : '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glass Specular Sheen (top half)
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 2, -h / 2 + 1.5, w - 4, (h - 3) / 2, [6, 6, 2, 2]);
  ctx.fill();

  // Symbol / Icon rendering
  ctx.fillStyle = cfg.isNegative ? '#fee2e2' : '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 3;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (powerup.type === 'expand') {
    ctx.font = 'bold 12px monospace, sans-serif';
    ctx.fillText('↔', 0, 0.5);
  } else if (powerup.type === 'shrink') {
    ctx.font = 'bold 10px monospace, sans-serif';
    ctx.fillText('↔⁻', 0, 0.5);
  } else if (powerup.type === 'multiball') {
    // 3 mini spheres
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5, 0, 2.5, 0, Math.PI * 2);
    ctx.arc(0, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(5, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (powerup.type === 'slow_ball') {
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('❄', 0, 0.5);
  } else if (powerup.type === 'fast_ball') {
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('⚡', 0, 0.5);
  } else if (powerup.type === 'heart') {
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('♥', 0, 0.5);
  } else if (powerup.type === 'sticky') {
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('🧲', 0, 0.5);
  } else if (powerup.type === 'laser') {
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText('🔫', 0, 0.5);
  } else if (powerup.type === 'fireball') {
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('🔥', 0, 0.5);
  } else if (powerup.type === 'bonus_points') {
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.fillText('★', 0, 0.5);
  } else if (powerup.type === 'shield') {
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText('🛡️', 0, 0.5);
  }

  ctx.restore();
}

// Particle explosion & ring burst on powerup catch
export function spawnPowerUpCatchFX(
  x: number,
  y: number,
  color: string,
  particles: Particle[]
) {
  // Radiant expanding ring particles
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const speed = Math.random() * 3 + 2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      radius: Math.random() * 3 + 1.5,
      color,
      alpha: 1,
      decay: 0.035,
      shape: Math.random() < 0.4 ? 'star' : 'circle',
    });
  }
}

// Applies collected powerup with strict conflict rules and stacking limits
export function applyPowerUpPickup(
  powerup: PowerUp,
  game: {
    paddleX: number;
    paddleWidth: number;
    paddleDefaultWidth: number;
    balls: Ball[];
    shieldActive: boolean;
    stickyBall: boolean;
    laserActiveTime: number;
    activeTimers: Map<PowerUpType, { totalDuration: number; remainingTime: number }>;
    particles: Particle[];
    floatingTexts: FloatingText[];
  },
  paddleY: number,
  onScoreGain: (pts: number) => void,
  onLifeGain: (delta: number) => void,
  triggerSound: (snd: SoundEffect) => void
) {
  const cfg = POWERUP_CONFIGS[powerup.type];
  if (!cfg) return;

  // Sound trigger
  triggerSound(cfg.sound);

  // FX Particles at paddle contact point
  spawnPowerUpCatchFX(powerup.x + powerup.w / 2, paddleY, cfg.glowColor, game.particles);

  // Big Floating Announcement
  game.floatingTexts.push({
    text: cfg.announcement,
    x: powerup.x + powerup.w / 2,
    y: paddleY - 25,
    color: cfg.glowColor,
    alpha: 1,
    vy: -1.6,
  });

  // Handle Conflicting Effects (Newest replaces previous)
  if (cfg.conflictsWith) {
    for (const conflictType of cfg.conflictsWith) {
      game.activeTimers.delete(conflictType);
      if (conflictType === 'shrink' || conflictType === 'expand') {
        game.paddleWidth = game.paddleDefaultWidth;
      }
    }
  }

  // Handle Timed vs Permanent Effects
  if (cfg.durationMs > 0) {
    const existing = game.activeTimers.get(powerup.type);
    if (existing) {
      // Extend or reset duration up to 1.5x max
      existing.remainingTime = Math.min(cfg.durationMs * 1.5, existing.remainingTime + cfg.durationMs * 0.7);
    } else {
      game.activeTimers.set(powerup.type, {
        totalDuration: cfg.durationMs,
        remainingTime: cfg.durationMs,
      });
    }
  }

  // Execute Specific Effect Logic
  switch (powerup.type) {
    case 'expand': {
      game.paddleWidth = Math.min(200, Math.round(game.paddleDefaultWidth * 1.55));
      break;
    }
    case 'shrink': {
      game.paddleWidth = Math.max(55, Math.round(game.paddleDefaultWidth * 0.65));
      break;
    }
    case 'multiball': {
      // Split each existing ball into 3 balls with fanned trajectory
      const currentBalls = [...game.balls];
      const newBalls: Ball[] = [];

      currentBalls.forEach(b => {
        const baseSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || 7.5;
        const currentAngle = Math.atan2(b.vy, b.vx);

        // Cloned Ball A (+30 degrees)
        const angleA = currentAngle - 0.5;
        newBalls.push({
          id: `ball_m_${Date.now()}_${Math.random()}`,
          x: b.x,
          y: b.y,
          vx: Math.cos(angleA) * baseSpeed,
          vy: Math.sin(angleA) * baseSpeed,
          speed: b.speed,
          radius: b.radius,
          attachedToPaddle: false,
          isFireball: b.isFireball,
        });

        // Cloned Ball B (-30 degrees)
        const angleB = currentAngle + 0.5;
        newBalls.push({
          id: `ball_m_${Date.now()}_${Math.random()}`,
          x: b.x,
          y: b.y,
          vx: Math.cos(angleB) * baseSpeed,
          vy: Math.sin(angleB) * baseSpeed,
          speed: b.speed,
          radius: b.radius,
          attachedToPaddle: false,
          isFireball: b.isFireball,
        });
      });

      // Keep max 9 balls on screen simultaneously for performance
      game.balls.push(...newBalls.slice(0, 6));
      break;
    }
    case 'slow_ball': {
      // Handled in ball movement loop based on active timer
      break;
    }
    case 'fast_ball': {
      // Handled in ball movement loop based on active timer
      break;
    }
    case 'heart': {
      onLifeGain(1);
      break;
    }
    case 'sticky': {
      game.stickyBall = true;
      break;
    }
    case 'laser': {
      game.laserActiveTime = cfg.durationMs;
      break;
    }
    case 'fireball': {
      game.balls.forEach(b => {
        b.isFireball = true;
      });
      break;
    }
    case 'bonus_points': {
      onScoreGain(500);
      break;
    }
    case 'shield': {
      game.shieldActive = true;
      break;
    }
  }
}

// Tick down active timers and revert expired effects
export function tickActivePowerUps(
  activeTimers: Map<PowerUpType, { totalDuration: number; remainingTime: number }>,
  dtMs: number,
  game: {
    paddleWidth: number;
    paddleDefaultWidth: number;
    balls: Ball[];
    shieldActive: boolean;
    stickyBall: boolean;
    laserActiveTime: number;
  }
): ActivePowerUp[] {
  const activeList: ActivePowerUp[] = [];

  for (const [type, state] of activeTimers.entries()) {
    state.remainingTime -= dtMs;

    if (state.remainingTime <= 0) {
      // Expired! Revert effect cleanly
      activeTimers.delete(type);

      if (type === 'expand' || type === 'shrink') {
        game.paddleWidth = game.paddleDefaultWidth;
      } else if (type === 'fireball') {
        game.balls.forEach(b => {
          b.isFireball = false;
        });
      } else if (type === 'sticky') {
        game.stickyBall = false;
        // Release any attached balls
        game.balls.forEach(b => {
          if (b.attachedToPaddle) {
            b.attachedToPaddle = false;
            b.vy = -Math.abs(b.vy || -7);
          }
        });
      } else if (type === 'laser') {
        game.laserActiveTime = 0;
      } else if (type === 'shield') {
        game.shieldActive = false;
      }
    } else {
      const cfg = POWERUP_CONFIGS[type];
      if (cfg) {
        activeList.push({
          type,
          label: cfg.label,
          icon: cfg.icon,
          color: cfg.color,
          totalDuration: state.totalDuration,
          remainingTime: state.remainingTime,
        });
      }
    }
  }

  return activeList;
}

// Get effective ball speed multiplier based on active Slow/Fast powerups
export function getBallSpeedMultiplier(
  activeTimers: Map<PowerUpType, { totalDuration: number; remainingTime: number }>
): number {
  if (activeTimers.has('slow_ball')) return 0.65;
  if (activeTimers.has('fast_ball')) return 1.35;
  return 1.0;
}
