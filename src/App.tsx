import React, { useEffect, useRef, useState } from 'react';
import { HighScoreEntry, GameOptions } from './types';
import { GameState, Ball, Brick, Nain, PowerUp, Projectile, Particle, FloatingText, PowerUpType, ActivePowerUp } from './game/types';
import { LEVELS, TOTAL_LEVELS, getLevelName } from './game/levels';
import { playSound, startMusic, stopMusic, setSoundMuted, setMusicEnabled, setSoundVolume, setMusicVolume } from './game/audio';
import { updateJardinains, drawJardinain, drawProjectile, createParachutingNain, NAIN_WIDTH, NAIN_HEIGHT } from './game/nain';
import { applyPowerUpPickup, tickActivePowerUps, drawPowerUp, getBallSpeedMultiplier, POWERUP_CONFIGS, createPowerUp } from './game/powerups';
import { drawArcadeBorder, drawClassicBeveledBrick, drawClassicPaddle, drawClassicBall, drawClassicShield, drawGlassTitlePlaque, drawActivePowerUpBadges } from './game/retroUi';

// Modals
import AboutModal from './components/AboutModal';
import HighScoresModal from './components/HighScoresModal';
import HowToPlayModal from './components/HowToPlayModal';
import LevelSelectModal from './components/LevelSelectModal';
import OptionsModal from './components/OptionsModal';
import QuitModal from './components/QuitModal';
import JardinainsLogo from './components/JardinainsLogo';

import { Play, Pause, Settings, Trophy, HelpCircle, Info, Grid, Heart, Volume2, VolumeX, RotateCcw, Maximize2, Minimize2, Sparkles, X } from 'lucide-react';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_DEFAULT_WIDTH = 90;
const PADDLE_HEIGHT = 16;
const PADDLE_Y = CANVAS_HEIGHT - 40;
const BALL_DEFAULT_SPEED = 2.4; // Relaxed, comfortably slow arcade ball speed

const getBallBaseSpeed = (speedOpt?: 'slow' | 'normal' | 'fast') => {
  if (speedOpt === 'normal') return 3.2;
  if (speedOpt === 'fast') return 4.0;
  return BALL_DEFAULT_SPEED;
};

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>('menu');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>([]);
  const [playerName, setPlayerName] = useState('PLAYER 1');
  const [playerProgress, setPlayerProgress] = useState<Record<string, number>>({});
  
  const [options, setOptions] = useState<GameOptions>({
    soundEnabled: true,
    soundVolume: 0.65,
    musicEnabled: true,
    musicVolume: 0.25,
    ballSpeed: 'slow',
  });

  // Modal states
  const [showAbout, setShowAbout] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dismissFullscreenTip, setDismissFullscreenTip] = useState(false);

  // Fullscreen detection listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
      
      const savedName = localStorage.getItem('jardinains_player_name') || 'PLAYER 1';
      setPlayerName(savedName);
      
      const savedProgress = localStorage.getItem('jardinains_player_progress');
      let progress: Record<string, number> = {};
      if (savedProgress) {
        progress = JSON.parse(savedProgress);
      } else {
        const legacyLevel = localStorage.getItem('jardinains_unlocked');
        if (legacyLevel) {
          progress[savedName] = parseInt(legacyLevel, 10);
        }
      }
      setPlayerProgress(progress);
      setUnlockedLevel(progress[savedName] || 1);

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

    if (newOpts.ballSpeed !== undefined) {
      const targetSpeed = getBallBaseSpeed(newOpts.ballSpeed);
      const engine = engineRef.current;
      engine.balls.forEach(b => {
        const curSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        b.speed = targetSpeed;
        if (curSpeed > 0 && !b.attachedToPaddle) {
          b.vx = (b.vx / curSpeed) * targetSpeed;
          b.vy = (b.vy / curSpeed) * targetSpeed;
        }
      });
    }

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
        setPlayerProgress(prev => {
          const newProgress = { ...prev, [playerName || 'PLAYER 1']: nextLvl };
          localStorage.setItem('jardinains_player_progress', JSON.stringify(newProgress));
          return newProgress;
        });
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
        // Launch attached balls with natural upward trajectory
        engineRef.current.balls.forEach(b => {
          if (b.attachedToPaddle) {
            b.attachedToPaddle = false;
            const launchAngle = (Math.random() - 0.5) * 0.35; // gentle upward spread ~10 deg
            b.vx = Math.sin(launchAngle) * b.speed;
            b.vy = -Math.cos(launchAngle) * b.speed;
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
        const launchAngle = (Math.random() - 0.5) * 0.35; // gentle upward spread ~10 deg
        b.vx = Math.sin(launchAngle) * b.speed;
        b.vy = -Math.cos(launchAngle) * b.speed;
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

  const startGame = (levelIdx: number, preserveBallPower = false) => {
    const config = LEVELS[levelIdx];
    const engine = engineRef.current;

    // Retain ball power when advancing to next level
    const prevBallPower = preserveBallPower && engine.balls.length > 0 ? engine.balls[0].ballPower : null;
    const prevIsFireball = preserveBallPower && engine.balls.some(b => b.isFireball);
    
    // Reset Engine State
    engine.paddleWidth = PADDLE_DEFAULT_WIDTH;
    engine.paddleDefaultWidth = PADDLE_DEFAULT_WIDTH;
    engine.paddleX = CANVAS_WIDTH / 2 - engine.paddleWidth / 2;
    engine.activeTimers.clear();
    engine.shieldActive = false;
    engine.stickyBall = false;
    engine.laserActiveTime = 0;
    engine.nainsJuggled = 0;

    if (prevIsFireball) {
      engine.activeTimers.set('fireball', { totalDuration: 0, remainingTime: 0 });
    } else if (prevBallPower === 'slow_ball') {
      engine.activeTimers.set('slow_ball', { totalDuration: 0, remainingTime: 0 });
    } else if (prevBallPower === 'fast_ball') {
      engine.activeTimers.set('fast_ball', { totalDuration: 0, remainingTime: 0 });
    }
    
    engine.balls = [{
      id: 'b1',
      x: engine.paddleX + engine.paddleWidth / 2,
      y: PADDLE_Y - 8,
      vx: 0,
      vy: 0,
      speed: getBallBaseSpeed(options.ballSpeed),
      radius: 6,
      attachedToPaddle: true,
      isFireball: prevIsFireball,
      ballPower: prevBallPower,
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
            isGlassBrick: cell === 8,
            color: [
              '#ef4444',
              '#10b981',
              '#3b82f6',
              '#94a3b8',
              '#f59e0b',
              '#d946ef',
              '#eab308',
              'rgba(186, 230, 253, 0.85)',
            ][cell - 1] || '#38bdf8',
          });
        }
      });
    });

    // Parse Nains
    engine.nains = config.nainSpawns.map((ns, idx) => {
      const nain = createParachutingNain(ns.x, ns.y, ns.hatType);
      nain.relocationTimer = 60000 + idx * 2500;
      return nain;
    });

    setCurrentLevelIdx(levelIdx);
    setGameState('playing');
    playSound('start');
    if (options.musicEnabled) startMusic();
  };

  const update = (dt: number) => {
    const engine = engineRef.current;
    
    // Normalize frame delta relative to standard 60fps (16.667ms)
    // Clamping protects against tab switching while normalizing 120Hz/144Hz monitors
    const dtClamped = Math.min(Math.max(dt || 16.667, 4), 33.333);
    const timeScale = dtClamped / 16.667;

    // Paddle movement via keys
    if (engine.keys['ArrowLeft'] || engine.keys['KeyA']) engine.paddleX -= 8 * timeScale;
    if (engine.keys['ArrowRight'] || engine.keys['KeyD']) engine.paddleX += 8 * timeScale;
    engine.paddleX = Math.max(12, Math.min(CANVAS_WIDTH - 12 - engine.paddleWidth, engine.paddleX));

    // Powerups tick
    tickActivePowerUps(engine.activeTimers, dtClamped, engine);

    // Laser firing
    if (engine.laserActiveTime > 0) {
      engine.laserActiveTime -= dtClamped;
      if (Math.random() < 0.05 * timeScale) { // Fire rate
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

    // Balls
    for (let i = engine.balls.length - 1; i >= 0; i--) {
      const b = engine.balls[i];
      if (b.attachedToPaddle) {
        b.x = engine.paddleX + engine.paddleWidth / 2;
        b.y = PADDLE_Y - b.radius;
        continue;
      }

      // Ball speed multiplier is strictly controlled by active powerups
      const bSpeedMult = getBallSpeedMultiplier(engine.activeTimers, [b]);
      b.x += b.vx * bSpeedMult * timeScale;
      b.y += b.vy * bSpeedMult * timeScale;

      // Ensure ball maintains strictly uniform velocity magnitude without automatic acceleration
      const curSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
      if (curSpeed > 0.001) {
        b.vx = (b.vx / curSpeed) * b.speed;
        b.vy = (b.vy / curSpeed) * b.speed;
      }

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
                engine.activeTimers.delete('fireball');
                engine.activeTimers.delete('slow_ball');
                engine.activeTimers.delete('fast_ball');
                engine.balls.push({
                  id: 'b_new',
                  x: engine.paddleX + engine.paddleWidth / 2,
                  y: PADDLE_Y - 8,
                  vx: 0,
                  vy: 0,
                  speed: getBallBaseSpeed(options.ballSpeed),
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
          const hitPos = (b.x - (engine.paddleX + engine.paddleWidth / 2)) / (engine.paddleWidth / 2);
          const clampedHitPos = Math.max(-0.90, Math.min(0.90, hitPos));
          const bounceAngle = clampedHitPos * (Math.PI / 3); // -60 to +60 degrees from vertical
          b.vx = Math.sin(bounceAngle) * b.speed;
          b.vy = -Math.cos(bounceAngle) * b.speed;
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
            if (Math.abs(dx) > Math.abs(dy)) {
              b.vx = -b.vx;
            } else {
              b.vy = -b.vy;
            }
            // Ensure ball never gets trapped in purely horizontal bouncing
            if (Math.abs(b.vy) < b.speed * 0.22) {
              b.vy = b.vy < 0 ? -b.speed * 0.22 : b.speed * 0.22;
              const curSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
              if (curSpeed > 0) {
                b.vx = (b.vx / curSpeed) * b.speed;
                b.vy = (b.vy / curSpeed) * b.speed;
              }
            }
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
              if (brick.isGlassBrick || brick.type === 8) pts = 120;
              setScore(s => s + pts);

              if (brick.isGlassBrick || brick.type === 8) {
                playSound('glass_shatter');
                engine.floatingTexts.push({
                  id: `ft_${Date.now()}_${Math.random()}`,
                  text: '+120 GLASS',
                  x: brick.x + brick.w / 2,
                  y: brick.y,
                  color: '#7dd3fc',
                  alpha: 1,
                  vy: -1.2,
                });
                for (let p = 0; p < 12; p++) {
                  engine.particles.push({
                    x: brick.x + brick.w / 2 + (Math.random() - 0.5) * brick.w * 0.8,
                    y: brick.y + brick.h / 2 + (Math.random() - 0.5) * brick.h * 0.8,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    radius: Math.random() * 2.5 + 1,
                    color: ['#ffffff', '#bae6fd', '#7dd3fc', '#e0f2fe', '#38bdf8'][Math.floor(Math.random() * 5)],
                    alpha: 1,
                    decay: 0.035
                  });
                }
              } else {
                playSound(brick.type === 7 ? 'bonus_brick' : 'brick_break');
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
              }

              if (brick.type === 6) {
                engine.powerups.push(createPowerUp(brick.x + brick.w/2, brick.y + brick.h));
              }

              // Check level clear
              if (engine.bricks.filter(b => !b.unbreakable).length === 0) {
                handleLevelComplete();
              }
            } else {
              playSound((brick.isGlassBrick || brick.type === 8) ? 'glass_shatter' : 'brick_hit');
            }
          }
          break; // One collision per frame
        }
      }
    }

    // Powerups falling
    for (let i = engine.powerups.length - 1; i >= 0; i--) {
      const p = engine.powerups[i];
      p.y += p.vy * timeScale;
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
      (s, opts) => playSound(s, opts),
      dtClamped
    );

    // Projectiles
    for (let i = engine.projectiles.length - 1; i >= 0; i--) {
      const pr = engine.projectiles[i];
      pr.x += pr.vx * timeScale;
      pr.y += pr.vy * timeScale;
      if (pr.rotation !== undefined && pr.vRot) pr.rotation += pr.vRot * timeScale;

      if (pr.type === 'player_laser') {
        let hit = false;

        // Hit Jardinains first!
        for (let nIdx = engine.nains.length - 1; nIdx >= 0; nIdx--) {
          const nain = engine.nains[nIdx];
          if (
            nain.state !== 'splat' &&
            nain.state !== 'poof' &&
            pr.x >= nain.x - 4 &&
            pr.x <= nain.x + nain.w + 4 &&
            pr.y >= nain.y - 4 &&
            pr.y <= nain.y + nain.h + 4
          ) {
            engine.projectiles.splice(i, 1);
            hit = true;

            // Knock nain into the air!
            nain.isParachuting = false;
            nain.standingOnBrickId = null;
            nain.state = 'falling';
            nain.vy = -6.2;
            nain.vx = (Math.random() - 0.5) * 4;
            nain.bounceCount = (nain.bounceCount || 0) + 1;

            const hitScore = nain.hatType === 'gold' ? 2000 : nain.hatType === 'green' ? 1000 : 600;
            setScore(s => s + hitScore);
            playSound('nain_hit', { pitchMult: 1.25 });
            playSound('bonus_brick');

            // Drop guaranteed bonus reward!
            engine.powerups.push(createPowerUp(nain.x + nain.w / 2, nain.y));

            engine.floatingTexts.push({
              text: `🎯 +${hitScore}`,
              x: nain.x + nain.w / 2,
              y: nain.y - 18,
              color: '#38bdf8',
              alpha: 1,
              vy: -1.8,
            });

            for (let p = 0; p < 14; p++) {
              engine.particles.push({
                x: nain.x + nain.w / 2,
                y: nain.y + nain.h / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                radius: Math.random() * 3.5 + 2,
                color: '#38bdf8',
                alpha: 1,
                decay: 0.04,
                shape: 'star',
              });
            }
            break;
          }
        }

        // Hit bricks?
        if (!hit) {
          for (let j = engine.bricks.length - 1; j >= 0; j--) {
            const br = engine.bricks[j];
            if (pr.x >= br.x && pr.x <= br.x + br.w && pr.y >= br.y && pr.y <= br.y + br.h) {
              engine.projectiles.splice(i, 1);
              hit = true;
              if (!br.unbreakable) {
                br.hp -= 1;
                if (br.hp <= 0) {
                  engine.bricks.splice(j, 1);
                  if (br.isGlassBrick || br.type === 8) {
                    playSound('glass_shatter');
                    setScore(s => s + 120);
                    for (let p = 0; p < 10; p++) {
                      engine.particles.push({
                        x: br.x + br.w / 2,
                        y: br.y + br.h / 2,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        radius: Math.random() * 2.5 + 1,
                        color: '#bae6fd',
                        alpha: 1,
                        decay: 0.04
                      });
                    }
                  } else {
                    playSound('brick_break');
                    setScore(s => s + 50);
                  }
                  if (engine.bricks.filter(b => !b.unbreakable).length === 0) handleLevelComplete();
                }
              } else { playSound('unbreakable_hit'); }
              break;
            }
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
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      p.alpha -= p.decay * timeScale;
      if (p.alpha <= 0) engine.particles.splice(i, 1);
    }

    // Floating texts
    for (let i = engine.floatingTexts.length - 1; i >= 0; i--) {
      const ft = engine.floatingTexts[i];
      ft.y += ft.vy * timeScale;
      ft.alpha -= 0.02 * timeScale;
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

    // 12. Translucent Glass Title Plaque (Current Level & Name)
    const levelTitle = LEVELS[currentLevelIdx]?.name ? `LEVEL ${currentLevelIdx + 1}: ${LEVELS[currentLevelIdx].name}` : `LEVEL ${currentLevelIdx + 1}`;
    drawGlassTitlePlaque(ctx, levelTitle.toUpperCase(), CANVAS_WIDTH / 2, 14);

    // 13. Active PowerUp Status Badges in top right
    drawActivePowerUpBadges(ctx, engine.activeTimers, engine.balls, CANVAS_WIDTH - 18, 15);
  };

  const userHighScore = highScores.length > 0 ? Math.max(...highScores.map(h => h.score), score) : Math.max(score, 125);
  const userHighestLevel = Math.max(unlockedLevel, currentLevelIdx + 1);
  const topScore = Math.max(userHighScore, 20615);
  const topLevel = Math.max(userHighestLevel, 3);

  return (
    <div className={isFullscreen ? "w-screen h-screen bg-black flex flex-col items-center justify-center p-0 font-sans text-slate-100 overflow-hidden relative select-none" : "min-h-screen bg-slate-950 flex flex-col items-center justify-center p-1 sm:p-3 md:p-4 font-sans text-slate-100 overflow-x-hidden relative select-none"}>
      {/* Retro background ambient vignette */}
      {!isFullscreen && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-black pointer-events-none" />
      )}

      {/* Main Jardinains Game Arcade Cabinet Window */}
      <div className={isFullscreen ? "relative z-10 w-full h-full flex flex-col items-center justify-center" : "relative z-10 w-full max-w-5xl flex flex-col items-center my-auto"}>
        
        {/* MOBILE & TABLET TOP HUD (Visible on screens < lg when NOT in fullscreen) */}
        {!isFullscreen && (
          <div className="w-full lg:hidden bg-[#031c09] border-2 border-[#0b3b17] rounded-xl p-2 sm:p-2.5 mb-2 shadow-lg font-['Sniglet'] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 
                  onClick={() => setGameState('menu')}
                  className="text-xl sm:text-2xl font-black text-[#4ade80] drop-shadow-[0_1px_0_#000] cursor-pointer"
                >
                  Jardinains!
                </h1>
                <span className="text-[10px] sm:text-xs text-rose-300 font-bold flex items-center gap-0.5">
                  <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500 animate-pulse" /> yesra
                </span>
              </div>

              {/* Quick Action Icons */}
              <div className="flex items-center gap-1.5">
                {gameState === 'playing' ? (
                  <button 
                    onClick={() => { setGameState('paused'); stopMusic(); }}
                    className="p-1.5 bg-[#063311] hover:bg-[#094718] text-white text-xs font-bold rounded-lg border border-[#166534] transition flex items-center justify-center"
                    title="Pause Game"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : gameState === 'paused' ? (
                  <button 
                    onClick={() => { setGameState('playing'); engineRef.current.lastTime = performance.now(); if (options.musicEnabled) startMusic(); }}
                    className="p-1.5 bg-[#22c55e] hover:bg-[#4ade80] text-black text-xs font-bold rounded-lg transition flex items-center justify-center"
                    title="Resume Game"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                ) : null}

                <button 
                  onClick={toggleFullscreen}
                  className="p-1.5 bg-[#063311] hover:bg-[#094718] text-emerald-200 text-xs font-bold rounded-lg border border-[#166534] transition flex items-center justify-center"
                  title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-300" /> : <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />}
                </button>

                <button 
                  onClick={() => {
                    const newSound = !options.soundEnabled;
                    saveOptions({ ...options, soundEnabled: newSound });
                  }}
                  className="p-1.5 bg-[#063311] hover:bg-[#094718] text-white text-xs font-bold rounded-lg border border-[#166534] transition flex items-center justify-center"
                  title="Toggle Sound"
                >
                  {options.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#4ade80]" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
                </button>

                <button 
                  onClick={() => setShowLevelSelect(true)}
                  className="p-1.5 bg-[#063311] hover:bg-[#094718] text-emerald-200 text-xs font-bold rounded-lg border border-[#166534] transition flex items-center justify-center"
                  title="Select Level"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>

                <button 
                  onClick={() => setShowOptions(true)}
                  className="p-1.5 bg-[#063311] hover:bg-[#094718] text-emerald-200 text-xs font-bold rounded-lg border border-[#166534] transition flex items-center justify-center"
                  title="Options"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Mobile Stats Bar */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-1 border-t border-[#0e441c] text-center">
              <div className="bg-[#04280e] px-2 py-1 rounded-lg border border-[#0d4a1f]">
                <div className="text-[10px] text-slate-300 font-bold">SCORE</div>
                <div className="text-sm sm:text-base font-black text-[#86efac]">{score.toLocaleString()}</div>
              </div>
              <div className="bg-[#04280e] px-2 py-1 rounded-lg border border-[#0d4a1f]">
                <div className="text-[10px] text-slate-300 font-bold">LEVEL</div>
                <div className="text-sm sm:text-base font-black text-[#86efac]">{currentLevelIdx + 1}</div>
              </div>
              <div className="bg-[#04280e] px-2 py-1 rounded-lg border border-[#0d4a1f]">
                <div className="text-[10px] text-slate-300 font-bold">LIVES</div>
                <div className="text-sm sm:text-base font-black text-[#86efac] flex items-center justify-center gap-1">
                  <span>{lives}</span>
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500 inline" />
                </div>
              </div>
              {(engineRef.current?.nainsJuggled || 0) > 0 ? (
                <div className="bg-[#451a03] px-2 py-1 rounded-lg border border-amber-500/40 animate-pulse">
                  <div className="text-[10px] text-amber-300 font-bold">JUGGLES</div>
                  <div className="text-sm sm:text-base font-black text-amber-400">x{engineRef.current?.nainsJuggled}</div>
                </div>
              ) : (
                <div className="hidden sm:block bg-[#04280e] px-2 py-1 rounded-lg border border-[#0d4a1f]">
                  <div className="text-[10px] text-slate-300 font-bold">HIGH SCORE</div>
                  <div className="text-sm sm:text-base font-black text-amber-300">{topScore.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Authentic Jardinains Cabinet Layout */}
        <div className={isFullscreen ? "w-full h-full bg-black p-0 border-0 shadow-none flex flex-col items-center justify-center relative" : "w-full bg-[#031c09] p-1.5 sm:p-2.5 md:p-3 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-[#0b3b17] shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col lg:flex-row gap-2 sm:gap-3 items-stretch relative"}>
          
          {/* Authentic Black Gameplay Canvas Frame */}
          <div className={isFullscreen ? "relative flex-1 bg-black w-full h-full max-h-screen aspect-[4/3] flex items-center justify-center touch-none overflow-hidden" : "relative flex-1 bg-black rounded-lg sm:rounded-xl border border-slate-700/80 sm:border-2 sm:border-slate-200/90 shadow-2xl overflow-hidden aspect-[4/3] w-full max-h-[65vh] sm:max-h-[72vh] lg:max-h-none flex items-center justify-center touch-none"}>
            
            {/* Main Menu Overlay */}
            {gameState === 'menu' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
                <div className="flex flex-col items-center max-w-md w-full my-auto">
                  {/* Authentic Jardinains Logo Banner from original game */}
                  <JardinainsLogo size="md" showBrickFrame={true} showDedication={true} />

                  <p className="text-[11px] sm:text-xs text-emerald-300/80 font-['Sniglet'] tracking-wide mt-1.5 mb-3 sm:mb-4 text-center">
                    Classic 1,000-Level Brick Breaker & Nain-Bouncing Arcade
                  </p>

                  <div className="w-full max-w-xs space-y-2 sm:space-y-2.5 font-['Sniglet']">
                    {/* Full Screen Suggestion Tip for Better Gameplay */}
                    {!isFullscreen && !dismissFullscreenTip && (
                      <div className="p-2 sm:p-2.5 bg-gradient-to-r from-emerald-950/90 via-[#063311] to-emerald-950/90 border border-emerald-500/50 rounded-xl flex items-center justify-between text-xs text-emerald-200 shadow-md animate-fade-in">
                        <div className="flex items-center gap-1.5 min-w-0 pr-1">
                          <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                          <span className="text-[11px] sm:text-xs leading-tight font-medium">
                            Tip: Play in <b>Full Screen</b> for the best arcade experience!
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={toggleFullscreen}
                            className="px-2 py-1 bg-[#22c55e] hover:bg-[#4ade80] text-black font-extrabold text-[11px] rounded-lg transition cursor-pointer flex items-center gap-1 shadow"
                          >
                            <Maximize2 className="w-3 h-3" /> Go Full
                          </button>
                          <button
                            onClick={() => setDismissFullscreenTip(true)}
                            className="p-1 text-slate-400 hover:text-white transition cursor-pointer rounded"
                            title="Dismiss Tip"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5 w-full bg-[#04280e] p-2 rounded-xl border border-[#0d4a1f] shadow-inner mb-2">
                      <label className="text-[10px] sm:text-xs text-[#22c55e] font-bold uppercase tracking-wide px-1">Player Name:</label>
                      <input 
                        type="text" 
                        maxLength={16}
                        value={playerName}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setPlayerName(val);
                          localStorage.setItem('jardinains_player_name', val);
                          const lvl = playerProgress[val] || 1;
                          setUnlockedLevel(lvl);
                        }}
                        placeholder="ENTER NAME"
                        className="w-full bg-black/60 border border-[#166534] rounded-lg px-2.5 py-2 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>

                    <button 
                      onClick={() => startGame(Math.max(0, unlockedLevel - 1))}
                      className="w-full py-2.5 sm:py-3 bg-gradient-to-b from-[#4ade80] to-[#16a34a] hover:from-[#86efac] hover:to-[#22c55e] text-black font-extrabold text-base sm:text-lg rounded-xl shadow-[0_4px_12px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2 border-2 border-[#14532d] active:translate-y-0.5 tracking-wider cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current" /> 
                      {unlockedLevel > 1 ? `CONTINUE (LVL ${unlockedLevel})` : 'START GAME'}
                    </button>
                    
                    <button 
                      onClick={() => setShowLevelSelect(true)}
                      className="w-full py-2 bg-[#063311] hover:bg-[#094718] text-[#86efac] font-bold rounded-xl border-2 border-[#166534] transition flex items-center justify-center gap-2 shadow active:translate-y-0.5 cursor-pointer text-sm sm:text-base"
                    >
                      <Grid className="w-4 h-4 text-[#4ade80]" /> LEVEL SELECT (1,000 LVLS)
                    </button>
                    
                    <button 
                      onClick={() => setShowScores(true)}
                      className="w-full py-2 bg-[#063311] hover:bg-[#094718] text-amber-300 font-bold rounded-xl border-2 border-[#854d0e]/60 transition flex items-center justify-center gap-2 shadow active:translate-y-0.5 cursor-pointer text-sm sm:text-base"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" /> HIGH SCORES
                    </button>

                    <div className="flex gap-2 pt-0.5">
                      <button 
                        onClick={() => setShowHowToPlay(true)}
                        className="flex-1 py-1.5 bg-[#063311] hover:bg-[#094718] text-emerald-200 text-xs font-bold rounded-lg border border-[#166534] transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> HOW TO PLAY
                      </button>
                      <button 
                        onClick={() => setShowOptions(true)}
                        className="flex-1 py-1.5 bg-[#063311] hover:bg-[#094718] text-emerald-200 text-xs font-bold rounded-lg border border-[#166534] transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" /> OPTIONS
                      </button>
                    </div>
                  </div>

                  {/* Controls legend */}
                  <div className="mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-[#14532d] text-[10px] sm:text-[11px] text-emerald-300/70 font-mono flex items-center justify-around w-full flex-wrap gap-y-1">
                    <span>🖱️ Drag: Mouse/Touch</span>
                    <span>🚀 Launch: Click/Space</span>
                    <span>⏸️ Pause: P/Esc</span>
                    <span>🖥️ Fullscreen: F</span>
                  </div>
                </div>
              </div>
            )}

            {/* Paused Overlay */}
            {gameState === 'paused' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <div className="bg-[#04260d] p-6 sm:p-8 rounded-3xl border-2 border-[#22c55e]/60 text-center font-['Sniglet'] shadow-2xl max-w-xs w-full">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">PAUSED</h2>
                  <p className="text-xs sm:text-sm text-rose-300 font-bold mb-4 sm:mb-5 flex items-center justify-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> with love for yesra
                  </p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => { setGameState('playing'); engineRef.current.lastTime = performance.now(); if (options.musicEnabled) startMusic(); }} 
                      className="w-full py-2.5 bg-[#22c55e] text-black font-extrabold text-base sm:text-lg rounded-xl shadow hover:bg-[#4ade80] transition cursor-pointer"
                    >
                      RESUME
                    </button>
                    <button 
                      onClick={() => { stopMusic(); setGameState('menu'); }} 
                      className="w-full py-2 bg-[#063311] text-emerald-200 font-bold rounded-xl border border-[#166534] hover:bg-[#094718] transition cursor-pointer"
                    >
                      MAIN MENU
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Level Cleared Overlay */}
            {gameState === 'levelclear' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
                <div className="bg-[#04260d]/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border-2 border-[#22c55e] text-center font-['Sniglet'] shadow-[0_0_50px_rgba(34,197,94,0.3)] max-w-sm w-full">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-emerald-200 mb-2 font-mono">
                    STAGE CONQUERED
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4ade80] mb-1">LEVEL {currentLevelIdx + 1} CLEARED!</h2>
                  <p className="text-xs text-rose-300 font-bold mb-3 sm:mb-4 flex items-center justify-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> with love for yesra
                  </p>
                  <p className="text-white text-base sm:text-lg font-bold mb-4 sm:mb-6">SCORE: <span className="text-[#86efac]">{score.toLocaleString()}</span></p>
                  <button 
                    onClick={() => startGame(currentLevelIdx + 1, true)} 
                    className="w-full py-2.5 sm:py-3 bg-[#22c55e] hover:bg-[#4ade80] text-black font-extrabold text-base sm:text-lg rounded-xl shadow-lg transition cursor-pointer"
                  >
                    NEXT LEVEL
                  </button>
                </div>
              </div>
            )}

            {/* Victory Overlay */}
            {gameState === 'gamewin' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
                <div className="bg-[#04260d] p-6 sm:p-8 rounded-3xl border-2 border-amber-400 text-center font-['Sniglet'] shadow-[0_0_60px_rgba(251,191,36,0.3)] max-w-md mx-4">
                  <div className="text-4xl sm:text-5xl mb-2">👑</div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-400 mb-1">VICTORY!</h2>
                  <p className="text-rose-300 text-xs sm:text-sm font-bold mb-3 sm:mb-4 flex items-center justify-center gap-1.5">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" /> Completed with love for yesra
                  </p>
                  <p className="text-slate-200 mb-4 sm:mb-6 font-mono text-xs sm:text-sm">
                    All 1,000 Levels Conquered!<br />
                    Final Score: <span className="text-amber-300 font-bold text-base sm:text-lg">{score.toLocaleString()}</span>
                  </p>
                  <div className="flex gap-2 sm:gap-3 justify-center">
                    <button onClick={() => { setGameState('menu'); setShowScores(true); }} className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#063311] text-white font-bold rounded-xl border border-[#166534] hover:bg-[#094718] transition text-sm sm:text-base">MENU</button>
                    <button onClick={() => startGame(0)} className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#22c55e] text-black font-extrabold rounded-xl shadow-lg hover:bg-[#4ade80] transition text-sm sm:text-base">PLAY AGAIN</button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <div className="bg-[#04260d] p-6 sm:p-8 rounded-3xl border-2 border-rose-500/60 text-center font-['Sniglet'] shadow-[0_0_50px_rgba(244,63,94,0.3)] max-w-sm w-full">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-rose-500 mb-1">GAME OVER</h2>
                  <p className="text-xs text-rose-300 font-bold mb-3 sm:mb-4 flex items-center justify-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> with love for yesra
                  </p>
                  <p className="text-slate-200 mb-4 sm:mb-6 text-sm sm:text-base">Final Score: <span className="text-[#86efac] font-bold text-lg sm:text-xl">{score.toLocaleString()}</span></p>
                  <div className="flex gap-2 sm:gap-3 justify-center">
                    <button onClick={() => { setGameState('menu'); setShowScores(true); }} className="flex-1 py-2 sm:py-2.5 bg-[#063311] text-white font-bold rounded-xl border border-[#166534] hover:bg-[#094718] transition text-sm">MENU</button>
                    <button onClick={() => startGame(currentLevelIdx)} className="flex-1 py-2 sm:py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-lg transition text-sm">RETRY</button>
                  </div>
                </div>
              </div>
            )}

            {/* The Actual Game Canvas */}
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onTouchMove={handleTouchMove}
              onTouchStart={handleTouchStart}
              className="w-full h-full object-contain cursor-none touch-none select-none"
            />
          </div>

          {/* RIGHT: Authentic Jardinains Forest Green Sidebar (Visible on Desktop lg: when NOT in fullscreen) */}
          {!isFullscreen && (
            <aside className="hidden lg:flex w-56 lg:w-60 bg-gradient-to-b from-[#053213] via-[#04280e] to-[#021808] p-3 sm:p-4 rounded-xl border border-[#0d4a1f] flex-col justify-between font-['Sniglet'] text-white select-none shadow-xl">
              
              {/* Top: Title & Dedication */}
              <div className="flex flex-col items-center">
                <h1 
                  onClick={() => setGameState('menu')}
                  className="text-3xl lg:text-4xl font-extrabold text-[#4ade80] drop-shadow-[0_2px_0_#000] tracking-wide cursor-pointer hover:scale-105 transition-transform"
                  title="Return to Menu"
                >
                  Jardinains!
                </h1>

                {/* with love for yesra right under Jardinains */}
                <div className="text-center text-xs font-bold text-rose-300 flex items-center justify-center gap-1 mt-0.5 mb-2 tracking-wide">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-pulse inline-block" />
                  <span>with love for yesra</span>
                </div>

                {/* Score */}
                <div className="w-full flex flex-col items-center mt-1">
                  <div className="text-xl lg:text-2xl text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Score:
                  </div>
                  <div className="text-2xl lg:text-3xl font-black text-[#86efac] tracking-wider drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                    {score.toLocaleString()}
                  </div>
                </div>

                {/* Level */}
                <div className="w-full flex flex-col items-center mt-3">
                  <div className="text-xl lg:text-2xl text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Level:
                  </div>
                  <div className="text-2xl lg:text-3xl font-black text-[#86efac] drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                    {currentLevelIdx + 1}
                  </div>
                </div>

                {/* Lives */}
                <div className="w-full flex flex-col items-center mt-3">
                  <div className="text-xl lg:text-2xl text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    Lives:
                  </div>
                  <div className="text-2xl lg:text-3xl font-black text-[#86efac] drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                    {lives}
                  </div>
                </div>

                {/* Nain Juggles Combo (if active) */}
                {(engineRef.current?.nainsJuggled || 0) > 0 && (
                  <div className="w-full flex flex-col items-center mt-2 animate-bounce">
                    <div className="text-xs text-amber-300 font-bold">Juggles:</div>
                    <div className="text-lg font-black text-amber-400">x{engineRef.current?.nainsJuggled}</div>
                  </div>
                )}
              </div>

              {/* Middle: High Scores Records (from Screenshot 2) */}
              <div className="my-4 space-y-2.5 text-center border-t border-[#0e441c] pt-3">
                <div>
                  <div className="text-[11px] text-[#22c55e]/90 font-bold uppercase tracking-wider">Your Highest Score</div>
                  <div className="text-sm font-bold text-[#86efac]">{userHighScore.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-[11px] text-[#22c55e]/90 font-bold uppercase tracking-wider">Your Highest Level</div>
                  <div className="text-sm font-bold text-[#86efac]">{userHighestLevel}</div>
                </div>

                <div>
                  <div className="text-[11px] text-[#22c55e]/90 font-bold uppercase tracking-wider">Highest Score</div>
                  <div className="text-xs text-rose-300 font-bold">yesra</div>
                  <div className="text-sm font-bold text-[#86efac]">{topScore.toLocaleString()}</div>
                </div>

                <div>
                  <div className="text-[11px] text-[#22c55e]/90 font-bold uppercase tracking-wider">Highest Level</div>
                  <div className="text-xs text-rose-300 font-bold">yesra</div>
                  <div className="text-sm font-bold text-[#86efac]">{topLevel}</div>
                </div>
              </div>

              {/* Bottom: Quick In-Game Controls */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#0e441c]">
                <div className="grid grid-cols-2 gap-1.5">
                  {gameState === 'playing' ? (
                    <button 
                      onClick={() => { setGameState('paused'); stopMusic(); }}
                      className="py-1 px-2 bg-[#063311] hover:bg-[#094718] text-white text-xs font-bold rounded border border-[#166534] transition flex items-center justify-center gap-1 cursor-pointer"
                      title="Pause Game"
                    >
                      <Pause className="w-3 h-3" /> Pause
                    </button>
                  ) : gameState === 'paused' ? (
                    <button 
                      onClick={() => { setGameState('playing'); engineRef.current.lastTime = performance.now(); if (options.musicEnabled) startMusic(); }}
                      className="py-1 px-2 bg-[#22c55e] hover:bg-[#4ade80] text-black text-xs font-extrabold rounded transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" /> Resume
                    </button>
                  ) : (
                    <button 
                      onClick={() => startGame(Math.max(0, unlockedLevel - 1))}
                      className="py-1 px-2 bg-[#22c55e] hover:bg-[#4ade80] text-black text-xs font-extrabold rounded transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" /> Play
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      const newSound = !options.soundEnabled;
                      saveOptions({ ...options, soundEnabled: newSound });
                    }}
                    className="py-1 px-2 bg-[#063311] hover:bg-[#094718] text-white text-xs font-bold rounded border border-[#166534] transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Toggle Sound"
                  >
                    {options.soundEnabled ? <Volume2 className="w-3 h-3 text-[#4ade80]" /> : <VolumeX className="w-3 h-3 text-rose-400" />}
                    <span>{options.soundEnabled ? 'Sound' : 'Mute'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button 
                    onClick={() => setShowLevelSelect(true)}
                    className="py-1 px-2 bg-[#063311] hover:bg-[#094718] text-emerald-200 text-xs font-bold rounded border border-[#166534] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Grid className="w-3 h-3" /> Levels
                  </button>
                  <button 
                    onClick={() => setShowOptions(true)}
                    className="py-1 px-2 bg-[#063311] hover:bg-[#094718] text-emerald-200 text-xs font-bold rounded border border-[#166534] transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Settings className="w-3 h-3" /> Options
                  </button>
                </div>

                <button 
                  onClick={toggleFullscreen}
                  className="w-full py-1.5 px-2 bg-[#04280e] hover:bg-[#063914] text-amber-300 hover:text-amber-200 text-xs font-bold rounded-lg border border-amber-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isFullscreen ? "Exit Fullscreen (F)" : "Play Full Screen (F)"}</span>
                </button>
              </div>

            </aside>
          )}
        </div>

        {/* Small bottom bar */}
        {!isFullscreen && (
          <footer className="w-full text-center text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 px-2 pt-2 pb-1">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAbout(true)} className="hover:text-emerald-400 transition flex items-center gap-1 cursor-pointer">
                <Info className="w-3.5 h-3.5" /> About Jardinains Remake
              </button>
              <button onClick={toggleFullscreen} className="hover:text-amber-300 transition flex items-center gap-1 cursor-pointer text-slate-300">
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isFullscreen ? "Exit Full Screen" : "Full Screen (F)"}</span>
              </button>
            </div>
            <span className="font-['Sniglet'] text-rose-400/90 flex items-center gap-1 font-semibold">
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500 animate-pulse" /> with love for yesra
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowScores(true)} className="hover:text-amber-400 transition flex items-center gap-1 cursor-pointer font-bold">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> High Scores
              </button>
              <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">• 1,000 Levels</span>
            </div>
          </footer>
        )}

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
          setPlayerName(name);
          const newScores = [...highScores, { id: Date.now().toString(), name, score: s, level: lvl, nainsJuggled: nj, date: new Date().toLocaleDateString() }]
            .sort((a, b) => b.score - a.score).slice(0, 10);
          setHighScores(newScores);
          localStorage.setItem('jardinains_scores', JSON.stringify(newScores));
        }}
      />
    </div>
  );
}
