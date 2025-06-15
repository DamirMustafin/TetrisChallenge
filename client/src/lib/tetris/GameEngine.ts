import { GameState, Position, TetrominoShape, GameStats } from './types';
import { GameBoard, BOARD_WIDTH } from './GameBoard';
import { getRandomTetromino, rotateTetromino } from './Tetromino';
import { SoundManager } from './SoundManager';

export class GameEngine {
  private gameState: GameState;
  private gameBoard: GameBoard;
  private soundManager: SoundManager;
  private dropTimer: number = 0;
  private dropInterval: number = 800; // milliseconds
  private lastTime: number = 0;
  private animationId: number | null = null;
  private onStateChange?: (state: GameState) => void;

  constructor() {
    this.gameBoard = new GameBoard();
    this.soundManager = new SoundManager();
    this.gameState = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      board: this.gameBoard.board,
      currentPiece: null,
      nextPiece: getRandomTetromino(),
      holdPiece: null,
      canHold: true,
      score: 0,
      lines: 0,
      level: 1,
      combo: 0,
      gameOver: false,
      paused: false
    };
  }

  setStateChangeCallback(callback: (state: GameState) => void): void {
    this.onStateChange = callback;
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.gameState });
    }
  }

  start(): void {
    this.gameState = this.createInitialState();
    this.gameBoard.reset();
    this.spawnNewPiece();
    this.dropTimer = 0;
    this.lastTime = performance.now();
    this.soundManager.playBackground();
    this.gameLoop();
    this.notifyStateChange();
  }

  pause(): void {
    this.gameState.paused = !this.gameState.paused;
    if (this.gameState.paused) {
      this.soundManager.stopBackground();
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    } else {
      this.soundManager.playBackground();
      this.lastTime = performance.now();
      this.gameLoop();
    }
    this.notifyStateChange();
  }

  stop(): void {
    this.gameState.gameOver = true;
    this.soundManager.stopBackground();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.notifyStateChange();
  }

  private gameLoop = (): void => {
    if (this.gameState.gameOver || this.gameState.paused) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.dropTimer += deltaTime;

    if (this.dropTimer >= this.dropInterval) {
      this.moveDown();
      this.dropTimer = 0;
    }

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private spawnNewPiece(): void {
    if (!this.gameState.nextPiece) {
      this.gameState.nextPiece = getRandomTetromino();
    }

    const newPiece = this.gameState.nextPiece;
    this.gameState.nextPiece = getRandomTetromino();
    this.gameState.canHold = true;

    const startX = Math.floor((BOARD_WIDTH - newPiece.blocks[0].length) / 2);
    const startY = -1;

    this.gameState.currentPiece = {
      shape: newPiece,
      position: { x: startX, y: startY },
      rotation: 0
    };

    // Check if the piece can be placed
    if (!this.gameBoard.isValidPosition(newPiece, { x: startX, y: startY }, 0)) {
      this.stop();
      return;
    }

    this.notifyStateChange();
  }

  moveLeft(): void {
    if (!this.gameState.currentPiece || this.gameState.gameOver || this.gameState.paused) return;

    const newPosition = {
      x: this.gameState.currentPiece.position.x - 1,
      y: this.gameState.currentPiece.position.y
    };

    if (this.gameBoard.isValidPosition(this.gameState.currentPiece.shape, newPosition, this.gameState.currentPiece.rotation)) {
      this.gameState.currentPiece.position = newPosition;
      this.notifyStateChange();
    }
  }

  moveRight(): void {
    if (!this.gameState.currentPiece || this.gameState.gameOver || this.gameState.paused) return;

    const newPosition = {
      x: this.gameState.currentPiece.position.x + 1,
      y: this.gameState.currentPiece.position.y
    };

    if (this.gameBoard.isValidPosition(this.gameState.currentPiece.shape, newPosition, this.gameState.currentPiece.rotation)) {
      this.gameState.currentPiece.position = newPosition;
      this.notifyStateChange();
    }
  }

  moveDown(): void {
    if (!this.gameState.currentPiece || this.gameState.gameOver || this.gameState.paused) return;

    const newPosition = {
      x: this.gameState.currentPiece.position.x,
      y: this.gameState.currentPiece.position.y + 1
    };

    if (this.gameBoard.isValidPosition(this.gameState.currentPiece.shape, newPosition, this.gameState.currentPiece.rotation)) {
      this.gameState.currentPiece.position = newPosition;
      this.notifyStateChange();
    } else {
      this.placePiece();
    }
  }

  hardDrop(): void {
    if (!this.gameState.currentPiece || this.gameState.gameOver || this.gameState.paused) return;

    let dropDistance = 0;
    while (this.gameBoard.isValidPosition(
      this.gameState.currentPiece.shape,
      {
        x: this.gameState.currentPiece.position.x,
        y: this.gameState.currentPiece.position.y + dropDistance + 1
      },
      this.gameState.currentPiece.rotation
    )) {
      dropDistance++;
    }

    this.gameState.currentPiece.position.y += dropDistance;
    this.gameState.score += dropDistance * 2; // Bonus points for hard drop
    this.placePiece();
  }

  rotate(): void {
    if (!this.gameState.currentPiece || this.gameState.gameOver || this.gameState.paused) return;

    const newRotation = (this.gameState.currentPiece.rotation + 1) % 4;

    if (this.gameBoard.isValidPosition(this.gameState.currentPiece.shape, this.gameState.currentPiece.position, newRotation)) {
      this.gameState.currentPiece.rotation = newRotation;
      this.notifyStateChange();
    }
  }

  hold(): void {
    if (!this.gameState.canHold || !this.gameState.currentPiece || this.gameState.gameOver || this.gameState.paused) return;

    if (!this.gameState.holdPiece) {
      this.gameState.holdPiece = this.gameState.currentPiece.shape;
      this.spawnNewPiece();
    } else {
      const temp = this.gameState.holdPiece;
      this.gameState.holdPiece = this.gameState.currentPiece.shape;
      
      const startX = Math.floor((BOARD_WIDTH - temp.blocks[0].length) / 2);
      this.gameState.currentPiece = {
        shape: temp,
        position: { x: startX, y: -1 },
        rotation: 0
      };
    }

    this.gameState.canHold = false;
    this.notifyStateChange();
  }

  private placePiece(): void {
    if (!this.gameState.currentPiece) return;

    this.gameBoard.placePiece(
      this.gameState.currentPiece.shape,
      this.gameState.currentPiece.position,
      this.gameState.currentPiece.rotation
    );

    this.soundManager.playHit();

    const linesCleared = this.gameBoard.clearLines();
    
    if (linesCleared > 0) {
      this.gameState.lines += linesCleared;
      this.gameState.combo++;
      
      // Score calculation
      const baseScore = [0, 100, 300, 500, 800][linesCleared] || 0;
      const levelMultiplier = this.gameState.level;
      const comboBonus = this.gameState.combo > 1 ? (this.gameState.combo - 1) * 50 : 0;
      
      this.gameState.score += (baseScore * levelMultiplier) + comboBonus;
      
      // Level progression
      this.gameState.level = Math.floor(this.gameState.lines / 10) + 1;
      this.dropInterval = Math.max(50, 800 - (this.gameState.level - 1) * 50);
      
      this.soundManager.playSuccess();
    } else {
      this.gameState.combo = 0;
    }

    if (this.gameBoard.isGameOver()) {
      this.stop();
      return;
    }

    this.spawnNewPiece();
  }

  getStats(): GameStats {
    return {
      score: this.gameState.score,
      lines: this.gameState.lines,
      level: this.gameState.level,
      combo: this.gameState.combo
    };
  }

  toggleMute(): void {
    this.soundManager.toggleMute();
  }

  isMuted(): boolean {
    return this.soundManager.isMuted();
  }

  getCurrentState(): GameState {
    return { ...this.gameState };
  }
}
