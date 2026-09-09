export type GameState = 'menu' | 'playing' | 'paused' | 'levelclear' | 'gameover' | 'gamewin';

export interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  radius: number;
  attachedToPaddle: boolean;
  isFireball?: boolean;
}

export interface Brick {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: number;
  hp: number;
  maxHp: number;
  unbreakable: boolean;
  color: string;
  accentColor?: string;
  isPowerupBrick?: boolean;
  isBonusBrick?: boolean;
  bonusPoints?: number;
  flashTimer?: number;
  shakeX?: number;
  shakeY?: number;
}

export interface Nain {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSpeed: number;
  w: number;
  h: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walking' | 'throwing' | 'falling' | 'juggled' | 'stunned' | 'splat' | 'poof';
  color: string;
  hatType: 'red' | 'green' | 'blue' | 'gold';
  hp: number;
  maxHp: number;
  standingOnBrickId: string | null;
  bounceCount: number;
  shootTimer: number;
  throwAnimTimer: number;
  tauntTimer: number;
  tauntText: string | null;
  animFrame: number;
  walkCycle: number;
  isParachuting?: boolean;
  dodgeCooldown?: number;
  hitCooldown?: number;
}

export type PowerUpType =
  | 'expand'
  | 'shrink'
  | 'multiball'
  | 'slow_ball'
  | 'fast_ball'
  | 'heart'
  | 'sticky'
  | 'laser'
  | 'fireball'
  | 'bonus_points'
  | 'shield';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: PowerUpType;
  vy: number;
  animFrame?: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  label: string;
  icon: string;
  color: string;
  totalDuration: number;
  remainingTime: number;
}

export interface Projectile {
  id?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'nain_pot' | 'nain_rock' | 'nain_ice' | 'nain_seed' | 'player_laser';
  radius: number;
  rotation?: number;
  vRot?: number;
  color?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  width?: number;
  height?: number;
  rotation?: number;
  vRot?: number;
  shape?: 'circle' | 'rect' | 'star';
  gravity?: number;
}

export interface FloatingText {
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

export interface LevelConfig {
  name: string;
  brickWidth: number;
  brickHeight: number;
  gap: number;
  offsetX: number;
  offsetY: number;
  grid: number[][];
  nainSpawns: Array<{
    x: number;
    y: number;
    hatType?: 'red' | 'green' | 'blue' | 'gold';
    color?: string;
  }>;
}

export const BRICK_COLORS: Record<number, string> = {
  1: '#ef4444', // 1: Normal Brick (Red/Rose) - 1 hit
  2: '#10b981', // 2: Strong Brick (Emerald/Bronze) - 2 hits (cracks on 1st)
  3: '#3b82f6', // 3: Very Strong Brick (Sapphire/Cobalt) - 3 hits (progressive cracks)
  4: '#94a3b8', // 4: Reinforced Titanium (Silver/Steel) - 4 hits (heavy fracture)
  5: '#f59e0b', // 5: Unbreakable Brick (Gold/Steel Riveted) - Indestructible Obstacle
  6: '#d946ef', // 6: Power-up Brick (Neon Magenta Gem) - 1-2 hits, guaranteed drop!
  7: '#eab308', // 7: Bonus Brick (Radiant Gold Star) - Extra points + sparkling chime!
};
