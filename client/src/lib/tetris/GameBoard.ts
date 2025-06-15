import { Position, TetrominoShape } from './types';
import { rotateTetromino } from './Tetromino';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export class GameBoard {
  board: number[][];

  constructor() {
    this.board = this.createEmptyBoard();
  }

  createEmptyBoard(): number[][] {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0));
  }

  isValidPosition(shape: TetrominoShape, position: Position, rotation: number): boolean {
    const rotatedShape = rotateTetromino(shape, rotation);
    
    for (let y = 0; y < rotatedShape.length; y++) {
      for (let x = 0; x < rotatedShape[y].length; x++) {
        if (rotatedShape[y][x]) {
          const boardX = position.x + x;
          const boardY = position.y + y;
          
          // Check bounds
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
            return false;
          }
          
          // Check collision with existing blocks (but allow negative Y for spawning)
          if (boardY >= 0 && this.board[boardY][boardX]) {
            return false;
          }
        }
      }
    }
    
    return true;
  }

  placePiece(shape: TetrominoShape, position: Position, rotation: number): void {
    const rotatedShape = rotateTetromino(shape, rotation);
    
    for (let y = 0; y < rotatedShape.length; y++) {
      for (let x = 0; x < rotatedShape[y].length; x++) {
        if (rotatedShape[y][x]) {
          const boardX = position.x + x;
          const boardY = position.y + y;
          
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            this.board[boardY][boardX] = 1;
          }
        }
      }
    }
  }

  clearLines(): number {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every(cell => cell === 1)) {
        // Remove the line
        this.board.splice(y, 1);
        // Add new empty line at top
        this.board.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Check the same line again since we removed one
      }
    }
    
    return linesCleared;
  }

  isGameOver(): boolean {
    // Check if any blocks are in the top two rows
    return this.board[0].some(cell => cell === 1) || this.board[1].some(cell => cell === 1);
  }

  reset(): void {
    this.board = this.createEmptyBoard();
  }
}
