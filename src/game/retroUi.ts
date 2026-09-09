import { Brick, Ball } from './types';

/**
 * Authentic Retro Arcade Renderer for Jardinains!
 * Recreating the classic arcade aesthetic:
 * - 3D beveled bricks with specular sheen & progressive crack damage
 * - Unbreakable steel plating with rivets and hazard grip ridges
 * - Red & Silver curved metallic arcade paddle with specular highlight glare
 * - Chrome 3D spherical ball & fireball particle aura
 * - Stone / brick arcade border walls
 */

/**
 * Draws the classic Jardinains playfield border frame (thin crisp arcade outline)
 */
export function drawArcadeBorder(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  wallThickness: number = 8
) {
  // Classic Jardinains playfield bounding frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.strokeRect(wallThickness / 2, wallThickness / 2, canvasWidth - wallThickness, canvasHeight - wallThickness);

  // Subtle outer edge shadow
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.lineWidth = 1;
  ctx.strokeRect(wallThickness / 2 - 1, wallThickness / 2 - 1, canvasWidth - wallThickness + 2, canvasHeight - wallThickness + 2);
}

function drawStoneWallSegment(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  orientation: 'horizontal' | 'vertical'
) {
  // Stone background gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.5, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Outer edge highlight bevel (light from top-left)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y, 2, h);

  // Inner edge shadow bevel
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(x + w - 2, y, 2, h);
  ctx.fillRect(x, y + h - 2, w, 2);

  // Mortar brick grooves
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (orientation === 'horizontal') {
    for (let bx = x + 35; bx < x + w; bx += 35) {
      ctx.moveTo(bx, y);
      ctx.lineTo(bx, y + h);
    }
  } else {
    for (let by = y + 30; by < y + h; by += 30) {
      ctx.moveTo(x, by);
      ctx.lineTo(x + w, by);
    }
  }
  ctx.stroke();
}

/**
 * Draws an authentic Jardinains 3D beveled brick
 */
export function drawClassicBeveledBrick(ctx: CanvasRenderingContext2D, b: Brick) {
  const { x, y, w, h, color, unbreakable, hp, maxHp } = b;

  if (unbreakable) {
    // Unbreakable Industrial Steel Brick with Rivets & Hazard Grooves
    ctx.fillStyle = '#475569';
    ctx.fillRect(x, y, w, h);

    const metalGrad = ctx.createLinearGradient(x, y, x, y + h);
    metalGrad.addColorStop(0, '#94a3b8');
    metalGrad.addColorStop(0.4, '#64748b');
    metalGrad.addColorStop(0.7, '#475569');
    metalGrad.addColorStop(1, '#334155');
    ctx.fillStyle = metalGrad;
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

    // Bevel highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillRect(x, y, w, 2);
    ctx.fillRect(x, y, 2, h);

    // Bevel shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y + h - 2, w, 2);
    ctx.fillRect(x + w - 2, y, 2, h);

    // Diagonal hazard grooves
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 6, y + h - 4);
    ctx.lineTo(x + w - 4, y + 6);
    ctx.moveTo(x + 18, y + h - 4);
    ctx.lineTo(x + w - 4, y + 18);
    ctx.stroke();

    // Rivets in 4 corners
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 4, y + 4, 2.5, 2.5);
    ctx.fillRect(x + w - 7, y + 4, 2.5, 2.5);
    ctx.fillRect(x + 4, y + h - 7, 2.5, 2.5);
    ctx.fillRect(x + w - 7, y + h - 7, 2.5, 2.5);

    // Rivet reflections
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x + 4, y + 4, 1, 1);
    ctx.fillRect(x + w - 7, y + 4, 1, 1);
    ctx.fillRect(x + 4, y + h - 7, 1, 1);
    ctx.fillRect(x + w - 7, y + h - 7, 1, 1);
    return;
  }

  // 1. Base color fill
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);

  // 2. Glossy 3D Gradient Surface Sheen
  const sheenGrad = ctx.createLinearGradient(x, y, x, y + h);
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  sheenGrad.addColorStop(0.25, 'rgba(255, 255, 255, 0.15)');
  sheenGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.1)');
  sheenGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(x, y, w, h);

  // 3. Top & Left 3D Beveled Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y, 2, h);

  // 4. Bottom & Right 3D Beveled Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillRect(x + w - 2, y, 2, h);

  // 5. Authentic Jardinains Wavy Horizontal Squiggle Lines (from original game)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  const yWave1 = y + h * 0.36;
  const yWave2 = y + h * 0.70;
  ctx.moveTo(x + 4, yWave1);
  ctx.quadraticCurveTo(x + w * 0.25, yWave1 - 2, x + w * 0.5, yWave1);
  ctx.quadraticCurveTo(x + w * 0.75, yWave1 + 2, x + w - 4, yWave1);
  ctx.moveTo(x + 4, yWave2);
  ctx.quadraticCurveTo(x + w * 0.25, yWave2 - 2, x + w * 0.5, yWave2);
  ctx.quadraticCurveTo(x + w * 0.75, yWave2 + 2, x + w - 4, yWave2);
  ctx.stroke();

  // Subtle dark wave accent for 3D depth
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.moveTo(x + 4, yWave1 + 1);
  ctx.quadraticCurveTo(x + w * 0.25, yWave1 - 1, x + w * 0.5, yWave1 + 1);
  ctx.quadraticCurveTo(x + w * 0.75, yWave1 + 3, x + w - 4, yWave1 + 1);
  ctx.stroke();

  // 6. Crack branches if damaged multi-hit brick
  if (maxHp > 1 && hp < maxHp) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const midX = x + w / 2;
    const midY = y + h / 2;

    ctx.moveTo(x + 4, y + 3);
    ctx.lineTo(midX, midY);
    ctx.lineTo(x + w - 6, y + h - 4);

    if (hp === 1 && maxHp >= 3) {
      // Deep spiderweb cracks
      ctx.moveTo(midX, midY);
      ctx.lineTo(x + 8, y + h - 3);
      ctx.moveTo(midX, midY);
      ctx.lineTo(x + w - 4, y + 4);
    }
    ctx.stroke();

    // Crack highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 4);
    ctx.lineTo(midX + 1, midY + 1);
    ctx.stroke();
  }
}

/**
 * Draws the classic red and silver metallic Jardinains paddle
 */
export function drawClassicPaddle(
  ctx: CanvasRenderingContext2D,
  paddleX: number,
  paddleY: number,
  paddleWidth: number,
  paddleHeight: number,
  sticky: boolean,
  laserActive: boolean
) {
  const capWidth = Math.min(14, paddleWidth * 0.16);
  const bodyX = paddleX + capWidth;
  const bodyW = paddleWidth - capWidth * 2;

  // 1. Metallic Cylindrical Body (Silver as seen in original Jardinains screenshot, or Sticky Green)
  const bodyGrad = ctx.createLinearGradient(0, paddleY, 0, paddleY + paddleHeight);
  if (sticky) {
    bodyGrad.addColorStop(0, '#86efac');
    bodyGrad.addColorStop(0.2, '#4ade80');
    bodyGrad.addColorStop(0.6, '#16a34a');
    bodyGrad.addColorStop(1, '#14532d');
  } else {
    // Authentic silver metallic capsule paddle from original Jardinains screenshot
    bodyGrad.addColorStop(0, '#ffffff');
    bodyGrad.addColorStop(0.2, '#e2e8f0');
    bodyGrad.addColorStop(0.55, '#94a3b8');
    bodyGrad.addColorStop(0.85, '#64748b');
    bodyGrad.addColorStop(1, '#334155');
  }
  ctx.fillStyle = bodyGrad;
  ctx.fillRect(bodyX, paddleY, bodyW, paddleHeight);

  // 2. Left Silver Aerodynamic End-Cap
  const capGrad = ctx.createLinearGradient(0, paddleY, 0, paddleY + paddleHeight);
  capGrad.addColorStop(0, '#f8fafc');
  capGrad.addColorStop(0.25, '#cbd5e1');
  capGrad.addColorStop(0.65, '#64748b');
  capGrad.addColorStop(1, '#334155');

  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.moveTo(paddleX + capWidth, paddleY);
  ctx.arcTo(paddleX, paddleY, paddleX, paddleY + paddleHeight / 2, 8);
  ctx.arcTo(paddleX, paddleY + paddleHeight, paddleX + capWidth, paddleY + paddleHeight, 8);
  ctx.lineTo(paddleX + capWidth, paddleY + paddleHeight);
  ctx.closePath();
  ctx.fill();

  // 3. Right Silver Aerodynamic End-Cap
  ctx.beginPath();
  ctx.moveTo(paddleX + paddleWidth - capWidth, paddleY);
  ctx.arcTo(paddleX + paddleWidth, paddleY, paddleX + paddleWidth, paddleY + paddleHeight / 2, 8);
  ctx.arcTo(paddleX + paddleWidth, paddleY + paddleHeight, paddleX + paddleWidth - capWidth, paddleY + paddleHeight, 8);
  ctx.lineTo(paddleX + paddleWidth - capWidth, paddleY + paddleHeight);
  ctx.closePath();
  ctx.fill();

  // 4. Specular White Glare Reflection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(paddleX + 6, paddleY + 2, paddleWidth - 12, 2.5);

  // 5. Bottom Inset Bevel Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.fillRect(paddleX + 6, paddleY + paddleHeight - 2.5, paddleWidth - 12, 2.5);

  // 6. Center Grip Slot Marker
  const mid = paddleX + paddleWidth / 2;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(mid - 3, paddleY + 2, 6, paddleHeight - 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillRect(mid - 1, paddleY + 2, 2, paddleHeight - 4);

  // 7. Laser Blaster Barrels
  if (laserActive) {
    ctx.fillStyle = '#be123c';
    ctx.fillRect(paddleX + 3, paddleY - 6, 5, 8);
    ctx.fillRect(paddleX + paddleWidth - 8, paddleY - 6, 5, 8);

    ctx.fillStyle = '#fda4af';
    ctx.fillRect(paddleX + 4, paddleY - 9, 3, 4);
    ctx.fillRect(paddleX + paddleWidth - 7, paddleY - 9, 3, 4);
  }

  // 8. Sticky Slime Droplets
  if (sticky) {
    ctx.fillStyle = 'rgba(74, 222, 128, 0.85)';
    ctx.beginPath();
    ctx.arc(paddleX + paddleWidth * 0.25, paddleY + paddleHeight + 3, 2.5, 0, Math.PI * 2);
    ctx.arc(paddleX + paddleWidth * 0.75, paddleY + paddleHeight + 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws the 3D chrome sphere or fiery fireball
 */
export function drawClassicBall(ctx: CanvasRenderingContext2D, b: Ball) {
  if (b.isFireball) {
    // Fireball radial aura
    const fireGrad = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, b.radius + 6);
    fireGrad.addColorStop(0, '#ffffff');
    fireGrad.addColorStop(0.25, '#fef08a');
    fireGrad.addColorStop(0.55, '#f97316');
    fireGrad.addColorStop(0.85, '#dc2626');
    fireGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');

    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius + 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  // Chrome 3D Sphere with Specular Glint
  const ballGrad = ctx.createRadialGradient(
    b.x - b.radius * 0.35,
    b.y - b.radius * 0.35,
    b.radius * 0.08,
    b.x,
    b.y,
    b.radius
  );
  ballGrad.addColorStop(0, '#ffffff');
  ballGrad.addColorStop(0.35, '#e2e8f0');
  ballGrad.addColorStop(0.7, '#94a3b8');
  ballGrad.addColorStop(1, '#475569');

  ctx.fillStyle = ballGrad;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Draws the bottom energetic laser forcefield shield
 */
export function drawClassicShield(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  timeMs: number
) {
  const y = canvasHeight - 12;
  const h = 10;

  // Glow aura
  const glowGrad = ctx.createLinearGradient(0, y - 6, 0, y + h);
  glowGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
  glowGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
  glowGrad.addColorStop(1, 'rgba(14, 165, 233, 0.8)');

  ctx.fillStyle = glowGrad;
  ctx.fillRect(12, y - 6, canvasWidth - 24, h + 6);

  // Core laser beam
  ctx.fillStyle = '#a5f3fc';
  ctx.fillRect(12, y + 2, canvasWidth - 24, 3);

  // High intensity spark
  const sparkX = 20 + ((timeMs * 0.3) % (canvasWidth - 40));
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sparkX, y + 3.5, 4, 0, Math.PI * 2);
  ctx.fill();
}
