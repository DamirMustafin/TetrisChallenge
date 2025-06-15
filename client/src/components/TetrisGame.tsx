import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../lib/tetris/GameEngine';
import { GameState, TetrominoShape } from '../lib/tetris/types';
import { rotateTetromino, TETROMINO_SHAPES } from '../lib/tetris/Tetromino';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../lib/tetris/GameBoard';

const CELL_SIZE = 30;
const BOARD_PADDING = 2;



interface TetrisGameProps {}

const TetrisGame: React.FC<TetrisGameProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  // Initialize game engine
  useEffect(() => {
    gameEngineRef.current = new GameEngine();
    gameEngineRef.current.setStateChangeCallback(setGameState);
    
    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, []);

  // Keyboard controls
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameEngineRef.current || !isStarted) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        gameEngineRef.current.moveLeft();
        break;
      case 'ArrowRight':
        event.preventDefault();
        gameEngineRef.current.moveRight();
        break;
      case 'ArrowDown':
        event.preventDefault();
        gameEngineRef.current.moveDown();
        break;
      case 'ArrowUp':
        event.preventDefault();
        gameEngineRef.current.rotate();
        break;
      case ' ':
        event.preventDefault();
        gameEngineRef.current.hardDrop();
        break;
      case 'c':
      case 'C':
        event.preventDefault();
        gameEngineRef.current.hold();
        break;
      case 'p':
      case 'P':
        event.preventDefault();
        gameEngineRef.current.pause();
        break;
      case 'm':
      case 'M':
        event.preventDefault();
        gameEngineRef.current.toggleMute();
        break;
    }
  }, [isStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Canvas drawing
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('Drawing canvas with game state:', gameState.board);

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board background
    const boardStartX = 50;
    const boardStartY = 50;
    
    ctx.fillStyle = '#16213e';
    ctx.fillRect(
      boardStartX - BOARD_PADDING,
      boardStartY - BOARD_PADDING,
      BOARD_WIDTH * CELL_SIZE + BOARD_PADDING * 2,
      BOARD_HEIGHT * CELL_SIZE + BOARD_PADDING * 2
    );

    // Draw grid lines
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(boardStartX + x * CELL_SIZE, boardStartY);
      ctx.lineTo(boardStartX + x * CELL_SIZE, boardStartY + BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(boardStartX, boardStartY + y * CELL_SIZE);
      ctx.lineTo(boardStartX + BOARD_WIDTH * CELL_SIZE, boardStartY + y * CELL_SIZE);
      ctx.stroke();
    }

    // Draw placed blocks
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (gameState.board[y][x] === 1) {
          // Use a solid color for placed blocks
          ctx.fillStyle = '#888888';
          ctx.fillRect(
            boardStartX + x * CELL_SIZE + 1,
            boardStartY + y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
          );
          
          // Add white border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            boardStartX + x * CELL_SIZE + 1,
            boardStartY + y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
          );
        }
      }
    }

    // Draw current piece
    if (gameState.currentPiece) {
      const piece = gameState.currentPiece;
      const rotatedShape = rotateTetromino(piece.shape, piece.rotation);
      
      ctx.fillStyle = piece.shape.color;
      
      for (let y = 0; y < rotatedShape.length; y++) {
        for (let x = 0; x < rotatedShape[y].length; x++) {
          if (rotatedShape[y][x]) {
            const blockX = piece.position.x + x;
            const blockY = piece.position.y + y;
            
            if (blockY >= 0) {
              ctx.fillRect(
                boardStartX + blockX * CELL_SIZE + 1,
                boardStartY + blockY * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
              );
              
              // Add border for current piece
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.strokeRect(
                boardStartX + blockX * CELL_SIZE + 1,
                boardStartY + blockY * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
              );
            }
          }
        }
      }
    }

    // Draw next piece preview
    if (gameState.nextPiece) {
      const nextStartX = boardStartX + BOARD_WIDTH * CELL_SIZE + 40;
      const nextStartY = boardStartY;
      
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(nextStartX - 5, nextStartY - 5, 130, 90);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('NEXT', nextStartX, nextStartY - 10);
      
      ctx.fillStyle = gameState.nextPiece.color;
      const nextShape = gameState.nextPiece.blocks;
      
      for (let y = 0; y < nextShape.length; y++) {
        for (let x = 0; x < nextShape[y].length; x++) {
          if (nextShape[y][x]) {
            ctx.fillRect(
              nextStartX + x * 20 + 10,
              nextStartY + y * 20 + 10,
              18,
              18
            );
          }
        }
      }
    }

    // Draw hold piece
    if (gameState.holdPiece) {
      const holdStartX = boardStartX + BOARD_WIDTH * CELL_SIZE + 40;
      const holdStartY = boardStartY + 120;
      
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(holdStartX - 5, holdStartY - 5, 130, 90);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('HOLD', holdStartX, holdStartY - 10);
      
      ctx.fillStyle = gameState.canHold ? gameState.holdPiece.color : '#666666';
      const holdShape = gameState.holdPiece.blocks;
      
      for (let y = 0; y < holdShape.length; y++) {
        for (let x = 0; x < holdShape[y].length; x++) {
          if (holdShape[y][x]) {
            ctx.fillRect(
              holdStartX + x * 20 + 10,
              holdStartY + y * 20 + 10,
              18,
              18
            );
          }
        }
      }
    }

    // Draw game stats
    const statsStartX = boardStartX + BOARD_WIDTH * CELL_SIZE + 40;
    const statsStartY = boardStartY + 240;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, sans-serif';
    
    ctx.fillText(`SCORE`, statsStartX, statsStartY);
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`${gameState.score}`, statsStartX, statsStartY + 20);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`LINES`, statsStartX, statsStartY + 50);
    ctx.fillStyle = '#00f5ff';
    ctx.fillText(`${gameState.lines}`, statsStartX, statsStartY + 70);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`LEVEL`, statsStartX, statsStartY + 100);
    ctx.fillStyle = '#ffed4e';
    ctx.fillText(`${gameState.level}`, statsStartX, statsStartY + 120);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`COMBO`, statsStartX, statsStartY + 150);
    ctx.fillStyle = '#ad00ff';
    ctx.fillText(`${gameState.combo}`, statsStartX, statsStartY + 170);

  }, [gameState]);

  const startGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.start();
      setIsStarted(true);
    }
  };

  const resetGame = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
      setIsStarted(false);
    }
  };

  const togglePause = () => {
    if (gameEngineRef.current && isStarted) {
      gameEngineRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.toggleMute();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white text-center mb-2">TETRIS</h1>
        
        {!isStarted && (
          <div className="text-center">
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
            >
              START GAME
            </button>
          </div>
        )}
        
        {isStarted && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={togglePause}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {gameState?.paused ? 'RESUME' : 'PAUSE'}
            </button>
            <button
              onClick={resetGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              RESET
            </button>
            <button
              onClick={toggleMute}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {gameEngineRef.current?.isMuted() ? 'UNMUTE' : 'MUTE'}
            </button>
          </div>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={500}
        height={700}
        className="border-2 border-gray-600 rounded-lg shadow-2xl bg-gray-800"
        style={{ imageRendering: 'pixelated' }}
      />

      {isStarted && (
        <div className="mt-4 text-white text-center">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Arrow Keys:</strong> Move/Rotate</p>
              <p><strong>Space:</strong> Hard Drop</p>
            </div>
            <div>
              <p><strong>C:</strong> Hold Piece</p>
              <p><strong>P:</strong> Pause</p>
            </div>
          </div>
        </div>
      )}

      {gameState?.gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center text-white">
            <h2 className="text-3xl font-bold mb-4 text-red-400">GAME OVER</h2>
            <p className="text-xl mb-2">Final Score: {gameState.score}</p>
            <p className="text-lg mb-4">Lines Cleared: {gameState.lines}</p>
            <button
              onClick={startGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {gameState?.paused && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-lg text-center text-white">
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">PAUSED</h2>
            <p className="text-lg mb-4">Press P to resume</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TetrisGame;
