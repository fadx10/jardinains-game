export interface HighScoreEntry {
  id?: string;
  name: string;
  score: number;
  level: number;
  nainsJuggled: number;
  date: string;
}

export interface GameOptions {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
}
