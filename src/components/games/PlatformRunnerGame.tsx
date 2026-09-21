import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../utils/sound';
import { RotateCcw, Play, Pause, Sparkles, Trophy } from 'lucide-react';

interface Entity {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Player extends Entity {
  vx: number;
  vy: number;
  isGrounded: boolean;
  isFacingRight: boolean;
}

interface Block extends Entity {
  type: 'ground' | 'brick' | 'question' | 'pipe';
  hasItem?: boolean;
  hitAnim?: number;
}

interface Enemy extends Entity {
  vx: number;
  isAlive: boolean;
  squishAnim?: number;
}

interface Coin extends Entity {
  collected: boolean;
  spinOffset: number;
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

interface PlatformRunnerProps {
  onScoreUpdate?: (score: number) => void;
  highScore: number;
  onNewHighScore?: (score: number) => void;
}

export const PlatformRunnerGame: React.FC<PlatformRunnerProps> = ({
  onScoreUpdate,
  highScore,
  onNewHighScore,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Key controls state
  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  const playerRef = useRef<Player>({
    x: 40,
    y: 280,
    w: 22,
    h: 28,
    vx: 0,
    vy: 0,
    isGrounded: false,
    isFacingRight: true,
  });

  const cameraXRef = useRef(0);
  const blocksRef = useRef<Block[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const flagXRef = useRef(1900);
  const animIdRef = useRef<number | null>(null);

  const initWorld = useCallback(() => {
    // Generate a rich retro stage with platforms, mystery blocks, and pipes
    const blocks: Block[] = [];
    const enemies: Enemy[] = [];
    const coinsList: Coin[] = [];

    // Base ground with periodic pits
    let currX = 0;
    while (currX < 2100) {
      // Periodic pits
      if ((currX > 380 && currX < 440) || (currX > 850 && currX < 920) || (currX > 1400 && currX < 1470)) {
        currX += 60;
        continue;
      }
      blocks.push({
        x: currX,
        y: 350,
        w: 50,
        h: 90,
        type: 'ground',
      });
      currX += 50;
    }

    // Elevated blocks & mystery question boxes
    const platforms = [
      { x: 120, y: 260, count: 4, type: 'brick' as const },
      { x: 160, y: 260, count: 1, type: 'question' as const },
      { x: 260, y: 230, count: 3, type: 'brick' as const },
      { x: 500, y: 250, count: 5, type: 'brick' as const },
      { x: 550, y: 250, count: 1, type: 'question' as const },
      { x: 680, y: 210, count: 4, type: 'brick' as const },
      { x: 960, y: 240, count: 6, type: 'brick' as const },
      { x: 1000, y: 240, count: 1, type: 'question' as const },
      { x: 1150, y: 200, count: 4, type: 'brick' as const },
      { x: 1520, y: 260, count: 5, type: 'brick' as const },
      { x: 1700, y: 220, count: 4, type: 'brick' as const },
    ];

    platforms.forEach((p) => {
      for (let i = 0; i < p.count; i++) {
        blocks.push({
          x: p.x + i * 28,
          y: p.y,
          w: 28,
          h: 28,
          type: p.type,
          hasItem: p.type === 'question',
        });
      }
    });

    // Pipes
    const pipeLocations = [320, 600, 1100, 1340, 1620];
    pipeLocations.forEach((px) => {
      blocks.push({
        x: px,
        y: 300,
        w: 36,
        h: 50,
        type: 'pipe',
      });
    });

    // Floating coins
    const coinLocations = [
      140, 280, 520, 560, 600, 710, 740, 980, 1020, 1180, 1220, 1540, 1580, 1720,
    ];
    coinLocations.forEach((cx) => {
      coinsList.push({
        x: cx,
        y: 190,
        w: 16,
        h: 16,
        collected: false,
        spinOffset: Math.random() * 10,
      });
    });

    // Walking patrol enemies (Goomba-style)
    const enemySpawns = [220, 480, 750, 1040, 1260, 1500, 1760];
    enemySpawns.forEach((ex) => {
      enemies.push({
        x: ex,
        y: 326,
        w: 24,
        h: 24,
        vx: -1.2,
        isAlive: true,
      });
    });

    blocksRef.current = blocks;
    enemiesRef.current = enemies;
    coinsRef.current = coinsList;
    particlesRef.current = [];
    flagXRef.current = 1920;

    playerRef.current = {
      x: 40,
      y: 280,
      w: 22,
      h: 28,
      vx: 0,
      vy: 0,
      isGrounded: false,
      isFacingRight: true,
    };
    cameraXRef.current = 0;
  }, []);

  const spawnParticles = (x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color,
        life: 1,
        maxLife: 20 + Math.random() * 10,
        size: Math.random() * 3 + 2,
      });
    }
  };

  const startGame = useCallback(() => {
    setScore(0);
    setCoins(0);
    setGameOver(false);
    setGameWon(false);
    setIsPaused(false);
    initWorld();
    setIsPlaying(true);
    sound.playScore();
  }, [initWorld]);

  // Jump trigger
  const triggerJump = useCallback(() => {
    const p = playerRef.current;
    if (p.isGrounded) {
      p.vy = -10.5;
      p.isGrounded = false;
      sound.playJump();
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = true;
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = true;
      } else if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        e.preventDefault();
        if (!isPlaying || gameOver || gameWon) {
          startGame();
        } else {
          keysRef.current.jump = true;
          triggerJump();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = false;
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = false;
      } else if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        keysRef.current.jump = false;
        // Cut jump height short if key released early
        if (playerRef.current.vy < -4) {
          playerRef.current.vy = -4;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, gameOver, gameWon, startGame, triggerJump]);

  // Physics and Game Loop
  useEffect(() => {
    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const p = playerRef.current;

      if (isPlaying && !isPaused && !gameOver && !gameWon) {
        // Horizontal player acceleration & friction
        const accel = 0.8;
        const maxSpeed = 4.5;
        const friction = 0.82;

        if (keysRef.current.left) {
          p.vx = Math.max(-maxSpeed, p.vx - accel);
          p.isFacingRight = false;
        } else if (keysRef.current.right) {
          p.vx = Math.min(maxSpeed, p.vx + accel);
          p.isFacingRight = true;
        } else {
          p.vx *= friction;
          if (Math.abs(p.vx) < 0.1) p.vx = 0;
        }

        // Apply Gravity
        const gravity = 0.52;
        p.vy += gravity;
        if (p.vy > 12) p.vy = 12;

        // Move horizontally and check block collisions
        p.x += p.vx;
        blocksRef.current.forEach((b) => {
          if (
            p.x < b.x + b.w &&
            p.x + p.w > b.x &&
            p.y < b.y + b.h &&
            p.y + p.h > b.y
          ) {
            if (p.vx > 0) {
              p.x = b.x - p.w;
            } else if (p.vx < 0) {
              p.x = b.x + b.w;
            }
            p.vx = 0;
          }
        });

        // Move vertically and check block collisions
        p.y += p.vy;
        p.isGrounded = false;

        blocksRef.current.forEach((b) => {
          if (
            p.x < b.x + b.w &&
            p.x + p.w > b.x &&
            p.y < b.y + b.h &&
            p.y + p.h > b.y
          ) {
            // Landing on top of block
            if (p.vy > 0 && p.y + p.h - p.vy <= b.y + 6) {
              p.y = b.y - p.h;
              p.vy = 0;
              p.isGrounded = true;
            }
            // Hitting block from underneath
            else if (p.vy < 0 && p.y - p.vy >= b.y + b.h - 6) {
              p.y = b.y + b.h;
              p.vy = 0;
              sound.playHit();

              // Mystery question block hit!
              if (b.type === 'question' && b.hasItem) {
                b.hasItem = false;
                sound.playCoin();
                setCoins((c) => c + 1);
                setScore((s) => {
                  const updated = s + 100;
                  onScoreUpdate?.(updated);
                  if (updated > highScore) onNewHighScore?.(updated);
                  return updated;
                });
                spawnParticles(b.x + b.w / 2, b.y, '#eab308', 8);
              }
            }
          }
        });

        // Check if player fell into pit
        if (p.y > canvas.height + 40) {
          sound.playGameOver();
          setGameOver(true);
          setIsPlaying(false);
          return;
        }

        // Coins collection
        coinsRef.current.forEach((c) => {
          if (
            !c.collected &&
            p.x < c.x + c.w &&
            p.x + p.w > c.x &&
            p.y < c.y + c.h &&
            p.y + p.h > c.y
          ) {
            c.collected = true;
            sound.playCoin();
            setCoins((cnt) => cnt + 1);
            setScore((s) => {
              const updated = s + 50;
              onScoreUpdate?.(updated);
              if (updated > highScore) onNewHighScore?.(updated);
              return updated;
            });
            spawnParticles(c.x + c.w / 2, c.y + c.h / 2, '#eab308', 6);
          }
        });

        // Enemies logic
        enemiesRef.current.forEach((enemy) => {
          if (!enemy.isAlive) {
            if (enemy.squishAnim !== undefined) {
              enemy.squishAnim += 1;
            }
            return;
          }

          enemy.x += enemy.vx;

          // Enemy turn around at edges or pipe obstacles
          blocksRef.current.forEach((b) => {
            if (
              b.type === 'pipe' &&
              enemy.x < b.x + b.w &&
              enemy.x + enemy.w > b.x &&
              enemy.y < b.y + b.h &&
              enemy.y + enemy.h > b.y
            ) {
              enemy.vx = -enemy.vx;
            }
          });

          // Player vs Enemy collision
          if (
            p.x < enemy.x + enemy.w &&
            p.x + p.w > enemy.x &&
            p.y < enemy.y + enemy.h &&
            p.y + p.h > enemy.y
          ) {
            // Stomp on enemy head!
            if (p.vy > 0 && p.y + p.h - p.vy <= enemy.y + 10) {
              enemy.isAlive = false;
              enemy.squishAnim = 0;
              p.vy = -7.5; // Bounce off enemy
              sound.playBounce();
              setScore((s) => {
                const updated = s + 200;
                onScoreUpdate?.(updated);
                if (updated > highScore) onNewHighScore?.(updated);
                return updated;
              });
              spawnParticles(enemy.x + enemy.w / 2, enemy.y, '#f97316', 12);
            } else {
              // Hurt player
              sound.playHit();
              sound.playGameOver();
              setGameOver(true);
              setIsPlaying(false);
              spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#ef4444', 20);
            }
          }
        });

        // Flag goal reached
        if (p.x >= flagXRef.current) {
          sound.playVictory();
          setGameWon(true);
          setIsPlaying(false);
          setScore((s) => {
            const updated = s + 1000;
            onScoreUpdate?.(updated);
            if (updated > highScore) onNewHighScore?.(updated);
            return updated;
          });
        }

        // Camera smoothly follows player
        const targetCamX = Math.max(0, p.x - canvas.width * 0.35);
        cameraXRef.current += (targetCamX - cameraXRef.current) * 0.1;
      }

      // --- RENDERING ---
      ctx.save();

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.7, '#1e293b');
      skyGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const camX = cameraXRef.current;

      // Parallax Background Clouds & Hills
      ctx.fillStyle = 'rgba(51, 65, 85, 0.4)';
      for (let i = 0; i < 8; i++) {
        const hx = (i * 280) - (camX * 0.2) % 280;
        ctx.beginPath();
        ctx.arc(hx, 320, 70, Math.PI, 0);
        ctx.fill();
      }

      // Translate world with camera
      ctx.translate(-camX, 0);

      // Draw Blocks
      blocksRef.current.forEach((b) => {
        // Skip offscreen
        if (b.x + b.w < camX - 50 || b.x > camX + canvas.width + 50) return;

        if (b.type === 'ground') {
          // Retro green-topped dirt
          ctx.fillStyle = '#059669';
          ctx.fillRect(b.x, b.y, b.w, 8);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(b.x, b.y + 8, b.w, b.h - 8);
          // Texture specks
          ctx.fillStyle = '#92400e';
          ctx.fillRect(b.x + 4, b.y + 16, 6, 6);
          ctx.fillRect(b.x + 24, b.y + 28, 8, 6);
        } else if (b.type === 'brick') {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(b.x, b.y, b.w, b.h);
          // Brick seams
          ctx.beginPath();
          ctx.moveTo(b.x, b.y + b.h / 2);
          ctx.lineTo(b.x + b.w, b.y + b.h / 2);
          ctx.moveTo(b.x + b.w / 2, b.y);
          ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2);
          ctx.stroke();
        } else if (b.type === 'question') {
          ctx.fillStyle = b.hasItem ? '#f59e0b' : '#64748b';
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(b.x, b.y, b.w, b.h);

          // Question mark
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.hasItem ? '?' : '•', b.x + b.w / 2, b.y + b.h / 2);
        } else if (b.type === 'pipe') {
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.fillRect(b.x - 3, b.y, b.w + 6, 12);
          ctx.strokeStyle = '#14532d';
          ctx.lineWidth = 2;
          ctx.strokeRect(b.x - 3, b.y, b.w + 6, 12);
          ctx.strokeRect(b.x, b.y + 12, b.w, b.h - 12);
        }
      });

      // Draw Coins with subtle spin
      const now = performance.now();
      coinsRef.current.forEach((c) => {
        if (c.collected) return;
        const spin = Math.sin((now / 180) + c.spinOffset);
        const coinW = Math.max(2, Math.abs(spin) * 12);

        ctx.save();
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(c.x + c.w / 2, c.y + c.h / 2, coinW / 2, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Goal Flagpole
      const flagX = flagXRef.current;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(flagX, 150, 6, 200);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(flagX + 3, 150, 8, 0, Math.PI * 2);
      ctx.fill();
      // Pennant flag
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(flagX + 6, 160);
      ctx.lineTo(flagX + 40, 175);
      ctx.lineTo(flagX + 6, 190);
      ctx.closePath();
      ctx.fill();

      // Draw Enemies
      enemiesRef.current.forEach((e) => {
        if (!e.isAlive) {
          if (e.squishAnim !== undefined && e.squishAnim < 20) {
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(e.x, e.y + 16, e.w, 8);
          }
          return;
        }

        // Draw cute retro mushroom / Goomba critter
        ctx.save();
        ctx.fillStyle = '#ea580c'; // Brown mushroom head
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + 10, 11, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(e.x + 2, e.y + 10, e.w - 4, 10);

        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x + 5, e.y + 8, 4, 6);
        ctx.fillRect(e.x + 15, e.y + 8, 4, 6);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(e.x + (e.vx < 0 ? 5 : 7), e.y + 9, 2, 4);
        ctx.fillRect(e.x + (e.vx < 0 ? 15 : 17), e.y + 9, 2, 4);

        // Walking feet toggle
        const step = Math.floor(now / 150) % 2;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(e.x + (step ? 2 : 12), e.y + e.h - 4, 8, 4);
        ctx.restore();
      });

      // Draw Player Hero
      ctx.save();
      const px = p.x;
      const py = p.y;

      // Hero Body / Overalls
      ctx.fillStyle = '#ef4444'; // Red shirt & cap
      ctx.fillRect(px + 4, py + 2, p.w - 8, 10); // Hat
      ctx.fillRect(p.isFacingRight ? px + 8 : px + 2, py + 4, 12, 4); // Hat brim

      // Face
      ctx.fillStyle = '#fed7aa'; // Skin tone
      ctx.fillRect(px + 4, py + 10, p.w - 8, 8);
      // Eye & Moustache
      ctx.fillStyle = '#0f172a';
      const eyeX = p.isFacingRight ? px + 14 : px + 6;
      ctx.fillRect(eyeX, py + 11, 2, 3);
      ctx.fillStyle = '#78350f'; // Moustache
      ctx.fillRect(p.isFacingRight ? px + 11 : px + 5, py + 15, 6, 2);

      // Blue Overalls
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(px + 3, py + 18, p.w - 6, 8);

      // Shoes
      ctx.fillStyle = '#78350f';
      if (p.isGrounded && Math.abs(p.vx) > 0.5) {
        const runFrame = Math.floor(now / 100) % 2;
        ctx.fillRect(px + (runFrame ? 0 : 6), py + 25, 8, 4);
        ctx.fillRect(px + (runFrame ? 12 : 6), py + 25, 8, 4);
      } else {
        ctx.fillRect(px + 2, py + 25, 8, 4);
        ctx.fillRect(px + 12, py + 25, 8, 4);
      }
      ctx.restore();

      // Particles
      particlesRef.current.forEach((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life += 1;
        const alpha = Math.max(0, 1 - pt.life / pt.maxLife);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter((pt) => pt.life < pt.maxLife);

      ctx.restore(); // Restore camera translation

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [isPlaying, isPaused, gameOver, gameWon, highScore, onScoreUpdate, onNewHighScore]);

  return (
    <div id="runner-game-container" className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Top Game Bar */}
      <div className="flex items-center justify-between w-full mb-3 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase text-slate-400 font-semibold">Score:</span>
            <span className="font-arcade text-amber-400 text-lg arcade-glow">{score}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs uppercase text-slate-400 font-semibold">Coins:</span>
            <span className="font-arcade text-yellow-300 text-sm">★ {coins}</span>
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
          className="w-full h-full block crt-effect"
        />

        {/* Start / Game Over / Win Overlay */}
        {(!isPlaying || gameOver || gameWon) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-30">
            {gameWon ? (
              <>
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="font-arcade text-amber-400 text-xl mb-2">COURSE CLEAR!</h3>
                <p className="text-slate-300 text-sm mb-4">You reached the golden flag!</p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 mb-4">
                  <div className="text-xs text-slate-400">Total Score</div>
                  <div className="font-arcade text-amber-400 text-2xl mt-1">{score}</div>
                </div>
                <button
                  id="runner-win-button"
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
                <p className="text-slate-300 text-sm mb-4">Watch out for enemies and pits!</p>
                <div className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 mb-4">
                  <div className="text-xs text-slate-400">Score Achieved</div>
                  <div className="font-arcade text-amber-400 text-2xl mt-1">{score}</div>
                </div>
                <button
                  id="runner-restart-button"
                  onClick={startGame}
                  className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  RETRY
                </button>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-arcade text-rose-400 text-xl mb-2">MINI MARIO RUNNER</h3>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xs mb-5">
                  Run, jump over pipes and pits, stomp on critters, and reach the flagpole!
                </p>
                <button
                  id="runner-start-button"
                  onClick={startGame}
                  className="px-6 py-3 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  START RUN
                </button>
                <p className="text-slate-500 text-xs mt-4">
                  Controls: Left/Right to run, Space/Up to jump
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
          <span>Stomp enemies from above (+200)</span>
          <span>Hit ? blocks (+100)</span>
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

      {/* Mobile touch controls */}
      <div className="mt-3 flex items-center justify-between w-full max-w-[340px] md:hidden px-4">
        <div className="flex gap-2">
          <button
            onPointerDown={() => { keysRef.current.left = true; }}
            onPointerUp={() => { keysRef.current.left = false; }}
            onPointerLeave={() => { keysRef.current.left = false; }}
            className="w-14 h-14 rounded-lg bg-slate-800 active:bg-rose-600 text-slate-200 flex items-center justify-center text-xl font-bold border border-slate-700 shadow select-none"
          >
            ◀
          </button>
          <button
            onPointerDown={() => { keysRef.current.right = true; }}
            onPointerUp={() => { keysRef.current.right = false; }}
            onPointerLeave={() => { keysRef.current.right = false; }}
            className="w-14 h-14 rounded-lg bg-slate-800 active:bg-rose-600 text-slate-200 flex items-center justify-center text-xl font-bold border border-slate-700 shadow select-none"
          >
            ▶
          </button>
        </div>

        <button
          onPointerDown={() => {
            keysRef.current.jump = true;
            triggerJump();
          }}
          onPointerUp={() => {
            keysRef.current.jump = false;
          }}
          className="w-16 h-16 rounded-full bg-rose-500 active:bg-rose-400 text-slate-950 font-arcade text-xs font-bold flex items-center justify-center shadow-lg border-2 border-rose-300 select-none"
        >
          JUMP
        </button>
      </div>
    </div>
  );
};
