
export interface GameObject {
  x: number;
  y: number;
  id: number;
}

export interface Invader extends GameObject {
  type: 'A' | 'B' | 'C';
}

export type GameStatus = 'START_SCREEN' | 'PLAYING' | 'GAME_OVER' | 'WIN';
