import { Nain, Brick, Projectile, PowerUp, Particle, FloatingText } from './types';
import { SoundEffect } from './audio';

export const NAIN_WIDTH = 26;
export const NAIN_HEIGHT = 30;

// Factory for spawning a new Jardinain
export function createNain(
  x: number,
  y: number,
  hatType: Nain['hatType'] = 'red',
  id?: string
): Nain {
  const isGold = hatType === 'gold';
  const isBlue = hatType === 'blue';
  const isGreen = hatType === 'green';

  const baseSpeed = isGreen ? 1.4 : isGold ? 1.2 : isBlue ? 0.8 : 1.0;
  const maxHp = isGold ? 3 : isBlue ? 2 : 1;

  let color = '#ef4444';
  if (isGreen) color = '#10b981';
  else if (isBlue) color = '#3b82f6';
  else if (isGold) color = '#fbbf24';

  return {
    id: id || `nain_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    x,
    y,
    vx: (Math.random() > 0.5 ? 1 : -1) * baseSpeed,
    vy: 0,
    baseSpeed,
    w: NAIN_WIDTH,
    h: NAIN_HEIGHT,
    facing: Math.random() > 0.5 ? 'right' : 'left',
    state: 'idle',
    color,
    hatType,
    hp: maxHp,
    maxHp,
    standingOnBrickId: null,
    bounceCount: 0,
    shootTimer: Math.random() * 180 + 120,
    throwAnimTimer: 0,
    tauntTimer: Math.random() * 200 + 100,
    tauntText: null,
    animFrame: 0,
    walkCycle: 0,
    isParachuting: false,
    dodgeCooldown: 0,
  };
}

// Spawns a replacement or reinforcement Jardinain parachuting in from the sky
export function createParachutingNain(
  x: number,
  targetY: number,
  hatType: Nain['hatType'] = 'red'
): Nain {
  const nain = createNain(x, -40, hatType);
  nain.vy = 1.4;
  nain.isParachuting = true;
  nain.state = 'falling';
  nain.tauntText = 'HERE I COME!';
  return nain;
}

// Cheeky retro taunts for various Nain situations
export const NAIN_TAUNTS = {
  idle: [
    'Nya nya!',
    'Missed me!',
    'Too slow!',
    'Hey butterfingers!',
    'Catch this!',
    'Try harder!',
    'Nice shot... NOT!',
    'Pfft!',
    'Is that all?',
  ],
  throw: ['Bombs away!', 'Catch!', 'Take that!', 'Flower power!', 'Incoming!'],
  hit: ['OUCH!', 'HEY!', 'MY HAT!', 'THAT HURT!', 'NO FAIR!'],
  fall: ['WHOA!', 'AAAAAH!', 'HELP!', 'HOLD ON!', 'YIKES!'],
  juggle: [
    'WHEEE!',
    'AGAIN!',
    'WHEEE!!',
    'HOLY SMOKES!',
    'HIGHER!',
    'COMBO!',
    'WEEEEEE!',
  ],
  splat: ['OOF!', 'SPLAT!', 'MY PRIDE!', 'I FELL!'],
};

// Check if a point is on a solid brick
export function findBrickUnderNain(
  nainX: number,
  nainY: number,
  nainW: number,
  nainH: number,
  bricks: Brick[]
): Brick | null {
  const footX = nainX + nainW / 2;
  const footY = nainY + nainH + 2;

  for (const b of bricks) {
    if (footX >= b.x && footX <= b.x + b.w && footY >= b.y - 4 && footY <= b.y + 8) {
      return b;
    }
  }
  return null;
}

// Check if an adjacent brick exists across a 1-tile gap for acrobatic Green/Gold nains
export function findNearbyLedge(
  nainX: number,
  nainY: number,
  nainW: number,
  nainH: number,
  facing: 'left' | 'right',
  bricks: Brick[]
): Brick | null {
  const checkX = facing === 'right' ? nainX + nainW + 40 : nainX - 40;
  const checkY = nainY + nainH + 2;

  for (const b of bricks) {
    if (checkX >= b.x && checkX <= b.x + b.w && Math.abs(checkY - b.y) <= 12) {
      return b;
    }
  }
  return null;
}

// Main Jardinains update function
export function updateJardinains(
  nains: Nain[],
  bricks: Brick[],
  projectiles: Projectile[],
  particles: Particle[],
  floatingTexts: FloatingText[],
  powerups: PowerUp[],
  balls: { x: number; y: number; vx: number; vy: number; radius: number }[],
  paddleX: number,
  paddleWidth: number,
  paddleY: number,
  canvasWidth: number,
  canvasHeight: number,
  onScoreGain: (pts: number) => void,
  onNainBounce: (count: number) => void,
  playSound: (sound: SoundEffect, options?: { pitchMult?: number }) => void
) {
  for (let i = nains.length - 1; i >= 0; i--) {
    const nain = nains[i];
    nain.animFrame += 1;

    // Cooldown timers
    if (nain.dodgeCooldown && nain.dodgeCooldown > 0) {
      nain.dodgeCooldown -= 1;
    }

    // State 1: Parachuting in from the sky
    if (nain.isParachuting) {
      nain.y += nain.vy;
      nain.x += Math.sin(nain.animFrame * 0.08) * 0.8;

      // Look for a landing brick platform
      const landingBrick = findBrickUnderNain(nain.x, nain.y, nain.w, nain.h, bricks);
      if (landingBrick && nain.y + nain.h >= landingBrick.y - 2) {
        nain.isParachuting = false;
        nain.y = landingBrick.y - nain.h;
        nain.vy = 0;
        nain.state = 'idle';
        nain.standingOnBrickId = landingBrick.id;
        nain.tauntText = 'Landed!';
        playSound('paddle', { pitchMult: 1.4 });

        // Puff particles on landing
        for (let p = 0; p < 5; p++) {
          particles.push({
            x: nain.x + nain.w / 2,
            y: nain.y + nain.h,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2,
            radius: Math.random() * 2.5 + 1.5,
            color: '#ffffff',
            alpha: 0.8,
            decay: 0.05,
          });
        }
      } else if (nain.y > canvasHeight - 80) {
        nain.isParachuting = false;
        nain.state = 'falling';
      }
      continue;
    }

    // State 2: Standing / Walking on bricks
    if (nain.state === 'idle' || nain.state === 'walking' || nain.state === 'throwing') {
      // Check if brick beneath still exists
      const currentBrick = findBrickUnderNain(nain.x, nain.y, nain.w, nain.h, bricks);

      if (!currentBrick) {
        // Brick was destroyed beneath him!
        nain.state = 'falling';
        nain.standingOnBrickId = null;
        nain.vy = 1.2;
        nain.tauntText = NAIN_TAUNTS.fall[Math.floor(Math.random() * NAIN_TAUNTS.fall.length)];
        playSound('nain_fall');

        // Surprise particles
        for (let p = 0; p < 4; p++) {
          particles.push({
            x: nain.x + nain.w / 2,
            y: nain.y,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3,
            radius: 2,
            color: '#fbbf24',
            alpha: 1,
            decay: 0.05,
            shape: 'star',
          });
        }
        continue;
      }

      nain.standingOnBrickId = currentBrick.id;
      nain.y = currentBrick.y - nain.h;

      // Handle throwing windup state
      if (nain.state === 'throwing') {
        nain.throwAnimTimer -= 1;
        if (nain.throwAnimTimer <= 0) {
          // LOB PROJECTILE HAZARD DOWNWARD!
          nain.state = 'idle';
          nain.shootTimer = Math.random() * 180 + (nain.hatType === 'green' ? 100 : 150);

          let pType: Projectile['type'] = 'nain_pot';
          let pColor = '#b45309'; // Terracotta red-brown flowerpot

          if (nain.hatType === 'green') {
            pType = 'nain_seed';
            pColor = '#15803d'; // Green bouncy acorn
          } else if (nain.hatType === 'blue') {
            pType = 'nain_ice';
            pColor = '#38bdf8'; // Glowing ice pot
          } else if (nain.hatType === 'gold') {
            pType = 'nain_pot';
            pColor = '#eab308'; // Golden explosive pot
          }

          // Aim slightly towards player's paddle with small spread
          const targetX = paddleX + paddleWidth / 2;
          const dx = targetX - (nain.x + nain.w / 2);
          const launchVx = Math.max(-2.5, Math.min(2.5, dx * 0.006 + (Math.random() - 0.5) * 0.8));

          projectiles.push({
            id: `proj_${Date.now()}_${Math.random()}`,
            x: nain.x + nain.w / 2,
            y: nain.y + nain.h,
            vx: launchVx,
            vy: 3.2 + Math.random() * 0.6,
            type: pType,
            radius: pType === 'nain_seed' ? 4 : 5.5,
            rotation: 0,
            vRot: (Math.random() - 0.5) * 0.15,
            color: pColor,
          });

          playSound('throw');

          // Flash taunt on throw
          if (Math.random() < 0.4) {
            nain.tauntText = NAIN_TAUNTS.throw[Math.floor(Math.random() * NAIN_TAUNTS.throw.length)];
            setTimeout(() => {
              if (nain.tauntText && NAIN_TAUNTS.throw.includes(nain.tauntText)) {
                nain.tauntText = null;
              }
            }, 1400);
          }
        }
        continue;
      }

      // Dodge ball mechanic for Green and Gold Nains
      if ((nain.hatType === 'green' || nain.hatType === 'gold') && (!nain.dodgeCooldown || nain.dodgeCooldown === 0)) {
        for (const b of balls) {
          if (b.vy < 0 && Math.abs(b.x - (nain.x + nain.w / 2)) < 35 && b.y > nain.y && b.y < nain.y + 110) {
            // Ball is rushing up directly at this Nain! Scurry away or hop!
            nain.vx = b.x < nain.x + nain.w / 2 ? Math.abs(nain.baseSpeed) * 1.6 : -Math.abs(nain.baseSpeed) * 1.6;
            nain.facing = nain.vx > 0 ? 'right' : 'left';
            nain.dodgeCooldown = 60;
            nain.tauntText = 'DODGE!';
            setTimeout(() => {
              if (nain.tauntText === 'DODGE!') nain.tauntText = null;
            }, 1000);
            break;
          }
        }
      }

      // Move along brick surface
      nain.state = 'walking';
      nain.x += nain.vx;
      nain.walkCycle += Math.abs(nain.vx) * 0.18;
      nain.facing = nain.vx > 0 ? 'right' : 'left';

      // Edge of screen boundaries
      if (nain.x < 25) {
        nain.x = 25;
        nain.vx = Math.abs(nain.baseSpeed);
        nain.facing = 'right';
      } else if (nain.x + nain.w > canvasWidth - 25) {
        nain.x = canvasWidth - 25 - nain.w;
        nain.vx = -Math.abs(nain.baseSpeed);
        nain.facing = 'left';
      }

      // Check if near the edge of the current brick platform
      const nextFootX = nain.vx > 0 ? nain.x + nain.w + 8 : nain.x - 8;
      const nextBrick = bricks.find(
        b => nextFootX >= b.x && nextFootX <= b.x + b.w && Math.abs((nain.y + nain.h + 2) - b.y) <= 8
      );

      if (!nextBrick) {
        // Approaching a gap/ledge!
        // Green and Gold nains can hop across 1-tile gaps
        if (nain.hatType === 'green' || nain.hatType === 'gold') {
          const acrossLedge = findNearbyLedge(nain.x, nain.y, nain.w, nain.h, nain.facing, bricks);
          if (acrossLedge && Math.random() < 0.45) {
            // Acrobatic hop over the gap!
            nain.x += nain.vx * 3;
            nain.y -= 6;
          } else {
            nain.vx = -nain.vx;
            nain.facing = nain.vx > 0 ? 'right' : 'left';
          }
        } else {
          // Standard turn around
          nain.vx = -nain.vx;
          nain.facing = nain.vx > 0 ? 'right' : 'left';
        }
      }

      // Shoot / Throw attack countdown
      nain.shootTimer -= 1;
      if (nain.shootTimer <= 0) {
        nain.state = 'throwing';
        nain.throwAnimTimer = 18; // Windup frames
      }

      // Idle speech taunts
      nain.tauntTimer -= 1;
      if (nain.tauntTimer <= 0) {
        nain.tauntTimer = Math.random() * 260 + 160;
        nain.tauntText = NAIN_TAUNTS.idle[Math.floor(Math.random() * NAIN_TAUNTS.idle.length)];
        setTimeout(() => {
          if (nain.tauntText && NAIN_TAUNTS.idle.includes(nain.tauntText)) {
            nain.tauntText = null;
          }
        }, 1800);
      }
    }

    // State 3: Falling & Paddle Juggling
    else if (nain.state === 'falling' || nain.state === 'juggled') {
      nain.vy += 0.22; // Smooth gravity
      nain.x += nain.vx;
      nain.y += nain.vy;

      // Screen boundary bounces
      if (nain.x < 15) {
        nain.x = 15;
        nain.vx = Math.abs(nain.vx) * 0.8;
      } else if (nain.x + nain.w > canvasWidth - 15) {
        nain.x = canvasWidth - 15 - nain.w;
        nain.vx = -Math.abs(nain.vx) * 0.8;
      }

      // Juggled Nain Smashes through Bricks when flying upwards!
      if (nain.vy < 0) {
        for (let bIdx = bricks.length - 1; bIdx >= 0; bIdx--) {
          const b = bricks[bIdx];
          if (
            nain.x + nain.w >= b.x &&
            nain.x <= b.x + b.w &&
            nain.y <= b.y + b.h &&
            nain.y + nain.h >= b.y
          ) {
            // Smash brick on impact!
            if (b.unbreakable) {
              nain.vy = Math.abs(nain.vy) * 0.6; // Ricochet off unbreakable
              playSound('unbreakable_hit');
            } else {
              b.hp -= 2;
              b.flashTimer = 5;
              b.shakeX = (Math.random() - 0.5) * 6;
              b.shakeY = (Math.random() - 0.5) * 6;

              if (b.hp <= 0) {
                bricks.splice(bIdx, 1);
                const smashPts = 300 + (b.type === 7 ? 500 : b.type === 6 ? 200 : 100);
                onScoreGain(smashPts);
                playSound('nain_smash');

                floatingTexts.push({
                  text: `NAIN SMASH! +${smashPts}`,
                  x: b.x + b.w / 2,
                  y: b.y,
                  color: '#facc15',
                  alpha: 1,
                  vy: -1.5,
                });

                // Spark debris
                for (let p = 0; p < 6; p++) {
                  particles.push({
                    x: b.x + b.w / 2,
                    y: b.y + b.h / 2,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    radius: Math.random() * 2.5 + 1.5,
                    color: b.color,
                    alpha: 1,
                    decay: 0.04,
                  });
                }
              } else {
                onScoreGain(75);
                playSound('brick_hit');
              }
            }
            break;
          }
        }
      }

      // PADDLE JUGGLE BOUNCE!
      if (
        nain.vy > 0 &&
        nain.y + nain.h >= paddleY &&
        nain.y <= paddleY + 16 &&
        nain.x + nain.w >= paddleX - 6 &&
        nain.x <= paddleX + paddleWidth + 6
      ) {
        nain.bounceCount += 1;
        nain.state = 'juggled';
        onNainBounce(nain.bounceCount);

        // Score scaling per consecutive juggle
        const jugglePts = 100 * nain.bounceCount;
        onScoreGain(jugglePts);

        // Sound escalates with each juggle
        playSound('nain_bounce', { pitchMult: Math.min(2.2, 1.0 + nain.bounceCount * 0.15) });

        // Launch upward
        nain.vy = -Math.min(10.5, 6.0 + nain.bounceCount * 0.55);
        const hitOffset = (nain.x + nain.w / 2 - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        nain.vx = hitOffset * 4.8;

        // Comical juggle taunts
        const jTauntIdx = Math.min(NAIN_TAUNTS.juggle.length - 1, nain.bounceCount - 1);
        nain.tauntText = NAIN_TAUNTS.juggle[jTauntIdx];

        floatingTexts.push({
          text: `+${jugglePts} (JUGGLE x${nain.bounceCount})`,
          x: nain.x + nain.w / 2,
          y: paddleY - 18,
          color: '#fde047',
          alpha: 1,
          vy: -1.5,
        });

        // Sparkle burst around paddle
        for (let sp = 0; sp < 7; sp++) {
          particles.push({
            x: nain.x + nain.w / 2,
            y: paddleY,
            vx: (Math.random() - 0.5) * 5,
            vy: -Math.random() * 4 - 1,
            radius: Math.random() * 2.5 + 1.5,
            color: '#facc15',
            alpha: 1,
            decay: 0.04,
            shape: 'star',
          });
        }

        // Guaranteed powerup drop every 2nd or 3rd bounce!
        if (nain.bounceCount % 2 === 0 || nain.hatType === 'gold') {
          const powerTypes: PowerUp['type'][] = [
            'multiball',
            'laser',
            'fireball',
            'expand',
            'shield',
            'heart',
            'slow_ball',
            'sticky',
            'bonus_points',
          ];
          powerups.push({
            id: `pw_j_${Date.now()}_${Math.random()}`,
            x: nain.x,
            y: paddleY - 25,
            vy: -2.8,
            type: powerTypes[Math.floor(Math.random() * powerTypes.length)],
            w: 26,
            h: 18,
          });
        }
      }

      // Bottom Splat
      if (nain.y >= canvasHeight - 22) {
        nain.state = 'splat';
        nain.y = canvasHeight - 16;
        nain.vx = 0;
        nain.vy = 0;
        playSound('splat');
        nain.tauntText = NAIN_TAUNTS.splat[Math.floor(Math.random() * NAIN_TAUNTS.splat.length)];

        // Poof timeout
        setTimeout(() => {
          nain.state = 'poof';
          playSound('poof');

          // Smoke puff particles
          for (let p = 0; p < 10; p++) {
            particles.push({
              x: nain.x + nain.w / 2,
              y: canvasHeight - 15,
              vx: (Math.random() - 0.5) * 4,
              vy: -Math.random() * 3 - 0.5,
              radius: Math.random() * 3.5 + 2,
              color: '#94a3b8',
              alpha: 0.9,
              decay: 0.035,
            });
          }

          setTimeout(() => {
            const idx = nains.indexOf(nain);
            if (idx !== -1) nains.splice(idx, 1);
          }, 300);
        }, 900);
      }
    }
  }
}

// Procedural Canvas Renderer for Authentic Jardinain Gnome Characters
export function drawJardinain(ctx: CanvasRenderingContext2D, nain: Nain) {
  ctx.save();
  ctx.translate(nain.x + nain.w / 2, nain.y + nain.h / 2);

  // Parachute canopy
  if (nain.isParachuting) {
    ctx.save();
    ctx.translate(0, -nain.h / 2 - 14);

    // Parachute lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-16, -6);
    ctx.lineTo(0, 14);
    ctx.moveTo(16, -6);
    ctx.lineTo(0, 14);
    ctx.moveTo(0, -8);
    ctx.lineTo(0, 14);
    ctx.stroke();

    // Canopy dome
    ctx.fillStyle = nain.hatType === 'gold' ? '#eab308' : nain.hatType === 'green' ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -8, 18, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    // Canopy stripes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -8, 6, Math.PI, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Rotation during falling / cartwheel juggle
  if (nain.state === 'falling' || nain.state === 'juggled') {
    ctx.rotate((nain.bounceCount * 0.5 + nain.animFrame * 0.12) * (nain.vx >= 0 ? 1 : -1));
  } else if (nain.state === 'splat') {
    ctx.scale(1.6, 0.35);
  } else if (nain.facing === 'left') {
    ctx.scale(-1, 1);
  }

  // Walking bob & wobble
  const stepBob = nain.state === 'walking' ? Math.sin(nain.walkCycle) * 1.5 : 0;

  // 1. Little Boots
  ctx.fillStyle = '#78350f';
  if (nain.state === 'walking') {
    const footOffset = Math.sin(nain.walkCycle) * 3;
    ctx.fillRect(-8 + footOffset, nain.h / 2 - 6, 6, 5);
    ctx.fillRect(2 - footOffset, nain.h / 2 - 6, 6, 5);
  } else {
    ctx.fillRect(-8, nain.h / 2 - 6, 6, 5);
    ctx.fillRect(2, nain.h / 2 - 6, 6, 5);
  }

  // 2. Coat / Tunic
  ctx.fillStyle = nain.color;
  ctx.beginPath();
  ctx.roundRect(-nain.w / 2 + 1, -nain.h / 2 + 11 + stepBob, nain.w - 2, 13, 3);
  ctx.fill();

  // Belt & Golden Buckle
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(-nain.w / 2 + 1, -nain.h / 2 + 18 + stepBob, nain.w - 2, 3);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-2.5, -nain.h / 2 + 17.5 + stepBob, 5, 4);

  // 3. Peach Face
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -nain.h / 2 + 9 + stepBob, 7.5, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
  ctx.beginPath();
  ctx.arc(-4, -nain.h / 2 + 11 + stepBob, 2.2, 0, Math.PI * 2);
  ctx.arc(4, -nain.h / 2 + 11 + stepBob, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Rosy Button Nose
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.arc(0, -nain.h / 2 + 10 + stepBob, 3, 0, Math.PI * 2);
  ctx.fill();

  // 4. Flowing White Beard
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(0, -nain.h / 2 + 14 + stepBob, 6.5, 0, Math.PI);
  ctx.lineTo(0, -nain.h / 2 + 19 + stepBob);
  ctx.closePath();
  ctx.fill();

  // 5. Expressive Animated Eyes
  ctx.fillStyle = '#0f172a';
  if (nain.state === 'falling') {
    // Shocked wide eyes
    ctx.beginPath();
    ctx.arc(-3, -nain.h / 2 + 7 + stepBob, 2.2, 0, Math.PI * 2);
    ctx.arc(3, -nain.h / 2 + 7 + stepBob, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2.5, -nain.h / 2 + 6.5 + stepBob, 0.8, 0, Math.PI * 2);
    ctx.arc(3.5, -nain.h / 2 + 6.5 + stepBob, 0.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (nain.state === 'juggled') {
    // Joyful squint / dizzy spin
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-3, -nain.h / 2 + 7 + stepBob, 2, Math.PI, 0);
    ctx.arc(3, -nain.h / 2 + 7 + stepBob, 2, Math.PI, 0);
    ctx.stroke();
  } else {
    // Standard eyes (with occasional blink)
    const isBlinking = nain.animFrame % 140 > 134;
    if (isBlinking) {
      ctx.fillRect(-4.5, -nain.h / 2 + 7.5 + stepBob, 3, 1);
      ctx.fillRect(1.5, -nain.h / 2 + 7.5 + stepBob, 3, 1);
    } else {
      ctx.beginPath();
      ctx.arc(-3, -nain.h / 2 + 7 + stepBob, 1.4, 0, Math.PI * 2);
      ctx.arc(3, -nain.h / 2 + 7 + stepBob, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 6. Conical Pointed Gnome Hat (Customized per Hat Archetype)
  const hatColor =
    nain.hatType === 'gold'
      ? '#eab308'
      : nain.hatType === 'green'
      ? '#16a34a'
      : nain.hatType === 'blue'
      ? '#2563eb'
      : '#dc2626';

  ctx.fillStyle = hatColor;
  ctx.beginPath();
  ctx.moveTo(-nain.w / 2 + 2, -nain.h / 2 + 6 + stepBob);
  ctx.lineTo(2, -nain.h / 2 - 13 + stepBob); // Hat tip
  ctx.lineTo(nain.w / 2 - 2, -nain.h / 2 + 6 + stepBob);
  ctx.closePath();
  ctx.fill();

  // Hat Band & Details
  if (nain.hatType === 'gold') {
    // Royal Golden Crown with Ruby Jewel!
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-nain.w / 2 + 2, -nain.h / 2 + 3 + stepBob, nain.w - 4, 3);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -nain.h / 2 + 4.5 + stepBob, 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (nain.hatType === 'blue') {
    // Wizard Star Band
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(-nain.w / 2 + 2, -nain.h / 2 + 3 + stepBob, nain.w - 4, 3);
  }

  // 7. Hands holding pot if throwing windup
  if (nain.state === 'throwing') {
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(-8, -nain.h / 2 + 2 + stepBob, 3, 0, Math.PI * 2);
    ctx.arc(8, -nain.h / 2 + 2 + stepBob, 3, 0, Math.PI * 2);
    ctx.fill();

    // Flowerpot held above head
    ctx.fillStyle = nain.hatType === 'blue' ? '#38bdf8' : '#b45309';
    ctx.fillRect(-5, -nain.h / 2 - 5 + stepBob, 10, 7);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, -nain.h / 2 - 6 + stepBob, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Speech Taunt Bubble
  if (nain.tauntText) {
    ctx.save();
    ctx.font = 'bold 11px system-ui, sans-serif';
    const textMetrics = ctx.measureText(nain.tauntText);
    const boxW = Math.max(38, textMetrics.width + 14);
    const boxH = 19;
    const bX = nain.x + nain.w / 2 - boxW / 2;
    const bY = nain.y - 25;

    // Bubble shadow & background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(bX, bY, boxW, boxH, 5);
    ctx.fill();

    // Bubble speech tail pointing down to gnome head
    ctx.beginPath();
    ctx.moveTo(nain.x + nain.w / 2 - 3, bY + boxH);
    ctx.lineTo(nain.x + nain.w / 2, bY + boxH + 4);
    ctx.lineTo(nain.x + nain.w / 2 + 3, bY + boxH);
    ctx.fill();

    // Bubble border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bubble text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(nain.tauntText, bX + boxW / 2, bY + 13);
    ctx.restore();
  }
}

// Procedural Renderer for Jardinain Projectile Hazards (Flowerpots, Ice Pots, Acorns)
export function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile) {
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.rotation !== undefined) {
    ctx.rotate(p.rotation);
  }

  if (p.type === 'nain_pot') {
    // Terracotta Flowerpot
    ctx.fillStyle = p.color || '#b45309';
    // Rim
    ctx.fillRect(-p.radius - 1, -p.radius, (p.radius + 1) * 2, 3);
    // Pot body
    ctx.beginPath();
    ctx.moveTo(-p.radius, -p.radius + 3);
    ctx.lineTo(p.radius, -p.radius + 3);
    ctx.lineTo(p.radius * 0.7, p.radius);
    ctx.lineTo(-p.radius * 0.7, p.radius);
    ctx.closePath();
    ctx.fill();

    // Green sprout
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, -p.radius - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'nain_ice') {
    // Frost Ice Pot with glowing crystal aura
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(-1, -1, p.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (p.type === 'nain_seed' || p.type === 'nain_rock') {
    // Acorn / Pebble
    ctx.fillStyle = '#78716c';
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a8a29e';
    ctx.beginPath();
    ctx.arc(-1.5, -1.5, p.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.type === 'player_laser') {
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 8;
    ctx.fillRect(-2, -7, 4, 14);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}
