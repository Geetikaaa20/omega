export type GameType = 'snake' | 'breakout' | 'runner' | 'tetris' | 'cakemaker';

export interface HighScores {
  snake: number;
  breakout: number;
  runner: number;
  tetris: number;
  cakemaker: number;
}

export type GameDifficulty = 'easy' | 'normal' | 'hard';

export interface GameIdea {
  id: string;
  title: string;
  category: 'Arcade' | 'Physics' | 'Puzzle' | 'Platformer' | 'Action';
  originalInspiration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  coreMechanic: string;
  modernTwists: string[];
  mathAndLogic: string[];
  browserAdvantage: string;
  playableInApp?: GameType;
  iconName: string;
}

export type ControlInput = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'ACTION_A' | 'ACTION_B' | 'PAUSE' | 'RESET';
