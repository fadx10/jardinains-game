import { LevelConfig } from './types';

export const TOTAL_LEVELS = 1000;

// Deterministic seed randomizer for consistent 1000-level generation
function seededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// 10 Distinct Era Chapters across the 1,000 Level Journey
const CHAPTER_PREFIXES = [
  'Royal', 'Emerald', 'Ancient', 'Clockwork', 'Amber', 'Crystal',
  'Moonlit', 'Obsidian', 'Solar', 'Celestial', 'Starlit', 'Gilded',
  'Verdant', 'Diamond', 'Sapphire', 'Ruby', 'Ironclad', 'Whispering',
  'Arcane', 'Harmonic', 'Ethereal', 'Sovereign', 'Velvet', 'Mystic'
];

const ARCHITECTURE_NOUNS = [
  'Garden Gate', 'Ramparts', 'Citadel', 'Colonnade', 'Watchtower',
  'Bastion', 'Pergola', 'Parapet', 'Labyrinth', 'Pavilion',
  'Sanctuary', 'Fortress', 'Arbor', 'Veranda', 'Terrace',
  'Keep', 'Arcade', 'Cathedral', 'Alcove', 'Spires'
];

export function getLevelName(lvlIndex: number): string {
  const lvlNum = lvlIndex + 1;
  if (lvlNum === 1) return 'Garden Gate';
  if (lvlNum === 100) return 'Centennial Crown';
  if (lvlNum === 250) return 'Quartermaster Citadel';
  if (lvlNum === 500) return 'Grand Equinox Bastion';
  if (lvlNum === 750) return 'Astral Celestial Spire';
  if (lvlNum === 1000) return 'With Love for Yesra - Eternal Garden';

  const prefix = CHAPTER_PREFIXES[Math.floor(lvlIndex / 42) % CHAPTER_PREFIXES.length];
  const noun = ARCHITECTURE_NOUNS[lvlIndex % ARCHITECTURE_NOUNS.length];
  const worldNum = Math.floor(lvlIndex / 100) + 1;
  const stageInWorld = (lvlIndex % 100) + 1;

  return `${prefix} ${noun} ${worldNum}-${stageInWorld}`;
}

// Helper to create grid patterns for any of the 1000 levels
export function generateLevelGrid(lvlIndex: number): { grid: number[][]; nainSpawns: LevelConfig['nainSpawns'] } {
  const rows = Math.min(9, 5 + Math.floor((lvlIndex % 100) / 22));
  const cols = 12;
  const grid: number[][] = [];
  const difficulty = Math.min(1, (lvlIndex + 1) / 1000);

  // Grand Finale Level 1000 (Index 999): Ultimate Heart & Crown Castle for Yesra
  if (lvlIndex === 999) {
    const heartGrid = [
      [0, 5, 5, 0, 0, 7, 7, 0, 0, 5, 5, 0],
      [5, 4, 4, 5, 6, 7, 7, 6, 5, 4, 4, 5],
      [5, 3, 3, 3, 5, 7, 7, 5, 3, 3, 3, 5],
      [0, 5, 2, 2, 2, 6, 6, 2, 2, 2, 5, 0],
      [0, 0, 5, 2, 1, 1, 1, 1, 2, 5, 0, 0],
      [0, 0, 0, 5, 1, 7, 7, 1, 5, 0, 0, 0],
      [0, 0, 0, 0, 5, 1, 1, 5, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 5, 5, 0, 0, 0, 0, 0],
    ];
    return {
      grid: heartGrid,
      nainSpawns: [
        { x: 180, y: 35, hatType: 'gold', color: '#fbbf24' },
        { x: 340, y: 35, hatType: 'green', color: '#10b981' },
        { x: 440, y: 35, hatType: 'blue', color: '#3b82f6' },
        { x: 600, y: 35, hatType: 'red', color: '#f43f5e' },
        { x: 390, y: 90, hatType: 'gold', color: '#fbbf24' },
      ],
    };
  }

  // Milestone Level 100 Heart
  if (lvlIndex === 99) {
    const heartGrid = [
      [0, 1, 1, 0, 0, 7, 7, 0, 0, 1, 1, 0],
      [1, 2, 2, 1, 6, 7, 7, 6, 1, 2, 2, 1],
      [1, 3, 3, 3, 1, 7, 7, 1, 3, 3, 3, 1],
      [0, 1, 3, 3, 3, 6, 6, 3, 3, 3, 1, 0],
      [0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0],
      [0, 0, 0, 1, 2, 7, 7, 2, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 5, 5, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
    ];
    return {
      grid: heartGrid,
      nainSpawns: [
        { x: 200, y: 35, hatType: 'red', color: '#ef4444' },
        { x: 390, y: 35, hatType: 'green', color: '#10b981' },
        { x: 580, y: 35, hatType: 'blue', color: '#3b82f6' },
        { x: 390, y: 80, hatType: 'red', color: '#f43f5e' },
      ],
    };
  }

  // Level 1: "Garden Gate" - Welcoming layout with Normal, Strong, a Power-up, Bonus Star and Glass Tiles
  if (lvlIndex === 0) {
    const l1Grid = [
      [5, 8, 1, 2, 2, 7, 7, 2, 2, 1, 8, 5],
      [1, 1, 8, 3, 6, 1, 1, 6, 3, 8, 1, 1],
      [1, 2, 2, 1, 1, 2, 2, 1, 1, 2, 2, 1],
      [0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0],
    ];
    return {
      grid: l1Grid,
      nainSpawns: [
        { x: 230, y: 40, hatType: 'red', color: '#ef4444' },
        { x: 550, y: 40, hatType: 'green', color: '#10b981' },
      ],
    };
  }

  const patternType = lvlIndex % 18;

  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      let cell = 0;
      const rnd = seededRandom(lvlIndex * 137 + r * 31 + c);

      switch (patternType) {
        case 0: // Full Tiered Rows (Normal in front, Strong in mid, Very Strong & Powerup in back)
          if (r === 0) cell = c === 5 || c === 6 ? 7 : 3;
          else if (r === 1) cell = (c === 2 || c === 9) ? 6 : 2;
          else if (r === 2) cell = 2;
          else cell = 1;
          if ((r === 0 || r === 1) && (c === 0 || c === cols - 1)) cell = 5; // Unbreakable corner anchors
          break;

        case 1: // Castle Battlements & Gaps (Embrasure gaps for precision bank shots)
          if (r === 0) {
            cell = c % 2 === 0 ? 3 : 0; // Gap teeth
          } else if (r === 1) {
            cell = (c === 5 || c === 6) ? 7 : 2;
          } else if (r === 2) {
            cell = c % 3 === 0 ? 0 : 1;
          } else {
            cell = (r + c) % 2 === 0 ? 1 : 2;
          }
          if (r === 1 && (c === 3 || c === 8)) cell = 6;
          break;

        case 2: // Walls & Corridors (Unbreakable pillars dividing playing field into 3 narrow chutes)
          if (c === 3 || c === 8) {
            cell = r >= 1 && r <= 4 ? 5 : 0; // Vertical Unbreakable walls
          } else if (c > 3 && c < 8) {
            // Center corridor treasure
            cell = r === 0 ? 7 : r === 1 ? 6 : (r === 2 ? 3 : 2);
          } else {
            // Flanking corridors
            cell = (r % 2 === 0) ? 2 : 1;
          }
          break;

        case 3: // Protected Area / Treasure Vault (Unbreakable wall bunker around Bonus & Powerup bricks)
          const inVault = r >= 1 && r <= 3 && c >= 4 && c <= 7;
          const isVaultWall = (r === 1 || r === 3) && (c === 4 || c === 7);
          const isVaultDoor = r === 3 && (c === 5 || c === 6); // open door
          if (isVaultWall) {
            cell = 5; // Unbreakable bunker pillars
          } else if (inVault && !isVaultDoor) {
            cell = (c === 5 || c === 6) ? 7 : 6; // Treasure core
          } else {
            cell = (r + c) % 3 === 0 ? 3 : ((r % 2 === 0) ? 2 : 1);
          }
          break;

        case 4: // Stepped Pyramid / Ziggurat
          const distFromCtr = Math.abs(c - (cols - 1) / 2);
          if (distFromCtr <= r + 0.5) {
            if (distFromCtr === 0 && r === 0) cell = 7; // Apex bonus star
            else if (r <= 2) cell = 3;
            else if (r <= 4) cell = 2;
            else cell = 1;
            if (distFromCtr === 1 && r === 1) cell = 6;
          }
          break;

        case 5: // Diamond Medallion with concentric rings
          const dX = Math.abs(c - 5.5);
          const dY = Math.abs(r - 2.5);
          if (dX + dY <= 4.2) {
            if (dX + dY <= 1) cell = 7; // Bonus core
            else if (dX + dY <= 2.2) cell = 6; // Powerup ring
            else if (dX + dY <= 3.2) cell = 3; // Very Strong
            else cell = (c === 0 || c === cols - 1) ? 5 : 2;
          }
          break;

        case 6: // Royal Crown (Unbreakable golden rim with jewel spires)
          if (r === 3) {
            cell = 5; // Unbreakable golden band
          } else if (r < 3) {
            if (c === 1 || c === 5 || c === 6 || c === 10) {
              cell = r === 0 ? 7 : (r === 1 ? 6 : 3); // Spire jewels
            } else if (r === 2 && (c === 3 || c === 8)) {
              cell = 2;
            }
          } else {
            cell = (c % 2 === 0) ? 1 : 2;
          }
          break;

        case 7: // Hourglass Chambers (Upper & Lower chambers connected by narrow choke point)
          const hDiff = Math.abs(c - 5.5);
          if (hDiff >= Math.abs(r - 2.5) - 0.2) {
            if (r === 2 && (c === 5 || c === 6)) cell = 6;
            else if (r === 0 || r === rows - 1) cell = (c === 5 || c === 6) ? 7 : 3;
            else cell = (r % 2 === 0) ? 2 : 1;
          }
          break;

        case 8: // Twin Citadels / Keeps with Bridge
          const inTower1 = c >= 1 && c <= 3;
          const inTower2 = c >= 8 && c <= 10;
          const isBridge = r === 1 && c >= 4 && c <= 7;
          if (inTower1 || inTower2) {
            cell = (r === 0) ? 5 : (r % 2 === 0 ? 3 : 2);
          } else if (isBridge) {
            cell = (c === 5 || c === 6) ? 7 : 6;
          } else if (r === rows - 1 && c >= 3 && c <= 8) {
            cell = 1;
          }
          break;

        case 9: // Checkerboard Mosaic Lattice with Power Gems
          if ((r + c) % 2 === 0) {
            cell = (r === 0 && (c === 4 || c === 7)) ? 7 : 2;
          } else if (r === 1 && (c === 3 || c === 8)) {
            cell = 6;
          } else if (r < 4) {
            cell = 1;
          }
          break;

        case 10: // Cross of Honor / Star of Yesra
          const isCenterCross = (c === 5 || c === 6) || (r === 2 || r === 3);
          if (isCenterCross) {
            if ((c === 5 || c === 6) && (r === 2 || r === 3)) cell = 7;
            else cell = (r === 0 || r === rows - 1) ? 5 : 3;
          } else if ((c === 2 && r === 1) || (c === 9 && r === 1)) {
            cell = 6;
          } else {
            cell = (r + c) % 2 === 0 ? 1 : 2;
          }
          break;

        case 11: // Chevron Arrowhead (Precision flight vector)
          if (Math.abs(c - 5.5) <= r + 0.5) {
            if (c === 5 || c === 6) cell = r === 0 ? 7 : 6;
            else cell = (r % 2 === 0) ? 3 : 2;
          }
          break;

        case 12: // Triple Towers with Arrowslits
          if (c % 4 < 2) {
            cell = r === 0 ? 5 : ((r + c) % 2 === 0 ? 3 : 2);
          } else if (r === 1) {
            cell = (c === 3 || c === 7) ? 6 : 0;
          } else if (r === 2 && c === 5) {
            cell = 7;
          }
          break;

        case 13: // Labyrinth Maze (Alternating baffles requiring precision ricochets)
          if ((r === 1 && c <= 8) || (r === 3 && c >= 3)) {
            cell = 5; // Unbreakable maze walls
          } else if (r === 0) {
            cell = (c === 10) ? 7 : 2;
          } else if (r === 2) {
            cell = (c === 1) ? 6 : 3;
          } else {
            cell = 1;
          }
          break;

        case 14: // Letter / Sigil 'Y' for Yesra
          const isYStem = (c === 5 || c === 6) && r >= 3;
          const isYLeftArm = c === r && r < 3;
          const isYRightArm = c === (cols - 1 - r) && r < 3;
          if (isYStem || isYLeftArm || isYRightArm) {
            cell = (r === 0) ? 7 : 3;
          } else if ((r === 1 && (c === 3 || c === 8))) {
            cell = 6;
          } else if (r >= 2) {
            cell = (r + c) % 2 === 0 ? 2 : 1;
          }
          break;

        case 15: // Colonnade of Spires
          if (c % 3 !== 1) {
            cell = r === 0 ? 5 : (r % 3 === 0 ? 3 : 2);
          } else if (r === 0) {
            cell = (c === 4 || c === 7) ? 7 : 6;
          }
          break;

        case 16: // Wave & Sine Ripple
          const sPeak = Math.sin((c / cols) * Math.PI * 2);
          if (Math.abs(r - (2.5 + sPeak * 1.8)) < 1.3) {
            cell = (c === 3 || c === 9) ? 6 : ((c === 6) ? 7 : 2);
          } else if (r === rows - 1) {
            cell = 1;
          }
          break;

        case 17: // Fortified Royal Citadel
          if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
            cell = (r === 0 && (c === 5 || c === 6)) ? 7 : 5;
          } else if (r === 2 && (c === 4 || c === 7)) {
            cell = 6;
          } else {
            cell = (r % 2 === 0) ? 3 : 2;
          }
          break;
      }

      // Upgrade durability based on stage progression / difficulty
      if (cell === 1 && rnd < difficulty * 0.4) cell = 2; // Normal -> Strong
      if (cell === 2 && rnd < difficulty * 0.3) cell = 3; // Strong -> Very Strong
      if (cell === 3 && rnd < difficulty * 0.25) cell = 4; // Very Strong -> Reinforced

      // Sprinkle guaranteed Powerup & Bonus brick if stage has none
      if (cell === 2 && r === 1 && c === 6 && rnd < 0.3) cell = 6;

      // Sprinkle delicate crystalline Glass Tiles (cell 8)
      if (cell === 1 && rnd > 0.75 && rnd < 0.90) cell = 8;
      if (cell === 2 && (r === 0 || r === rows - 1) && rnd > 0.85) cell = 8;

      row.push(cell);
    }
    grid.push(row);
  }

  // Generate 'Nain spawns (2 to 5 nains depending on level progression)
  const nainCount = Math.min(5, 2 + Math.floor((lvlIndex % 100) / 24));
  const nainSpawns: LevelConfig['nainSpawns'] = [];
  const step = 650 / (nainCount + 1);

  for (let i = 0; i < nainCount; i++) {
    const xRnd = seededRandom(lvlIndex * 77 + i * 19);
    const xPos = 80 + (i + 1) * step + (xRnd - 0.5) * 30;
    let hatType: 'red' | 'green' | 'blue' | 'gold' = i % 3 === 0 ? 'red' : i % 3 === 1 ? 'green' : 'blue';
    if ((lvlIndex + 1) % 25 === 0 && i === 0) {
      hatType = 'gold';
    } else if (difficulty > 0.6 && i === nainCount - 1 && xRnd < 0.35) {
      hatType = 'gold';
    }
    const color = hatType === 'red' ? '#ef4444' : hatType === 'green' ? '#10b981' : hatType === 'blue' ? '#3b82f6' : '#fbbf24';
    nainSpawns.push({
      x: Math.round(xPos),
      y: 42 + (i % 2) * 20,
      hatType,
      color,
    });
  }

  return { grid, nainSpawns };
}

// Generate LevelConfig dynamically or pre-cache on demand
export const LEVELS: LevelConfig[] = Array.from({ length: TOTAL_LEVELS }, (_, idx) => {
  const { grid, nainSpawns } = generateLevelGrid(idx);
  return {
    name: getLevelName(idx),
    brickWidth: 50,
    brickHeight: 20,
    gap: 6,
    offsetX: 65,
    offsetY: 70,
    grid,
    nainSpawns,
  };
});
