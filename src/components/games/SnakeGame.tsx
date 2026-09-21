import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../utils/sound';
import { RotateCcw, Play, Pause, Zap, Shield, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Food extends Point {
  type: 'apple' | 'star' | 'berry';
  points: number;
  color: string;
  expiresAt?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

interface SnakeGameProps {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

const GRID_SIZE = 22;

export const SnakeGame: React.FC<SnakeGameProps> = ({
  onScoreUpdate,
  highScore,
  onNewHighScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wrapMode, setWrapMode] = useState(true);
  const [speedLevel, setSpeedLevel] = useState<'slow' | 'normal' | 'fast'>('normal');

  // Game internal mutable state
  const snakeRef = useRef<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Food>({ x: 15, y: 10, type: 'apple', points: 10, color: '#ef4444' });
  const bonusFoodRef = useRef<Food | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastStepTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const comboRef = useRef<number>(0);

  const getStepInterval = () => {
    switch (speedLevel) {
      case 'slow': return 130;
      case 'fast': return 65;
      default: return 90;
    }
  };

  const spawnFood = useCallback((excludePoints: Point[]): Food => {
    const isSpecial = Math.random() < 0.25;
    let newX = Math.floor(Math.random() * GRID_SIZE);
    let newY = Math.floor(Math.random() * GRID_SIZE);

    let attempts = 0;
    while (excludePoints.some((p) => p.x === newX && p.y === newY) && attempts < 100) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      attempts++;
    }

    if (isSpecial) {
      const isStar = Math.random() > 0.5;
      return {
        x: newX,
        y: newY,
        type: isStar ? 'star' : 'berry',
        points: isStar ? 50 : 30,
        color: isStar ? '#eab308' : '#a855f7',
        expiresAt: Date.now() + 7000,
      };
    }

    return {
      x: newX,
      y: newY,
      type: 'apple',
      points: 10,
      color: '#ef4444',
    };
  }, []);

  const createParticles = (x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x: x * 20 + 10,
        y: y * 20 + 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1,
        maxLife: 20 + Math.random() * 15,
        size: Math.random() * 4 + 2,
      });
    }
  };

  const resetGame = useCallback(() => {
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    particlesRef.current = [];
    bonusFoodRef.current = null;
    foodRef.current = { x: 16, y: 10, type: 'apple', points: 10, color: '#ef4444' };
    comboRef.current = 0;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    sound.playScore();
  }, []);

  const handleDirectionChange = useCallback((newDir: Point) => {
    // Prevent immediate 180-degree reverse
    if (newDir.x !== -dirRef.current.x || newDir.y !== -dirRef.current.y) {
      nextDirRef.current = newDir;
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange({ x: 0, y: -1 });
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange({ x: 0, y: 1 });
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange({ x: -1, y: 0 });
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange({ x: 1, y: 0 });
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
        } else if (isPlaying) {
          setIsPaused((p) => !p);
        } else {
          resetGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionChange, gameOver, isPlaying, resetGame]);

  // Main Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cellSize = canvas.width / GRID_SIZE;

      // Update game state on tick
      if (isPlaying && !isPaused && !gameOver) {
        const interval = getStepInterval();
        if (currentTime - lastStepTimeRef.current >= interval) {
          lastStepTimeRef.current = currentTime;
          dirRef.current = nextDirRef.current;

          const head = snakeRef.current[0];
          let nextX = head.x + dirRef.current.x;
          let nextY = head.y + dirRef.current.y;

          if (wrapMode) {
            nextX = (nextX + GRID_SIZE) % GRID_SIZE;
            nextY = (nextY + GRID_SIZE) % GRID_SIZE;
          } else {
            if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
              sound.playHit();
              sound.playGameOver();
              setGameOver(true);
              setIsPlaying(false);
              createParticles(head.x, head.y, '#ef4444', 30);
              return;
            }
          }

          // Check self collision
          const selfCollision = snakeRef.current.some(
            (seg, idx) => idx > 0 && seg.x === nextX && seg.y === nextY
          );

          if (selfCollision) {
            sound.playHit();
            sound.playGameOver();
            setGameOver(true);
            setIsPlaying(false);
            createParticles(nextX, nextY, '#ef4444', 30);
            return;
          }

          const newHead = { x: nextX, y: nextY };
          const newSnake = [newHead, ...snakeRef.current];

          // Check food collision
          let ateFood = false;
          if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
            ateFood = true;
            comboRef.current += 1;
            const pointsGained = foodRef.current.points * Math.min(3, comboRef.current);
            setScore((prev) => {
              const updated = prev + pointsGained;
              onScoreUpdate?.(updated);
              if (updated > highScore) {
                onNewHighScore?.(updated);
              }
              return updated;
            });
            sound.playCoin();
            createParticles(newHead.x, newHead.y, foodRef.current.color, 12);
            foodRef.current = spawnFood(newSnake);

            // Chance to spawn bonus food
            if (!bonusFoodRef.current && Math.random() < 0.3) {
              bonusFoodRef.current = spawnFood([...newSnake, foodRef.current]);
            }
          } else if (
            bonusFoodRef.current &&
            newHead.x === bonusFoodRef.current.x &&
            newHead.y === bonusFoodRef.current.y
          ) {
            ateFood = true;
            const bonusPoints = bonusFoodRef.current.points * 2;
            setScore((prev) => {
              const updated = prev + bonusPoints;
              onScoreUpdate?.(updated);
              if (updated > highScore) onNewHighScore?.(updated);
              return updated;
            });
            sound.playVictory();
            createParticles(newHead.x, newHead.y, bonusFoodRef.current.color, 20);
            bonusFoodRef.current = null;
          }

          if (!ateFood) {
            newSnake.pop();
          }

          snakeRef.current = newSnake;

          // Check expiring bonus food
          if (bonusFoodRef.current && bonusFoodRef.current.expiresAt) {
            if (Date.now() > bonusFoodRef.current.expiresAt) {
              bonusFoodRef.current = null;
            }
          }
        }
      }

      // --- RENDERING ---
      // Clear background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID_SIZE; i++) {
        const p = i * cellSize;
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, p);
        ctx.lineTo(canvas.width, p);
        ctx.stroke();
      }

      // Draw borders if wall collision is active
      if (!wrapMode) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);
      }

      // Draw Main Food
      const f = foodRef.current;
      ctx.save();
      ctx.fillStyle = f.color;
      ctx.shadowColor = f.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(
        f.x * cellSize + cellSize / 2,
        f.y * cellSize + cellSize / 2,
        cellSize * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // Draw Bonus Food with pulsing ring
      if (bonusFoodRef.current) {
        const bf = bonusFoodRef.current;
        const pulse = (Math.sin(currentTime / 150) + 1) / 2;
        ctx.save();
        ctx.fillStyle = bf.color;
        ctx.shadowColor = bf.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(
          bf.x * cellSize + cellSize / 2,
          bf.y * cellSize + cellSize / 2,
          cellSize * (0.35 + pulse * 0.15),
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Snake
      const snake = snakeRef.current;
      snake.forEach((seg, index) => {
        const isHead = index === 0;
        const x = seg.x * cellSize;
        const y = seg.y * cellSize;

        ctx.save();
        if (isHead) {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
        } else {
          // Gradient green along body
          const hue = 155 - (index / snake.length) * 35;
          ctx.fillStyle = `hsl(${hue}, 80%, 45%)`;
        }

        // Draw rounded rectangle for segment
        const pad = 1.5;
        ctx.beginPath();
        ctx.roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, isHead ? 6 : 4);
        ctx.fill();

        // Draw cute eyes on head
        if (isHead) {
          ctx.fillStyle = '#0f172a';
          const eyeRadius = cellSize * 0.12;
          const eyeOffset = cellSize * 0.3;
          let eyeX1 = x + eyeOffset;
          let eyeY1 = y + eyeOffset;
          let eyeX2 = x + cellSize - eyeOffset;
          let eyeY2 = y + cellSize - eyeOffset;

          if (dirRef.current.x !== 0) {
            eyeX1 = x + (dirRef.current.x > 0 ? cellSize * 0.65 : cellSize * 0.25);
            eyeX2 = eyeX1;
            eyeY1 = y + cellSize * 0.25;
            eyeY2 = y + cellSize * 0.75;
          } else {
            eyeY1 = y + (dirRef.current.y > 0 ? cellSize * 0.65 : cellSize * 0.25);
            eyeY2 = eyeY1;
            eyeX1 = x + cellSize * 0.25;
            eyeX2 = x + cellSize * 0.75;
          }

          ctx.beginPath();
          ctx.arc(eyeX1, eyeY1, eyeRadius, 0, Math.PI * 2);
          ctx.arc(eyeX2, eyeY2, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Update and draw particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
        const alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, isPaused, gameOver, wrapMode, speedLevel, getStepInterval, spawnFood, highScore, onScoreUpdate, onNewHighScore]);

  return (
    <div id="snake-game-container" className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Score:</span>
          <span className="font-arcade text-amber-400 text-lg arcade-glow">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Best:</span>
          <span className="font-arcade text-emerald-400 text-sm">{highScore}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWrapMode((w) => !w)}
            className={`text-xs px-2 py-1 rounded border transition-colors flex items-center gap-1 ${
              wrapMode
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
            title="Toggle wall wrap mode"
          >
            <Shield className="w-3 h-3" />
            {wrapMode ? 'Wrap: ON' : 'Walls: LETHAL'}
          </button>
        </div>
      </div>

      {/* Screen Box */}
      <div className="relative w-full aspect-square max-w-[440px] rounded-xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl neon-border-amber">
        <canvas
          ref={canvasRef}
          width={440}
          height={440}
          className="w-full h-full block crt-effect"
        />

        {/* Start / Game Over Overlay */}
        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            {gameOver ? (
              <>
                <h3 className="font-arcade text-rose-500 text-xl sm:text-2xl mb-2">GAME OVER</h3>
                <p className="text-slate-300 text-sm mb-1">You crashed!</p>
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-4 py-2 my-4 text-center">
                  <div className="text-xs text-slate-400">Final Score</div>
                  <div className="font-arcade text-amber-400 text-2xl mt-1">{score}</div>
                </div>
                <button
                  id="snake-restart-button"
                  onClick={resetGame}
                  className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  PLAY AGAIN
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-arcade text-emerald-400 text-lg sm:text-xl mb-2">CLASSIC SNAKE</h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xs mb-5">
                  Eat apples to grow longer. Avoid running into your own tail!
                </p>
                <button
                  id="snake-start-button"
                  onClick={resetGame}
                  className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  START GAME
                </button>
                <p className="text-slate-500 text-xs mt-4">
                  Controls: Arrow Keys / WASD or On-Screen D-Pad
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
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              RESUME
            </button>
          </div>
        )}
      </div>

      {/* Speed & Pause bar */}
      <div className="flex items-center justify-between w-full mt-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Speed:</span>
          {(['slow', 'normal', 'fast'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpeedLevel(s)}
              className={`px-2 py-0.5 rounded capitalize transition-colors ${
                speedLevel === s
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isPlaying && !gameOver && (
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      {/* Touch D-Pad for Mobile */}
      <div className="mt-4 flex flex-col items-center gap-1 md:hidden select-none">
        <button
          onClick={() => handleDirectionChange({ x: 0, y: -1 })}
          className="w-12 h-12 rounded-lg bg-slate-800 active:bg-emerald-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700 shadow-md"
        >
          ▲
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => handleDirectionChange({ x: -1, y: 0 })}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-emerald-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700 shadow-md"
          >
            ◀
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 0, y: 1 })}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-emerald-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700 shadow-md"
          >
            ▼
          </button>
          <button
            onClick={() => handleDirectionChange({ x: 1, y: 0 })}
            className="w-12 h-12 rounded-lg bg-slate-800 active:bg-emerald-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700 shadow-md"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};
