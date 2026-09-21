import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../utils/sound';
import { RotateCcw, Play, Pause, Trophy, Sparkles } from 'lucide-react';

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  hp: number;
  maxHp: number;
  color: string;
  points: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: 'wide' | 'multiball' | 'slow';
  color: string;
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

interface BreakoutGameProps {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

export const BreakoutGame: React.FC<BreakoutGameProps> = ({
  onScoreUpdate,
  highScore,
  onNewHighScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Mutable Game States
  const paddleRef = useRef({
    x: 180,
    y: 400,
    w: 80,
    h: 12,
    baseW: 80,
    speed: 7,
    moveLeft: false,
    moveRight: false,
  });

  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animIdRef = useRef<number | null>(null);

  const initLevel = useCallback((lvl: number) => {
    const rows = Math.min(6, 3 + lvl);
    const cols = 8;
    const brickW = 46;
    const brickH = 16;
    const padding = 6;
    const offsetX = 16;
    const offsetY = 40;

    const rowColors = [
      '#ef4444', // Red
      '#f97316', // Orange
      '#eab308', // Yellow
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#8b5cf6', // Violet
    ];

    const newBricks: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      const color = rowColors[r % rowColors.length];
      const hp = r < 2 && lvl > 1 ? 2 : 1;
      const points = (rows - r) * 15;

      for (let c = 0; c < cols; c++) {
        newBricks.push({
          x: offsetX + c * (brickW + padding),
          y: offsetY + r * (brickH + padding),
          w: brickW,
          h: brickH,
          hp,
          maxHp: hp,
          color,
          points,
        });
      }
    }

    bricksRef.current = newBricks;
    paddleRef.current.w = paddleRef.current.baseW;
    paddleRef.current.x = 220 - paddleRef.current.w / 2;

    // Ball initial
    ballsRef.current = [
      {
        x: 220,
        y: 380,
        vx: (Math.random() > 0.5 ? 1 : -1) * (2.8 + lvl * 0.4),
        vy: -(3.5 + lvl * 0.4),
        radius: 6,
      },
    ];

    powerUpsRef.current = [];
    particlesRef.current = [];
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1,
        maxLife: 20 + Math.random() * 10,
        size: Math.random() * 3 + 2,
      });
    }
  };

  const startGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
    initLevel(1);
    setIsPlaying(true);
    sound.playScore();
  }, [initLevel]);

  // Controls handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        paddleRef.current.moveLeft = true;
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        paddleRef.current.moveRight = true;
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (!isPlaying || gameOver || gameWon) {
          startGame();
        } else {
          setIsPaused((p) => !p);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        paddleRef.current.moveLeft = false;
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        paddleRef.current.moveRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, gameOver, gameWon, startGame]);

  // Canvas Mouse & Touch Tracking
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const pointerX = (e.clientX - rect.left) * scaleX;
    paddleRef.current.x = Math.max(
      0,
      Math.min(canvas.width - paddleRef.current.w, pointerX - paddleRef.current.w / 2)
    );
  };

  // Main Game Loop
  useEffect(() => {
    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const paddle = paddleRef.current;

      // Update Paddle
      if (paddle.moveLeft) {
        paddle.x = Math.max(0, paddle.x - paddle.speed);
      }
      if (paddle.moveRight) {
        paddle.x = Math.min(canvas.width - paddle.w, paddle.x + paddle.speed);
      }

      if (isPlaying && !isPaused && !gameOver && !gameWon) {
        // Update Balls
        const activeBalls: Ball[] = [];

        ballsRef.current.forEach((ball) => {
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall bounces
          if (ball.x - ball.radius <= 0) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx);
            sound.playBounce();
          } else if (ball.x + ball.radius >= canvas.width) {
            ball.x = canvas.width - ball.radius;
            ball.vx = -Math.abs(ball.vx);
            sound.playBounce();
          }

          if (ball.y - ball.radius <= 0) {
            ball.y = ball.radius;
            ball.vy = Math.abs(ball.vy);
            sound.playBounce();
          }

          // Paddle collision
          if (
            ball.y + ball.radius >= paddle.y &&
            ball.y - ball.radius <= paddle.y + paddle.h &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.w &&
            ball.vy > 0
          ) {
            // Calculate rebound angle depending on offset from center
            const center = paddle.x + paddle.w / 2;
            const offset = (ball.x - center) / (paddle.w / 2); // -1 to 1
            const maxAngle = (Math.PI / 3); // 60 degrees
            const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            const speed = Math.min(8, currentSpeed * 1.02);

            const angle = offset * maxAngle;
            ball.vx = speed * Math.sin(angle);
            ball.vy = -Math.abs(speed * Math.cos(angle));

            sound.playBounce();
            spawnParticles(ball.x, paddle.y, '#38bdf8', 6);
          }

          // Brick collisions
          let hitBrick = false;
          for (let i = bricksRef.current.length - 1; i >= 0; i--) {
            const b = bricksRef.current[i];

            // AABB vs circle collision
            const closestX = Math.max(b.x, Math.min(ball.x, b.x + b.w));
            const closestY = Math.max(b.y, Math.min(ball.y, b.y + b.h));

            const distX = ball.x - closestX;
            const distY = ball.y - closestY;
            const distSquared = distX * distX + distY * distY;

            if (distSquared <= ball.radius * ball.radius) {
              // Determine collision side
              const overlapLeft = ball.x - b.x;
              const overlapRight = (b.x + b.w) - ball.x;
              const overlapTop = ball.y - b.y;
              const overlapBottom = (b.y + b.h) - ball.y;

              const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

              if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                ball.vx = -ball.vx;
              } else {
                ball.vy = -ball.vy;
              }

              b.hp -= 1;
              sound.playHit();
              spawnParticles(closestX, closestY, b.color, 10);

              if (b.hp <= 0) {
                // Award score
                setScore((prev) => {
                  const updated = prev + b.points;
                  onScoreUpdate?.(updated);
                  if (updated > highScore) onNewHighScore?.(updated);
                  return updated;
                });
                bricksRef.current.splice(i, 1);

                // Chance to drop power-up
                if (Math.random() < 0.22) {
                  const types: ('wide' | 'multiball' | 'slow')[] = ['wide', 'multiball', 'slow'];
                  const chosenType = types[Math.floor(Math.random() * types.length)];
                  const colorMap = { wide: '#38bdf8', multiball: '#f59e0b', slow: '#10b981' };
                  powerUpsRef.current.push({
                    x: b.x + b.w / 2,
                    y: b.y + b.h,
                    vy: 2.2,
                    type: chosenType,
                    color: colorMap[chosenType],
                  });
                }
              }

              hitBrick = true;
              break;
            }
          }

          // Check if ball fell below screen
          if (ball.y - ball.radius < canvas.height) {
            activeBalls.push(ball);
          }
        });

        // If all balls lost
        if (activeBalls.length === 0) {
          setLives((prev) => {
            const nextLives = prev - 1;
            if (nextLives <= 0) {
              setGameOver(true);
              setIsPlaying(false);
              sound.playGameOver();
            } else {
              // Reset single ball on paddle
              ballsRef.current = [
                {
                  x: paddle.x + paddle.w / 2,
                  y: paddle.y - 15,
                  vx: (Math.random() > 0.5 ? 1 : -1) * 3,
                  vy: -4,
                  radius: 6,
                },
              ];
              sound.playHit();
            }
            return nextLives;
          });
        } else {
          ballsRef.current = activeBalls;
        }

        // Check if level cleared
        if (bricksRef.current.length === 0) {
          sound.playVictory();
          if (level >= 3) {
            setGameWon(true);
            setIsPlaying(false);
          } else {
            setLevel((lvl) => {
              const next = lvl + 1;
              initLevel(next);
              return next;
            });
          }
        }

        // Update PowerUps
        for (let i = powerUpsRef.current.length - 1; i >= 0; i--) {
          const p = powerUpsRef.current[i];
          p.y += p.vy;

          // Catch powerup with paddle
          if (
            p.y >= paddle.y &&
            p.y <= paddle.y + paddle.h &&
            p.x >= paddle.x &&
            p.x <= paddle.x + paddle.w
          ) {
            sound.playCoin();
            if (p.type === 'wide') {
              paddle.w = Math.min(140, paddle.w + 30);
            } else if (p.type === 'multiball') {
              if (ballsRef.current.length > 0) {
                const b0 = ballsRef.current[0];
                ballsRef.current.push(
                  { ...b0, vx: b0.vx + 1.5, vy: b0.vy - 0.5 },
                  { ...b0, vx: -b0.vx - 1.5, vy: b0.vy - 0.5 }
                );
              }
            } else if (p.type === 'slow') {
              ballsRef.current.forEach((b) => {
                b.vx *= 0.75;
                b.vy *= 0.75;
              });
            }
            powerUpsRef.current.splice(i, 1);
            continue;
          }

          if (p.y > canvas.height) {
            powerUpsRef.current.splice(i, 1);
          }
        }
      }

      // --- RENDERING ---
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle background grid
      ctx.strokeStyle = '#172033';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Bricks
      bricksRef.current.forEach((b) => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = b.hp === b.maxHp ? 4 : 0;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 3);
        ctx.fill();

        // 3D bevel top highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillRect(b.x, b.y, b.w, 3);

        // Crack if damaged
        if (b.hp < b.maxHp) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x + 5, b.y + 3);
          ctx.lineTo(b.x + b.w / 2, b.y + b.h - 3);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Draw Paddle
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 6);
      ctx.fill();

      // Paddle neon center stripe
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(paddle.x + paddle.w * 0.3, paddle.y + 3, paddle.w * 0.4, 4);
      ctx.restore();

      // Draw PowerUps
      powerUpsRef.current.forEach((p) => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = p.type === 'wide' ? 'W' : p.type === 'multiball' ? '3X' : 'S';
        ctx.fillText(label, p.x, p.y);
        ctx.restore();
      });

      // Draw Balls
      ballsRef.current.forEach((ball) => {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Particles
      particlesRef.current.forEach((p) => {
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

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isPlaying, isPaused, gameOver, gameWon, level, highScore, initLevel, onScoreUpdate, onNewHighScore]);

  return (
    <div id="breakout-game-container" className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase text-slate-400 font-semibold">Score:</span>
            <span className="font-arcade text-amber-400 text-lg arcade-glow">{score}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase text-slate-400 font-semibold">Lvl:</span>
            <span className="font-arcade text-cyan-400 text-sm">{level}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Balls:</span>
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full ${
                  idx < lives ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase text-slate-400 font-semibold">Best:</span>
          <span className="font-arcade text-emerald-400 text-sm">{highScore}</span>
        </div>
      </div>

      {/* Screen Box */}
      <div className="relative w-full aspect-square max-w-[440px] rounded-xl overflow-hidden border-2 border-slate-700/80 bg-slate-950 shadow-2xl neon-border-amber">
        <canvas
          ref={canvasRef}
          width={440}
          height={440}
          onPointerMove={handlePointerMove}
          className="w-full h-full block cursor-ew-resize crt-effect"
        />

        {/* Start / Game Over / Win Overlay */}
        {(!isPlaying || gameOver || gameWon) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            {gameWon ? (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="font-arcade text-amber-400 text-xl mb-2">VICTORY!</h3>
                <p className="text-slate-300 text-sm mb-4">All brick levels cleared!</p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 mb-4">
                  <div className="text-xs text-slate-400">Total Score</div>
                  <div className="font-arcade text-amber-400 text-2xl mt-1">{score}</div>
                </div>
                <button
                  id="breakout-win-restart-button"
                  onClick={startGame}
                  className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  PLAY AGAIN
                </button>
              </>
            ) : gameOver ? (
              <>
                <h3 className="font-arcade text-rose-500 text-2xl mb-2">GAME OVER</h3>
                <p className="text-slate-300 text-sm mb-4">All balls were lost!</p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 mb-4">
                  <div className="text-xs text-slate-400">Final Score</div>
                  <div className="font-arcade text-amber-400 text-2xl mt-1">{score}</div>
                </div>
                <button
                  id="breakout-restart-button"
                  onClick={startGame}
                  className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  RETRY
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-arcade text-cyan-400 text-xl mb-2">BREAKOUT BOUNCE</h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xs mb-5">
                  Bounce the ball to smash bricks. Catch power-ups and don't drop the ball!
                </p>
                <button
                  id="breakout-start-button"
                  onClick={startGame}
                  className="px-6 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  LAUNCH BALL
                </button>
                <p className="text-slate-500 text-xs mt-4">
                  Drag with mouse/finger or use Left/Right Arrow keys
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

      {/* Control Help & Action Buttons */}
      <div className="flex items-center justify-between w-full mt-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-sky-400" /> Wide Paddle
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" /> Multi-Ball
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400" /> Slow
          </span>
        </div>

        {isPlaying && !gameOver && !gameWon && (
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      {/* Mobile touch paddle arrows */}
      <div className="mt-3 flex gap-6 md:hidden">
        <button
          onPointerDown={() => { paddleRef.current.moveLeft = true; }}
          onPointerUp={() => { paddleRef.current.moveLeft = false; }}
          onPointerLeave={() => { paddleRef.current.moveLeft = false; }}
          className="w-20 h-12 rounded-lg bg-slate-800 active:bg-cyan-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700 shadow-md select-none"
        >
          ◀ LEFT
        </button>
        <button
          onPointerDown={() => { paddleRef.current.moveRight = true; }}
          onPointerUp={() => { paddleRef.current.moveRight = false; }}
          onPointerLeave={() => { paddleRef.current.moveRight = false; }}
          className="w-20 h-12 rounded-lg bg-slate-800 active:bg-cyan-600 text-slate-200 flex items-center justify-center text-lg font-bold border border-slate-700 shadow-md select-none"
        >
          RIGHT ▶
        </button>
      </div>
    </div>
  );
};
