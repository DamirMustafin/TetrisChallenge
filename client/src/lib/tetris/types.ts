export interface Position {
  x: number;
  y: number;
}

export interface TetrominoShape {
  name: string;
  color: string;
  blocks: number[][];
  rotations: number[][][];
}

export interface GameState {
  board: number[][];
  currentPiece: {
    shape: TetrominoShape;
    position: Position;
    rotation: number;
  } | null;
  nextPiece: TetrominoShape | null;
  holdPiece: TetrominoShape | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  combo: number;
  gameOver: boolean;
  paused: boolean;
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  combo: number;
}
