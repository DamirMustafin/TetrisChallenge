import { TetrominoShape } from './types';

export const TETROMINO_SHAPES: { [key: string]: TetrominoShape } = {
  I: {
    name: 'I',
    color: '#00f5ff',
    blocks: [
      [1, 1, 1, 1]
    ],
    rotations: [
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]],
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]]
    ]
  },
  O: {
    name: 'O',
    color: '#ffed4e',
    blocks: [
      [1, 1],
      [1, 1]
    ],
    rotations: [
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]],
      [[1, 1], [1, 1]]
    ]
  },
  T: {
    name: 'T',
    color: '#ad00ff',
    blocks: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    rotations: [
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0], [1, 1], [1, 0]],
      [[1, 1, 1], [0, 1, 0]],
      [[0, 1], [1, 1], [0, 1]]
    ]
  },
  S: {
    name: 'S',
    color: '#4ade80',
    blocks: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    rotations: [
      [[0, 1, 1], [1, 1, 0]],
      [[1, 0], [1, 1], [0, 1]],
      [[0, 1, 1], [1, 1, 0]],
      [[1, 0], [1, 1], [0, 1]]
    ]
  },
  Z: {
    name: 'Z',
    color: '#ef4444',
    blocks: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    rotations: [
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1], [1, 1], [1, 0]],
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1], [1, 1], [1, 0]]
    ]
  },
  J: {
    name: 'J',
    color: '#3b82f6',
    blocks: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    rotations: [
      [[1, 0, 0], [1, 1, 1]],
      [[1, 1], [1, 0], [1, 0]],
      [[1, 1, 1], [0, 0, 1]],
      [[0, 1], [0, 1], [1, 1]]
    ]
  },
  L: {
    name: 'L',
    color: '#f97316',
    blocks: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    rotations: [
      [[0, 0, 1], [1, 1, 1]],
      [[1, 0], [1, 0], [1, 1]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1], [0, 1], [0, 1]]
    ]
  }
};

export function getRandomTetromino(): TetrominoShape {
  const shapes = Object.values(TETROMINO_SHAPES);
  return shapes[Math.floor(Math.random() * shapes.length)];
}

export function rotateTetromino(shape: TetrominoShape, rotation: number): number[][] {
  return shape.rotations[rotation % 4];
}
