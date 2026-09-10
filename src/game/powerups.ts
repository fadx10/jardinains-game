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
    label: '1,000 BONUS POINTS',
    shortName: '+1000 PTS',
    icon: '⭐',
    symbol: '★',
    color: '#eab308', // Radiant star gold
    glowColor: '#fde047',
    durationMs: 0, // Instant
    announcement: '+1,000 BONUS POINTS! ⭐',
    sound: 'bonus_brick',
    description: 'Instantly grants 1,000 bonus points to your score',
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
  const isHeart = chosenType === 'heart';
  // Significantly enlarged reward dimensions (~1.6x larger: capsules 98x54, heart 88x80)
  const w = isHeart ? 88 : 98;
  const h = isHeart ? 80 : 54;
  // Ensure the larger reward remains strictly inside playing field bounds (arena 800 wide, 12px walls)
  const clampedX = Math.max(16, Math.min(800 - 16 - w, x - w / 2));
  return {
    id: `pw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    x: clampedX,
    y,
    w,
    h,
    type: chosenType,
    vy: 2.1 + Math.random() * 0.3, // Consistent comfortable fall speed
    animFrame: Math.random() * 100,
  };
}

// Traces a smooth, plump heart path matching the attached glossy sticker heart
function traceStickerHeartPath(
  ctx: CanvasRenderingContext2D,
  sw: number,
  sh: number
) {
  ctx.beginPath();
  // Cleft between top lobes
  ctx.moveTo(0, -sh * 0.32);
  // Left lobe upper curve
  ctx.bezierCurveTo(-sw * 0.54, -sh * 1.06, -sw * 1.06, -sh * 0.44, -sw * 1.06, 0.04);
  // Left bottom curve tapering to tip
  ctx.bezierCurveTo(-sw * 1.06, sh * 0.48, -sw * 0.36, sh * 0.84, 0, sh * 1.08);
  // Right bottom curve from tip upward
  ctx.bezierCurveTo(sw * 0.36, sh * 0.84, sw * 1.06, sh * 0.48, sw * 1.06, 0.04);
  // Right lobe upper curve back to cleft
  ctx.bezierCurveTo(sw * 1.06, -sh * 0.44, sw * 0.54, -sh * 1.06, 0, -sh * 0.32);
  ctx.closePath();
}

// Dedicated renderer for the 3D Glossy Candy Heart (matching user's uploaded image)
function drawGlossyHeartReward(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: number
) {
  // Gentle heartbeat pulse: lub-dub expansion
  const beat = Math.sin(frame * 0.15);
  const pulse = 1 + (beat > 0 ? beat * 0.08 : beat * 0.03);

  ctx.scale(pulse, pulse);

  const sw = (w / 2) * 0.88;
  const sh = (h / 2) * 0.84;

  // 1. Outer Soft White Die-Cut Sticker Outline with Rose Aura Glow
  ctx.shadowColor = '#fb7185';
  ctx.shadowBlur = 14;
  traceStickerHeartPath(ctx, sw * 1.08, sh * 1.08);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // 2. Bold Dark Inner Boundary (Black sticker line)
  ctx.shadowBlur = 0;
  traceStickerHeartPath(ctx, sw * 0.98, sh * 0.98);
  ctx.fillStyle = '#18181b';
  ctx.fill();

  // 3. 3D Candy Pink Gradient Body
  traceStickerHeartPath(ctx, sw * 0.90, sh * 0.90);
  const bodyGrad = ctx.createLinearGradient(-sw * 0.4, -sh * 0.5, sw * 0.4, sh * 0.6);
  bodyGrad.addColorStop(0, '#ffa3ca');    // Soft sweet pastel highlight
  bodyGrad.addColorStop(0.32, '#ff5695'); // Vibrant candy pink
  bodyGrad.addColorStop(0.72, '#db1b60'); // Deep rose magenta
  bodyGrad.addColorStop(1, '#9f1239');    // Dark contour shading
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // 4. Bottom-Right 3D Beveled Shading
  ctx.save();
  traceStickerHeartPath(ctx, sw * 0.90, sh * 0.90);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(sw * 0.4, sh * 0.4, sw * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(159, 18, 57, 0.4)';
  ctx.fill();
  ctx.restore();

  // 5. Specular Glass Reflections (Matching user's image highlights)
  // 5a. Large curved crescent highlight on upper-left lobe
  ctx.save();
  ctx.translate(-sw * 0.44, -sh * 0.28);
  ctx.rotate(-0.46);
  ctx.beginPath();
  ctx.ellipse(0, 0, sw * 0.20, sh * 0.38, 0, 0, Math.PI * 2);
  const shineGrad1 = ctx.createLinearGradient(0, -sh * 0.2, 0, sh * 0.2);
  shineGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  shineGrad1.addColorStop(0.6, 'rgba(255, 255, 255, 0.65)');
  shineGrad1.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
  ctx.fillStyle = shineGrad1;
  ctx.fill();
  ctx.restore();

  // 5b. Small top-right curved specular highlight
  ctx.save();
  ctx.translate(sw * 0.38, -sh * 0.50);
  ctx.rotate(0.38);
  ctx.beginPath();
  ctx.ellipse(0, 0, sw * 0.11, sh * 0.20, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fill();
  ctx.restore();

  // 6. Attached "+1 LIFE" Ribbon Banner
  ctx.save();
  ctx.translate(0, sh * 0.68);
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 8;

  // Banner Pill
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-36, -11, 72, 22, 11);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Banner Text
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♥ +1 LIFE', 0, 0.5);
  ctx.restore();
}

// Draw falling power-up with glow, attached visual emblem, and bobbing animation
export function drawPowerUp(ctx: CanvasRenderingContext2D, powerup: PowerUp) {
  const cfg = POWERUP_CONFIGS[powerup.type] || POWERUP_CONFIGS.expand;
  const frame = (powerup.animFrame || 0) + 1;
  powerup.animFrame = frame;

  // Gentle hovering bob & slight tilt
  const bobY = Math.sin(frame * 0.09) * 2.2;
  const tilt = Math.sin(frame * 0.07) * 0.08;

  const isHeart = powerup.type === 'heart';
  const w = powerup.w || (isHeart ? 88 : 98);
  const h = powerup.h || (isHeart ? 80 : 54);
  const x = powerup.x;
  const y = powerup.y + bobY;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(tilt);

  if (isHeart) {
    // Render the custom 3D glossy sticker heart
    drawGlossyHeartReward(ctx, w, h, frame);
    ctx.restore();
    return;
  }

  // Outer ambient pulsing glow
  const glowPulse = Math.sin(frame * 0.12) * 3 + 13;
  ctx.shadowColor = cfg.glowColor;
  ctx.shadowBlur = cfg.isNegative ? glowPulse + 5 : glowPulse;

  // Outer Base Capsule (Two-tone beveled pill)
  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.25, cfg.color);
  grad.addColorStop(0.85, '#0f172a');
  grad.addColorStop(1, '#020617');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, 20);
  ctx.fill();

  // Highlight Border with glow
  ctx.strokeStyle = cfg.isNegative ? '#fca5a5' : '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Glass Specular Sheen (top half glossy curve)
  ctx.shadowBlur = 0;
  const sheenGrad = ctx.createLinearGradient(0, -h / 2, 0, 0);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.08)');
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.roundRect(-w / 2 + 3, -h / 2 + 2.5, w - 6, (h - 5) / 2, [17, 17, 4, 4]);
  ctx.fill();

  // Attached Left Emblem Disc (Distinct icon badge)
  const emblemR = 19;
  const emblemX = -w / 2 + 7 + emblemR; // Centered on left side
  const emblemY = 0;

  ctx.save();
  ctx.beginPath();
  ctx.arc(emblemX, emblemY, emblemR, 0, Math.PI * 2);
  ctx.fillStyle = '#090d16';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Emblem Graphic Icon Rendering
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (powerup.type === 'bonus_points') {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('★', emblemX, emblemY + 1);
  } else if (powerup.type === 'multiball') {
    // 3 mini glowing spheres
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(emblemX - 7, emblemY + 3.5, 3.8, 0, Math.PI * 2);
    ctx.arc(emblemX + 7, emblemY + 3.5, 3.8, 0, Math.PI * 2);
    ctx.arc(emblemX, emblemY - 5.5, 3.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (powerup.type === 'laser') {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('⚡', emblemX, emblemY + 0.5);
  } else if (powerup.type === 'fireball') {
    ctx.fillStyle = '#fb923c';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('🔥', emblemX, emblemY + 0.5);
  } else if (powerup.type === 'expand') {
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 20px monospace, sans-serif';
    ctx.fillText('↔', emblemX, emblemY + 0.5);
  } else if (powerup.type === 'shrink') {
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px monospace, sans-serif';
    ctx.fillText('▼', emblemX, emblemY + 0.5);
  } else if (powerup.type === 'shield') {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('🛡️', emblemX, emblemY + 0.5);
  } else if (powerup.type === 'sticky') {
    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('🧲', emblemX, emblemY + 0.5);
  } else if (powerup.type === 'slow_ball') {
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('❄', emblemX, emblemY + 0.5);
  } else if (powerup.type === 'fast_ball') {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('⚡', emblemX, emblemY + 0.5);
  }
  ctx.restore();

  // High-Contrast Bold Text Label on Right Side
  const labelX = 20;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (powerup.type === 'expand') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('WIDE', labelX, 0.5);
  } else if (powerup.type === 'shrink') {
    ctx.fillStyle = '#fee2e2';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('MINI', labelX, 0.5);
  } else if (powerup.type === 'multiball') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13.5px system-ui, -apple-system, sans-serif';
    ctx.fillText('x3 BALL', labelX, 0.5);
  } else if (powerup.type === 'slow_ball') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('SLOW', labelX, 0.5);
  } else if (powerup.type === 'fast_ball') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('FAST', labelX, 0.5);
  } else if (powerup.type === 'sticky') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('CATCH', labelX, 0.5);
  } else if (powerup.type === 'laser') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('LASER', labelX, 0.5);
  } else if (powerup.type === 'fireball') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
    ctx.fillText('FIRE', labelX, 0.5);
  } else if (powerup.type === 'bonus_points') {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('+1000', labelX, 0.5);
  } else if (powerup.type === 'shield') {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
    ctx.fillText('SHIELD', labelX, 0.5);
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
  for (let i = 0; i < 20; i++) {
    const angle = (i / 20) * Math.PI * 2;
    const speed = Math.random() * 4 + 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      radius: Math.random() * 4 + 2,
      color,
      alpha: 1,
      decay: 0.03,
      shape: Math.random() < 0.5 ? 'star' : 'circle',
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

  // Score reward for catching a positive powerup
  if (!cfg.isNegative) {
    onScoreGain(150);
  }

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
      game.paddleWidth = Math.min(220, Math.round(game.paddleDefaultWidth * 1.85));
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
        const baseSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy) || b.speed || 4.6;
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
      onScoreGain(1000);
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
            b.vy = -Math.abs(b.vy || -b.speed || -4.6);
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
  if (activeTimers.has('fast_ball')) return 1.40;
  return 1.0;
}
