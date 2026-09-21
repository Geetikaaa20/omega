import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../utils/sound';
import { RotateCcw, Play, Pause, Sparkles, ArrowDown, RotateCw } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

interface TetrominoDef {
  shape: number[][];
  color: string;
}

const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#06b6d4', // Cyan
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3b82f6', // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f97316', // Orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#eab308', // Yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#10b981', // Emerald
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a855f7', // Purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#ef4444', // Red
  },
};

const TETROMINO_KEYS: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

interface TetrisGameProps {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

export const TetrisGame: React.FC<TetrisGameProps> = ({
  onScoreUpdate,
  highScore,
  onNewHighScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType>('T');
  const [holdPieceType, setHoldPieceType] = useState<TetrominoType | null>(null);

  // Mutable game grid & pieces
  const gridRef = useRef<string[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );

  const currentPieceRef = useRef<{
    type: TetrominoType;
    shape: number[][];
    color: string;
    x: number;
    y: number;
  }>({
    type: 'T',
    shape: TETROMINOES.T.shape,
    color: TETROMINOES.T.color,
    x: 3,
    y: 0,
  });

  const canHoldRef = useRef(true);
  const lastDropTimeRef = useRef(0);
  const animIdRef = useRef<number | null>(null);

  const getRandomPieceType = (): TetrominoType => {
    return TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
  };

  const spawnPiece = useCallback((type?: TetrominoType) => {
    const nextType = type || nextPieceType;
    const def = TETROMINOES[nextType];

    currentPieceRef.current = {
      type: nextType,
      shape: def.shape.map((row) => [...row]),
      color: def.color,
      x: Math.floor((COLS - def.shape[0].length) / 2),
      y: 0,
    };

    setNextPieceType(getRandomPieceType());
    canHoldRef.current = true;

    // Check immediate spawn collision (Game Over)
    if (checkCollision(currentPieceRef.current.x, currentPieceRef.current.y, currentPieceRef.current.shape)) {
      setGameOver(true);
      setIsPlaying(false);
      sound.playGameOver();
    }
  }, [nextPieceType]);

  const checkCollision = (offsetX: number, offsetY: number, shape: number[][]) => {
    const grid = gridRef.current;
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const newX = offsetX + c;
          const newY = offsetY + r;

          if (newX < 0 || newX >= COLS || newY >= ROWS) {
            return true;
          }
          if (newY >= 0 && grid[newY][newX] !== '') {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotateMatrix = (matrix: number[][]) => {
    const N = matrix.length;
    const result: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        result[c][N - 1 - r] = matrix[r][c];
      }
    }
    return result;
  };

  const tryRotate = useCallback(() => {
    const p = currentPieceRef.current;
    const rotated = rotateMatrix(p.shape);

    // Wall kick attempts: offset 0, -1, +1, -2, +2
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!checkCollision(p.x + k, p.y, rotated)) {
        p.x += k;
        p.shape = rotated;
        sound.playRotate();
        return;
      }
    }
  }, []);

  const moveHorizontal = useCallback((dx: number) => {
    const p = currentPieceRef.current;
    if (!checkCollision(p.x + dx, p.y, p.shape)) {
      p.x += dx;
      sound.playBounce();
    }
  }, []);

  const lockPiece = useCallback(() => {
    const p = currentPieceRef.current;
    const grid = gridRef.current;

    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c] !== 0) {
          const gy = p.y + r;
          const gx = p.x + c;
          if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
            grid[gy][gx] = p.color;
          }
        }
      }
    }

    sound.playDrop();

    // Check for cleared lines
    let clearedCount = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r].every((cell) => cell !== '')) {
        grid.splice(r, 1);
        grid.unshift(Array(COLS).fill(''));
        clearedCount++;
        r++; // Recheck same row index after unshift
      }
    }

    if (clearedCount > 0) {
      sound.playVictory();
      const linePoints = [0, 100, 300, 500, 800];
      const pointsGained = (linePoints[clearedCount] || 1000) * level;

      setLines((prev) => {
        const nextLines = prev + clearedCount;
        const newLvl = Math.floor(nextLines / 10) + 1;
        setLevel(newLvl);
        return nextLines;
      });

      setScore((prev) => {
        const updated = prev + pointsGained;
        onScoreUpdate?.(updated);
        if (updated > highScore) onNewHighScore?.(updated);
        return updated;
      });
    }

    spawnPiece();
  }, [level, spawnPiece, highScore, onScoreUpdate, onNewHighScore]);

  const dropOne = useCallback(() => {
    const p = currentPieceRef.current;
    if (!checkCollision(p.x, p.y + 1, p.shape)) {
      p.y += 1;
      return true;
    } else {
      lockPiece();
      return false;
    }
  }, [lockPiece]);

  const hardDrop = useCallback(() => {
    const p = currentPieceRef.current;
    let dropped = 0;
    while (!checkCollision(p.x, p.y + 1, p.shape)) {
      p.y += 1;
      dropped++;
    }
    if (dropped > 0) {
      setScore((s) => s + dropped * 2);
    }
    lockPiece();
  }, [lockPiece]);

  const holdPiece = useCallback(() => {
    if (!canHoldRef.current) return;
    canHoldRef.current = false;
    sound.playRotate();

    const currType = currentPieceRef.current.type;
    if (holdPieceType === null) {
      setHoldPieceType(currType);
      spawnPiece();
    } else {
      const prevHold = holdPieceType;
      setHoldPieceType(currType);
      spawnPiece(prevHold);
    }
  }, [holdPieceType, spawnPiece]);

  const startGame = useCallback(() => {
    gridRef.current = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setHoldPieceType(null);
    setIsPlaying(true);
    setNextPieceType(getRandomPieceType());
    spawnPiece('T');
    sound.playScore();
  }, [spawnPiece]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        moveHorizontal(-1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        moveHorizontal(1);
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        tryRotate();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        dropOne();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (!isPlaying || gameOver) {
          startGame();
        } else {
          hardDrop();
        }
      } else if (['KeyC', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        e.preventDefault();
        holdPiece();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, moveHorizontal, tryRotate, dropOne, hardDrop, holdPiece, startGame]);

  // Calculate Ghost Piece position (where piece lands)
  const getGhostY = () => {
    const p = currentPieceRef.current;
    let ghostY = p.y;
    while (!checkCollision(p.x, ghostY + 1, p.shape)) {
      ghostY++;
    }
    return ghostY;
  };

  // Main Loop
  useEffect(() => {
    const loop = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dropSpeed = Math.max(120, 800 - (level - 1) * 70);

      if (isPlaying && !isPaused && !gameOver) {
        if (time - lastDropTimeRef.current > dropSpeed) {
          lastDropTimeRef.current = time;
          dropOne();
        }
      }

      // --- RENDERING ---
      const cellW = canvas.width / COLS;
      const cellH = canvas.height / ROWS;

      // Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid guides
      ctx.strokeStyle = '#172033';
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellW, 0);
        ctx.lineTo(c * cellW, canvas.height);
        ctx.stroke();
      }
      for (let r = 0; r <= ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * cellH);
        ctx.lineTo(canvas.width, r * cellH);
        ctx.stroke();
      }

      // Draw Settled Grid Blocks
      const grid = gridRef.current;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const color = grid[r][c];
          if (color) {
            ctx.save();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2, 3);
            ctx.fill();

            // Bevel highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(c * cellW + 2, r * cellH + 2, cellW - 4, 3);
            ctx.restore();
          }
        }
      }

      // Draw Ghost Piece Projection
      if (isPlaying && !gameOver) {
        const p = currentPieceRef.current;
        const ghostY = getGhostY();
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        for (let r = 0; r < p.shape.length; r++) {
          for (let c = 0; c < p.shape[r].length; c++) {
            if (p.shape[r][c] !== 0) {
              const gx = (p.x + c) * cellW;
              const gy = (ghostY + r) * cellH;
              ctx.strokeRect(gx + 1, gy + 1, cellW - 2, cellH - 2);
              ctx.fillRect(gx + 1, gy + 1, cellW - 2, cellH - 2);
            }
          }
        }
        ctx.restore();

        // Draw Active Falling Piece
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        for (let r = 0; r < p.shape.length; r++) {
          for (let c = 0; c < p.shape[r].length; c++) {
            if (p.shape[r][c] !== 0) {
              const px = (p.x + c) * cellW;
              const py = (p.y + r) * cellH;
              ctx.beginPath();
              ctx.roundRect(px + 1, py + 1, cellW - 2, cellH - 2, 3);
              ctx.fill();

              // Highlight top edge
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.fillRect(px + 2, py + 2, cellW - 4, 3);
              ctx.fillStyle = p.color;
            }
          }
        }
        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isPlaying, isPaused, gameOver, level, dropOne]);

  return (
    <div id="tetris-game-container" className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase text-slate-400 font-semibold">Score:</span>
            <span className="font-arcade text-amber-400 text-lg arcade-glow">{score}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase text-slate-400 font-semibold">Lines:</span>
            <span className="font-arcade text-cyan-400 text-sm">{lines}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase text-slate-400 font-semibold">Best:</span>
          <span className="font-arcade text-emerald-400 text-sm">{highScore}</span>
        </div>
      </div>

      {/* Main play layout with Side Panels */}
      <div className="flex items-start justify-center gap-3 w-full">
        {/* Left Side: Hold Slot */}
        <div className="hidden sm:flex flex-col items-center gap-1 w-20 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HOLD</span>
          <div className="w-14 h-14 flex items-center justify-center bg-slate-950 rounded border border-slate-800">
            {holdPieceType ? (
              <span
                className="font-arcade text-sm font-bold"
                style={{ color: TETROMINOES[holdPieceType].color }}
              >
                {holdPieceType}
              </span>
            ) : (
              <span className="text-xs text-slate-600">-</span>
            )}
          </div>
          <button
            onClick={holdPiece}
            className="w-full mt-1 text-[10px] py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold"
          >
            HOLD (C)
          </button>
        </div>

        {/* Center Canvas */}
        <div className="relative w-full max-w-[280px] aspect-[10/20] rounded-xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl neon-border-amber">
          <canvas
            ref={canvasRef}
            width={280}
            height={560}
            className="w-full h-full block crt-effect"
          />

          {/* Start / Game Over Overlay */}
          {(!isPlaying || gameOver) && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30">
              {gameOver ? (
                <>
                  <h3 className="font-arcade text-rose-500 text-xl mb-2">GAME OVER</h3>
                  <p className="text-slate-300 text-xs mb-3">Matrix topped out!</p>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 mb-4">
                    <div className="text-[10px] text-slate-400">Final Score</div>
                    <div className="font-arcade text-amber-400 text-xl mt-1">{score}</div>
                  </div>
                  <button
                    id="tetris-restart-button"
                    onClick={startGame}
                    className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                    RETRY
                  </button>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-arcade text-cyan-400 text-lg mb-2">TETROMINO MATRIX</h3>
                  <p className="text-slate-400 text-xs max-w-xs mb-4">
                    Rotate & stack falling blocks. Fill rows to clear lines!
                  </p>
                  <button
                    id="tetris-start-button"
                    onClick={startGame}
                    className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    PLAY NOW
                  </button>
                  <p className="text-slate-500 text-[10px] mt-3">
                    Arrow keys to move, Up to rotate, Space to hard-drop
                  </p>
                </>
              )}
            </div>
          )}

          {/* Pause Overlay */}
          {isPlaying && isPaused && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center z-30">
              <h3 className="font-arcade text-amber-400 text-xl mb-4">PAUSED</h3>
              <button
                onClick={() => setIsPaused(false)}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                RESUME
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Next Piece & Stats */}
        <div className="hidden sm:flex flex-col items-center gap-2 w-20 p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NEXT</span>
          <div className="w-14 h-14 flex items-center justify-center bg-slate-950 rounded border border-slate-800">
            <span
              className="font-arcade text-sm font-bold"
              style={{ color: TETROMINOES[nextPieceType].color }}
            >
              {nextPieceType}
            </span>
          </div>

          <div className="w-full mt-2 pt-2 border-t border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">LEVEL</div>
            <div className="font-arcade text-cyan-400 text-sm">{level}</div>
          </div>
        </div>
      </div>

      {/* Mobile Touch Action Bar */}
      <div className="mt-3 flex flex-col items-center gap-2 w-full max-w-[320px] md:hidden select-none">
        <div className="flex gap-2">
          <button
            onClick={() => moveHorizontal(-1)}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-cyan-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700"
          >
            ◀
          </button>
          <button
            onClick={tryRotate}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-cyan-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => moveHorizontal(1)}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-cyan-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700"
          >
            ▶
          </button>
          <button
            onClick={dropOne}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-cyan-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            onClick={hardDrop}
            className="px-3 h-12 rounded-lg bg-amber-500 active:bg-amber-400 text-slate-950 font-arcade text-xs font-bold"
          >
            DROP
          </button>
        </div>
      </div>
    </div>
  );
};
