import React, { useEffect, useRef, useState } from 'react';
import { HighScoreEntry, GameOptions } from './types';
import { GameState, Ball, Brick, Nain, PowerUp, Projectile, Particle, FloatingText, PowerUpType, ActivePowerUp } from './game/types';
import { LEVELS, TOTAL_LEVELS, getLevelName } from './game/levels';
import { playSound, startMusic, stopMusic, setSoundMuted, setMusicEnabled, setSoundVolume, setMusicVolume } from './game/audio';
import { updateJardinains, drawJardinain, drawProjectile, createParachutingNain, NAIN_WIDTH, NAIN_HEIGHT } from './game/nain';
import { applyPowerUpPickup, tickActivePowerUps, drawPowerUp, getBallSpeedMultiplier, POWERUP_CONFIGS, createPowerUp } from './game/powerups';
import { drawArcadeBorder, drawClassicBeveledBrick, drawClassicPaddle, drawClassicBall, drawClassicShield } from './game/retroUi';

// Modals
import AboutModal from './components/AboutModal';
import HighScoresModal from './components/HighScoresModal';
import HowToPlayModal from './components/HowToPlayModal';
import LevelSelectModal from './components/LevelSelectModal';
import OptionsModal from './components/OptionsModal';
import QuitModal from './components/QuitModal';
import PowerUpTimers from './components/PowerUpTimers';

import { Play, Settings, Trophy, HelpCircle, Info, Grid, Heart } from 'lucide-react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_DEFAULT_WIDTH = 90;
const PADDLE_HEIGHT = 16;
const PADDLE_Y = CANVAS_HEIGHT - 40;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const lastPowerUpSyncRef = useRef<number>(0);
  
  const [options, setOptions] = useState<GameOptions>({
    soundEnabled: true,
    soundVolume: 0.65,
    musicEnabled: true,
    musicVolume: 0.25,
  });

  // Modal states
  const [showAbout, setShowAbout] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showQuit, setShowQuit] = useState(false);

  // Game Engine State (Refs for synchronous loop)
  const engineRef = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2,
    paddleWidth: PADDLE_DEFAULT_WIDTH,
    paddleDefaultWidth: PADDLE_DEFAULT_WIDTH,
    balls: [] as Ball[],
    bricks: [] as Brick[],
    nains: [] as Nain[],
    powerups: [] as PowerUp[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    activeTimers: new Map<PowerUpType, { totalDuration: number; remainingTime: number }>(),
    shieldActive: false,
    stickyBall: false,
    laserActiveTime: 0,
    nainsJuggled: 0,
    keys: {} as Record<string, boolean>,
    lastTime: performance.now(),
    animationFrameId: 0,
  });

  // Render Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const engine = engineRef.current;

    const loop = (time: number) => {
      const dt = time - engine.lastTime;
      engine.lastTime = time;

      update(dt);
      draw(ctx);

      if (gameState === 'playing') {
        engine.animationFrameId = requestAnimationFrame(loop);
      }
    };

    engine.lastTime = performance.now();
    engine.animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(engine.animationFrameId);
  }, [gameState]);

  // Load High Scores & Options
  useEffect(() => {
    try {
      const savedScores = localStorage.getItem('jardinains_scores');
      if (savedScores) setHighScores(JSON.parse(savedScores));
      const savedLevel = localStorage.getItem('jardinains_unlocked');
      if (savedLevel) setUnlockedLevel(parseInt(savedLevel, 10));
      const savedOptions = localStorage.getItem('jardinains_options');
      if (savedOptions) {
        const parsedOpts = JSON.parse(savedOptions);
        setOptions(parsedOpts);
        setSoundMuted(!parsedOpts.soundEnabled);
        setSoundVolume(parsedOpts.soundVolume);
        setMusicEnabled(parsedOpts.musicEnabled);
        setMusicVolume(parsedOpts.musicVolume);
      }
    } catch {}
  }, []);

  const saveOptions = (newOpts: Partial<GameOptions>) => {
    const updated = { ...options, ...newOpts };
    setOptions(updated);
    setSoundMuted(!updated.soundEnabled);
    setSoundVolume(updated.soundVolume);
    setMusicEnabled(updated.musicEnabled);
    setMusicVolume(updated.musicVolume);
    try {
      localStorage.setItem('jardinains_options', JSON.stringify(updated));
    } catch {}
  };

  const handleLevelComplete = () => {
    playSound('levelclear');
    stopMusic();
    if (currentLevelIdx + 1 >= TOTAL_LEVELS) {
      playSound('win');
      setGameState('gamewin');
    } else {
      setGameState('levelclear');
      const nextLvl = currentLevelIdx + 2;
      if (nextLvl > unlockedLevel) {
        setUnlockedLevel(nextLvl);
        localStorage.setItem('jardinains_unlocked', nextLvl.toString());
      }
    }
  };

  const handleGameOver = () => {
    playSound('gameover');
    stopMusic();
    setGameState('gameover');
  };

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      engineRef.current.keys[e.code] = true;
      if (e.code === 'Space' && gameState === 'playing') {
        // Launch attached balls
        engineRef.current.balls.forEach(b => {
          if (b.attachedToPaddle) {
            b.attachedToPaddle = false;
            b.vy = -Math.abs(b.vy || -7);
            playSound('paddle');
          }
        });
      }
      if ((e.code === 'KeyP' || e.code === 'Escape') && gameState === 'playing') {
        setGameState('paused');
        stopMusic();
      } else if ((e.code === 'KeyP' || e.code === 'Escape') && gameState === 'paused') {
        setGameState('playing');
        engineRef.current.lastTime = performance.now();
        if (options.musicEnabled) startMusic();
      }
      if (e.code === 'KeyF') {
        toggleFullscreen();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, options.musicEnabled]);

  // Mouse & Touch Controls
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    engineRef.current.paddleX = Math.max(12, Math.min(CANVAS_WIDTH - 12 - engineRef.current.paddleWidth, x - engineRef.current.paddleWidth / 2));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const x = (e.touches[0].clientX - rect.left) * scaleX;
    engineRef.current.paddleX = Math.max(12, Math.min(CANVAS_WIDTH - 12 - engineRef.current.paddleWidth, x - engineRef.current.paddleWidth / 2));
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (canvas && e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const x = (e.touches[0].clientX - rect.left) * scaleX;
      engineRef.current.paddleX = Math.max(12, Math.min(CANVAS_WIDTH - 12 - engineRef.current.paddleWidth, x - engineRef.current.paddleWidth / 2));
    }
    handleMouseDown();
  };

  const handleMouseDown = () => {
    if (gameState !== 'playing') return;
    engineRef.current.balls.forEach(b => {
      if (b.attachedToPaddle) {
        b.attachedToPaddle = false;
        b.vy = -Math.abs(b.vy || -7);
        playSound('paddle');
      }
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const startGame = (levelIdx: number) => {
    const config = LEVELS[levelIdx];
    const engine = engineRef.current;
    
    // Reset Engine State
    engine.paddleWidth = PADDLE_DEFAULT_WIDTH;
    engine.paddleDefaultWidth = PADDLE_DEFAULT_WIDTH;
    engine.paddleX = CANVAS_WIDTH / 2 - engine.paddleWidth / 2;
    engine.activeTimers.clear();
    engine.shieldActive = false;
    engine.stickyBall = false;
    engine.laserActiveTime = 0;
    engine.nainsJuggled = 0;
    setActivePowerUps([]);
    lastPowerUpSyncRef.current = 0;
    
    engine.balls = [{
      id: 'b1',
      x: engine.paddleX + engine.paddleWidth / 2,
      y: PADDLE_Y - 8,
      vx: 0,
      vy: 0,
      speed: 7.5,
      radius: 6,
      attachedToPaddle: true
    }];

    engine.projectiles = [];
    engine.powerups = [];
    engine.particles = [];
    engine.floatingTexts = [];

    // Parse Bricks
    engine.bricks = [];
    config.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell > 0) {
          engine.bricks.push({
            id: `brick_${r}_${c}`,
            x: config.offsetX + c * (config.brickWidth + config.gap),
            y: config.offsetY + r * (config.brickHeight + config.gap),
            w: config.brickWidth,
            h: config.brickHeight,
            type: cell,
            hp: cell === 5 ? 999 : cell === 4 ? 4 : cell === 3 ? 3 : cell === 2 ? 2 : 1,
            maxHp: cell === 4 ? 4 : cell === 3 ? 3 : cell === 2 ? 2 : 1,
            unbreakable: cell === 5,
            color: ['#ef4444','#10b981','#3b82f6','#94a3b8','#f59e0b','#d946ef','#eab308'][cell-1],
          });
        }
      });
    });

    // Parse Nains
    engine.nains = config.nainSpawns.map(ns => {
      const nain = createParachutingNain(ns.x, ns.y, ns.hatType);
      return nain;
    });

    setCurrentLevelIdx(levelIdx);
    setGameState('playing');
    playSound('start');
    if (options.musicEnabled) startMusic();
  };

  const update = (dt: number) => {
    const engine = engineRef.current;
    
    // Paddle movement via keys
    if (engine.keys['ArrowLeft'] || engine.keys['KeyA']) engine.paddleX -= 8;
    if (engine.keys['ArrowRight'] || engine.keys['KeyD']) engine.paddleX += 8;
    engine.paddleX = Math.max(12, Math.min(CANVAS_WIDTH - 12 - engine.paddleWidth, engine.paddleX));

    // Powerups tick
    const activeList = tickActivePowerUps(engine.activeTimers, dt, engine);
    const now = performance.now();
    if (now - lastPowerUpSyncRef.current > 100) {
      lastPowerUpSyncRef.current = now;
      setActivePowerUps([...activeList]);
    }

    // Laser firing
    if (engine.laserActiveTime > 0) {
      engine.laserActiveTime -= dt;
      if (Math.random() < 0.05) { // Fire rate
        engine.projectiles.push({
          id: `laser_${Date.now()}_${Math.random()}`,
          x: engine.paddleX + engine.paddleWidth * 0.2,
          y: PADDLE_Y,
          vx: 0,
          vy: -8,
          type: 'player_laser',
          radius: 2,
        });
        engine.projectiles.push({
          id: `laser_${Date.now()}_${Math.random()}`,
          x: engine.paddleX + engine.paddleWidth * 0.8,
          y: PADDLE_Y,
          vx: 0,
          vy: -8,
          type: 'player_laser',
          radius: 2,
        });
        playSound('laser', { pitchMult: 1.5 });
      }
    }

    const speedMult = getBallSpeedMultiplier(engine.activeTimers);

    // Balls
    for (let i = engine.balls.length - 1; i >= 0; i--) {
      const b = engine.balls[i];
      if (b.attachedToPaddle) {
        b.x = engine.paddleX + engine.paddleWidth / 2;
        b.y = PADDLE_Y - b.radius;
        continue;
      }

      b.x += b.vx * speedMult;
      b.y += b.vy * speedMult;

      // Walls (12px stone arcade border)
      const wallThickness = 12;
      if (b.x - b.radius < wallThickness) {
        b.x = wallThickness + b.radius;
        b.vx = Math.abs(b.vx);
        playSound('wall');
      }
      if (b.x + b.radius > CANVAS_WIDTH - wallThickness) {
        b.x = CANVAS_WIDTH - wallThickness - b.radius;
        b.vx = -Math.abs(b.vx);
        playSound('wall');
      }
      if (b.y - b.radius < wallThickness) {
        b.y = wallThickness + b.radius;
        b.vy = Math.abs(b.vy);
        playSound('wall');
      }

      // Bottom
      if (b.y + b.radius > CANVAS_HEIGHT) {
        if (engine.shieldActive) {
          b.y = CANVAS_HEIGHT - b.radius;
          b.vy = -Math.abs(b.vy);
          playSound('shield');
          engine.activeTimers.delete('shield');
          engine.shieldActive = false;
        } else {
          engine.balls.splice(i, 1);
          if (engine.balls.length === 0) {
            // Lost life
            setLives(prev => {
              const next = prev - 1;
              if (next <= 0) handleGameOver();
              else {
                engine.balls.push({
                  id: 'b_new',
                  x: engine.paddleX + engine.paddleWidth / 2,
                  y: PADDLE_Y - 8,
                  vx: 0,
                  vy: 0,
                  speed: 7.5,
                  radius: 6,
                  attachedToPaddle: true
                });
              }
              return next;
            });
            playSound('ball_lost');
          }
        }
        continue;
      }

      // Paddle collision
      if (
        b.vy > 0 &&
        b.y + b.radius >= PADDLE_Y &&
        b.y - b.radius <= PADDLE_Y + PADDLE_HEIGHT &&
        b.x >= engine.paddleX &&
        b.x <= engine.paddleX + engine.paddleWidth
      ) {
        if (engine.stickyBall) {
          b.attachedToPaddle = true;
          b.vx = 0;
          b.vy = 0;
          b.y = PADDLE_Y - b.radius;
        } else {
          b.y = PADDLE_Y - b.radius;
          b.vy = -Math.abs(b.vy);
          const hitPos = (b.x - (engine.paddleX + engine.paddleWidth / 2)) / (engine.paddleWidth / 2);
          b.vx = hitPos * b.speed;
        }
        playSound('paddle');
      }

      // Bricks collision
      for (let j = engine.bricks.length - 1; j >= 0; j--) {
        const brick = engine.bricks[j];
        // simple AABB
        const closestX = Math.max(brick.x, Math.min(b.x, brick.x + brick.w));
        const closestY = Math.max(brick.y, Math.min(b.y, brick.y + brick.h));
        const dx = b.x - closestX;
        const dy = b.y - closestY;
        
        if (dx * dx + dy * dy < b.radius * b.radius) {
          if (!b.isFireball) {
            // Determine bounce direction
            if (Math.abs(dx) > Math.abs(dy)) b.vx = -b.vx;
            else b.vy = -b.vy;
          }

          if (brick.unbreakable && !b.isFireball) {
            playSound('unbreakable_hit');
          } else {
            brick.hp -= b.isFireball ? 999 : 1;
            brick.flashTimer = 5;
            if (brick.hp <= 0) {
              engine.bricks.splice(j, 1);
              let pts = 50;
              if (brick.type === 2) pts = 100;
              if (brick.type === 3) pts = 150;
              if (brick.type === 4) pts = 200;
              if (brick.type === 6) pts = 100;
              if (brick.type === 7) pts = 250;
              setScore(s => s + pts);
              playSound(brick.type === 7 ? 'bonus_brick' : 'brick_break');

              if (brick.type === 6) {
                engine.powerups.push(createPowerUp(brick.x + brick.w/2, brick.y + brick.h));
              }

              for (let p = 0; p < 5; p++) {
                engine.particles.push({
                  x: brick.x + brick.w / 2,
                  y: brick.y + brick.h / 2,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  radius: Math.random() * 3,
                  color: brick.color,
                  alpha: 1,
                  decay: 0.05
                });
              }

              // Check level clear
              if (engine.bricks.filter(b => !b.unbreakable).length === 0) {
                handleLevelComplete();
              }
            } else {
              playSound('brick_hit');
            }
          }
          break; // One collision per frame
        }
      }
    }

    // Powerups falling
    for (let i = engine.powerups.length - 1; i >= 0; i--) {
      const p = engine.powerups[i];
      p.y += p.vy;
      if (
        p.y + p.h >= PADDLE_Y &&
        p.y <= PADDLE_Y + PADDLE_HEIGHT &&
        p.x + p.w >= engine.paddleX &&
        p.x <= engine.paddleX + engine.paddleWidth
      ) {
        applyPowerUpPickup(
          p, engine, PADDLE_Y, 
          (pts) => setScore(s => s + pts), 
          (dLife) => setLives(l => l + dLife), 
          (s) => playSound(s)
        );
        engine.powerups.splice(i, 1);
      } else if (p.y > CANVAS_HEIGHT) {
        engine.powerups.splice(i, 1);
      }
    }

    // Nains
    updateJardinains(
      engine.nains, engine.bricks, engine.projectiles, engine.particles, engine.floatingTexts, engine.powerups, engine.balls,
      engine.paddleX, engine.paddleWidth, PADDLE_Y, CANVAS_WIDTH, CANVAS_HEIGHT,
      (pts) => setScore(s => s + pts),
      (cnt) => engine.nainsJuggled += 1,
      (s, opts) => playSound(s, opts)
    );

    // Projectiles
    for (let i = engine.projectiles.length - 1; i >= 0; i--) {
      const pr = engine.projectiles[i];
      pr.x += pr.vx;
      pr.y += pr.vy;
      if (pr.rotation !== undefined && pr.vRot) pr.rotation += pr.vRot;

      if (pr.type === 'player_laser') {
        // Hit bricks?
        let hit = false;
        for (let j = engine.bricks.length - 1; j >= 0; j--) {
          const br = engine.bricks[j];
          if (pr.x >= br.x && pr.x <= br.x + br.w && pr.y >= br.y && pr.y <= br.y + br.h) {
            engine.projectiles.splice(i, 1);
            hit = true;
            if (!br.unbreakable) {
              br.hp -= 1;
              if (br.hp <= 0) {
                engine.bricks.splice(j, 1);
                playSound('brick_break');
                setScore(s => s + 50);
                if (engine.bricks.filter(b => !b.unbreakable).length === 0) handleLevelComplete();
              }
            } else { playSound('unbreakable_hit'); }
            break;
          }
        }
        if (!hit && pr.y < 0) engine.projectiles.splice(i, 1);
      } else {
        // Nain projectiles
        if (
          pr.y + pr.radius >= PADDLE_Y &&
          pr.y - pr.radius <= PADDLE_Y + PADDLE_HEIGHT &&
          pr.x >= engine.paddleX &&
          pr.x <= engine.paddleX + engine.paddleWidth
        ) {
          // Player hit!
          engine.projectiles.splice(i, 1);
          playSound('rock_hit');
          
          if (engine.shieldActive) {
            engine.shieldActive = false;
            engine.activeTimers.delete('shield');
            playSound('shield');
          } else {
            // Disarm paddle width or just penalize points/stun
            setScore(s => Math.max(0, s - 100));
            engine.paddleWidth = Math.max(40, engine.paddleWidth - 10);
            engine.floatingTexts.push({ text: '-100', x: engine.paddleX, y: PADDLE_Y, color: '#ef4444', alpha: 1, vy: -1 });
          }
        } else if (pr.y > CANVAS_HEIGHT) {
          engine.projectiles.splice(i, 1);
        }
      }
    }

    // Particles
    for (let i = engine.particles.length - 1; i >= 0; i--) {
      const p = engine.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) engine.particles.splice(i, 1);
    }

    // Floating texts
    for (let i = engine.floatingTexts.length - 1; i >= 0; i--) {
      const ft = engine.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.02;
      if (ft.alpha <= 0) engine.floatingTexts.splice(i, 1);
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    const engine = engineRef.current;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Classic Retro Deep Slate & Garden Night Sky Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#0c1527');
    bgGrad.addColorStop(1, '#060a12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle twinkling stars in the sky
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let s = 0; s < 30; s++) {
      const sx = ((s * 41 + 17) % (CANVAS_WIDTH - 30)) + 15;
      const sy = ((s * 31 + 23) % (CANVAS_HEIGHT - 30)) + 15;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // 2. Stone/Brick Arcade Border Walls (Original Jardinains classic frame)
    drawArcadeBorder(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, 12);

    // 3. Bottom Shield / Energetic Forcefield Barrier
    if (engine.shieldActive) {
      drawClassicShield(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, performance.now());
    }

    // 4. Authentic 3D Beveled Bricks (with specular sheen & crack damage)
    engine.bricks.forEach(b => drawClassicBeveledBrick(ctx, b));

    // 5. Classic Red & Silver Metallic Arcade Paddle (with laser barrels / sticky slime)
    drawClassicPaddle(
      ctx,
      engine.paddleX,
      PADDLE_Y,
      engine.paddleWidth,
      PADDLE_HEIGHT,
      engine.stickyBall,
      engine.laserActiveTime > 0
    );

    // 6. 3D Chrome Spherical Balls & Fireball particles
    engine.balls.forEach(b => drawClassicBall(ctx, b));

    // 7. Powerups
    engine.powerups.forEach(p => drawPowerUp(ctx, p));

    // 8. Mischievous Jardinains (Authentic animated gnomes)
    engine.nains.forEach(n => drawJardinain(ctx, n));

    // 9. Projectiles (Lasers & Nain rocks)
    engine.projectiles.forEach(p => drawProjectile(ctx, p));

    // 10. Particles
    engine.particles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // 11. Floating Texts
    engine.floatingTexts.forEach(ft => {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.globalAlpha = 1;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-100 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80 pointer-events-none" />

      {/* Main Game Container */}
      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col gap-4">
        
        {/* Header HUD - Authentic Original Jardinains Arcade Cabinet Frame */}
        <header className="flex items-center justify-between bg-slate-900/95 backdrop-blur-md p-3 md:p-3.5 rounded-2xl border-2 border-amber-500/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle gold trim line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 opacity-80" />

          {/* Left: JARDINAINS! with love for yesra right underneath */}
          <div 
            className="flex flex-col cursor-pointer select-none group" 
            onClick={() => setGameState('menu')} 
            title="Return to Main Menu"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-500 italic font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                JARDINAINS!
              </h1>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/40 hidden sm:inline-block">
                1000 LVL
              </span>
            </div>
            <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5 -mt-0.5 tracking-wide group-hover:text-rose-300 transition-colors">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline-block animate-pulse" />
              <span>with love for yesra</span>
            </div>
          </div>

          {/* Original Jardinains Classic Arcade Status Bar */}
          {gameState !== 'menu' && (
            <div className="flex items-center gap-2 sm:gap-4 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-amber-500/30 shadow-inner font-mono text-xs">
              {/* Score LED */}
              <div className="flex flex-col items-center min-w-[65px]">
                <span className="text-[9px] font-bold text-amber-400/80 tracking-wider">SCORE</span>
                <span className="text-sm md:text-base font-black text-amber-300 tracking-widest font-mono">
                  {score.toString().padStart(6, '0')}
                </span>
              </div>

              <div className="w-px h-6 bg-slate-800" />

              {/* Level */}
              <div className="flex flex-col items-center min-w-[50px]">
                <span className="text-[9px] font-bold text-cyan-400/80 tracking-wider">LEVEL</span>
                <span className="text-sm md:text-base font-black text-cyan-300 font-mono">
                  {currentLevelIdx + 1}
                </span>
              </div>

              <div className="w-px h-6 bg-slate-800" />

              {/* Lives */}
              <div className="flex flex-col items-center min-w-[45px]">
                <span className="text-[9px] font-bold text-rose-400/80 tracking-wider">LIVES</span>
                <div className="flex items-center gap-1 text-sm md:text-base font-black text-rose-400 font-mono">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>x{lives}</span>
                </div>
              </div>

              {/* Nain Juggles Combo Counter */}
              {engineRef.current.nainsJuggled > 0 && (
                <>
                  <div className="w-px h-6 bg-slate-800 hidden sm:block" />
                  <div className="flex-col items-center min-w-[55px] animate-pulse hidden sm:flex">
                    <span className="text-[9px] font-bold text-emerald-400 tracking-wider">JUGGLES</span>
                    <span className="text-sm font-black text-emerald-300 font-mono">
                      x{engineRef.current.nainsJuggled}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Quick Action Arcade Buttons */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {gameState === 'playing' && (
              <button 
                onClick={() => { setGameState('paused'); stopMusic(); }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-mono font-bold text-xs border border-slate-700 transition flex items-center gap-1 shadow"
                title="Pause Game (P / Esc)"
              >
                ⏸ <span className="hidden sm:inline">PAUSE</span>
              </button>
            )}
            <button onClick={() => setShowOptions(true)} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={() => setShowHowToPlay(true)} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white" title="How to Play">
              <HelpCircle className="w-5 h-5" />
            </button>
            {gameState !== 'menu' && (
              <button onClick={() => setShowQuit(true)} className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-xl font-bold text-xs transition border border-rose-500/30">
                QUIT
              </button>
            )}
          </div>
        </header>

        {/* Active Powerup Timers */}
        {gameState === 'playing' && activePowerUps.length > 0 && (
          <div className="w-full flex justify-center -mb-2">
            <PowerUpTimers activePowerUps={activePowerUps} />
          </div>
        )}

        {/* Game Canvas Area with Arcade Border Styling */}
        <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl shadow-emerald-900/20 flex flex-col items-center justify-center group">
          {gameState === 'menu' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border-2 border-amber-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center max-w-md w-full relative overflow-hidden">
                {/* Decorative retro light accent */}
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                
                {/* Authentic Golden 3D Title */}
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 italic font-mono tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] mb-1">
                  JARDINAINS!
                </h2>
                
                {/* with love for yesra */}
                <div className="text-rose-400 text-sm font-bold mb-2 flex items-center justify-center gap-1.5 tracking-wide">
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                  <span>with love for yesra</span>
                </div>

                <p className="text-xs text-amber-200/70 font-mono tracking-wide mb-6">
                  Classic 1,000-Level Brick Breaker & Nain Arcade
                </p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => startGame(Math.max(0, unlockedLevel - 1))}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-base rounded-xl shadow-[0_4px_14px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 border-t border-emerald-400/30 active:translate-y-0.5"
                  >
                    <Play className="w-5 h-5 fill-current" /> 
                    {unlockedLevel > 1 ? `CONTINUE (LVL ${unlockedLevel})` : 'START GAME'}
                  </button>
                  
                  <button 
                    onClick={() => setShowLevelSelect(true)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 shadow active:translate-y-0.5"
                  >
                    <Grid className="w-4 h-4 text-cyan-400" /> LEVEL SELECT (1,000 LVLS)
                  </button>
                  
                  <button 
                    onClick={() => setShowScores(true)}
                    className="w-full py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold rounded-xl border border-amber-500/30 transition flex items-center justify-center gap-2 shadow active:translate-y-0.5"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" /> HIGH SCORES
                  </button>

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={() => setShowHowToPlay(true)}
                      className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" /> HOW TO PLAY
                    </button>
                    <button 
                      onClick={() => setShowOptions(true)}
                      className="flex-1 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <Settings className="w-4 h-4 text-slate-400" /> OPTIONS
                    </button>
                  </div>
                </div>

                {/* Controls legend */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono flex items-center justify-around">
                  <span>🖱️ Move: Mouse / Touch</span>
                  <span>🚀 Launch: Click / Space</span>
                  <span>⏸️ Pause: P / Esc</span>
                </div>
              </div>
            </div>
          )}

          {gameState === 'paused' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 text-center">
                <h2 className="text-3xl font-black text-white mb-6">PAUSED</h2>
                <button onClick={() => { setGameState('playing'); engineRef.current.lastTime = performance.now(); if (options.musicEnabled) startMusic(); }} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-500 transition">RESUME</button>
              </div>
            </div>
          )}

          {gameState === 'levelclear' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="bg-slate-900 p-8 rounded-3xl border border-emerald-500/50 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <h2 className="text-3xl font-black text-emerald-400 mb-2">LEVEL {currentLevelIdx + 1} CLEARED!</h2>
                <p className="text-slate-400 mb-6 font-mono font-bold">SCORE: {score.toLocaleString()}</p>
                <button onClick={() => startGame(currentLevelIdx + 1)} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-500 transition">NEXT LEVEL</button>
              </div>
            </div>
          )}

          {gameState === 'gamewin' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 backdrop-blur-md">
              <div className="bg-slate-900 p-8 rounded-3xl border border-amber-500/60 text-center shadow-[0_0_60px_rgba(251,191,36,0.3)] max-w-md mx-4">
                <div className="text-5xl mb-3">👑</div>
                <h2 className="text-3xl font-black text-amber-400 mb-2">VICTORY!</h2>
                <p className="text-rose-400 text-sm font-bold mb-4 flex items-center justify-center gap-1.5">
                  <Heart className="w-4 h-4 fill-current" /> Completed with Love for Yesra
                </p>
                <p className="text-slate-300 mb-6 font-mono">
                  All 1,000 Levels Conquered!<br />
                  Final Score: <span className="text-amber-400 font-bold">{score.toLocaleString()}</span>
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setGameState('menu'); setShowScores(true); }} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition">MENU</button>
                  <button onClick={() => startGame(0)} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-500 transition">PLAY AGAIN</button>
                </div>
              </div>
            </div>
          )}

          {gameState === 'gameover' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md">
              <div className="bg-slate-900 p-8 rounded-3xl border border-rose-500/50 text-center shadow-[0_0_50px_rgba(244,63,94,0.2)]">
                <h2 className="text-4xl font-black text-rose-500 mb-2">GAME OVER</h2>
                <p className="text-slate-300 mb-6 font-mono">Final Score: <span className="text-amber-400 font-bold">{score.toLocaleString()}</span></p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setGameState('menu'); setShowScores(true); }} className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition">MENU</button>
                  <button onClick={() => startGame(currentLevelIdx)} className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg hover:bg-rose-500 transition">RETRY LEVEL</button>
                </div>
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchStart}
            className="w-full h-full object-contain cursor-none touch-none"
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-500 flex items-center justify-between px-2">
          <button onClick={() => setShowAbout(true)} className="hover:text-slate-300 transition flex items-center gap-1">
            <Info className="w-4 h-4" /> About Jardinains Remake
          </button>
          <span className="font-mono">v2.0 HTML5</span>
        </footer>
      </div>

      {/* Modals */}
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <HowToPlayModal isOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
      <OptionsModal 
        isOpen={showOptions} 
        onClose={() => setShowOptions(false)} 
        options={options}
        onOptionsChange={saveOptions}
        isFullscreen={!!document.fullscreenElement}
        onToggleFullscreen={toggleFullscreen}
      />
      <QuitModal isOpen={showQuit} onClose={() => setShowQuit(false)} onConfirmQuit={() => { stopMusic(); setGameState('menu'); setShowQuit(false); }} />
      <LevelSelectModal 
        isOpen={showLevelSelect} 
        onClose={() => setShowLevelSelect(false)}
        levels={LEVELS}
        unlockedLevel={unlockedLevel}
        currentLevelIdx={currentLevelIdx}
        isPlaying={gameState !== 'menu'}
        onSelectLevel={(idx) => { setShowLevelSelect(false); startGame(idx); }}
      />
      <HighScoresModal 
        isOpen={showScores} 
        onClose={() => setShowScores(false)}
        scores={highScores}
        onReset={() => { localStorage.removeItem('jardinains_scores'); setHighScores([]); }}
        pendingScore={gameState === 'gameover' ? { score, level: currentLevelIdx + 1, nainsJuggled: engineRef.current?.nainsJuggled || 0 } : null}
        onSaveScore={(name, s, lvl, nj) => {
          const newScores = [...highScores, { id: Date.now().toString(), name, score: s, level: lvl, nainsJuggled: nj, date: new Date().toLocaleDateString() }]
            .sort((a, b) => b.score - a.score).slice(0, 10);
          setHighScores(newScores);
          localStorage.setItem('jardinains_scores', JSON.stringify(newScores));
        }}
      />
    </div>
  );
}
