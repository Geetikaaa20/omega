import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../utils/sound';
import {
  ChefHat,
  Cake,
  Flame,
  RotateCcw,
  Sparkles,
  Trophy,
  Clock,
  Heart,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Play,
  Star,
  Palette,
  Camera,
  Layers,
  Award,
  ChevronRight,
  Smile,
  Zap,
} from 'lucide-react';

export interface CakeMakingGameProps {
  highScore: number;
  onNewHighScore: (score: number) => void;
}

// Data definitions for the Cake Making Experience
export type CakeShape = 'round' | 'square' | 'heart' | 'star';
export type SpongeFlavor = 'vanilla' | 'chocolate' | 'strawberry' | 'matcha';
export type FrostingFlavor = 'vanilla' | 'chocolate' | 'strawberry' | 'mint' | 'caramel' | 'blueberry';
export type PipingPattern = 'none' | 'rosettes' | 'drizzle' | 'star-beads' | 'swirl';
export type ToppingItem = 'cherry' | 'strawberry' | 'chocolate-star' | 'sprinkles' | 'candle' | 'candy-roll';

export interface CakeTierData {
  shape: CakeShape;
  sponge: SpongeFlavor;
  frosting: FrostingFlavor;
  piping: PipingPattern;
  pipingColor?: string;
  toppings: ToppingItem[];
  candleLit?: boolean;
}

export interface CustomerOrder {
  id: number;
  customerName: string;
  customerEmoji: string;
  targetTier: CakeTierData;
  timeLimitSec: number;
  rewardPoints: number;
  hint: string;
}

export const SPONGE_COLORS: Record<SpongeFlavor, { bg: string; border: string; label: string }> = {
  vanilla: { bg: '#fde047', border: '#eab308', label: 'Vanilla Sponge' },
  chocolate: { bg: '#78350f', border: '#451a03', label: 'Dark Chocolate' },
  strawberry: { bg: '#f472b6', border: '#db2777', label: 'Berry Velvet' },
  matcha: { bg: '#84cc16', border: '#4d7c0f', label: 'Matcha Green' },
};

export const FROSTING_COLORS: Record<FrostingFlavor, { fill: string; accent: string; label: string }> = {
  vanilla: { fill: '#fffbeb', accent: '#fef3c7', label: 'Whipped Cream' },
  chocolate: { fill: '#451a03', accent: '#290f02', label: 'Choco Ganache' },
  strawberry: { fill: '#fbcfe8', accent: '#f472b6', label: 'Pink Glaze' },
  mint: { fill: '#a7f3d0', accent: '#34d399', label: 'Mint Buttercream' },
  caramel: { fill: '#fcd34d', accent: '#d97706', label: 'Salted Caramel' },
  blueberry: { fill: '#c7d2fe', accent: '#818cf8', label: 'Berry Violet' },
};

export const TOPPING_DETAILS: Record<ToppingItem, { icon: string; label: string }> = {
  cherry: { icon: '🍒', label: 'Cherry' },
  strawberry: { icon: '🍓', label: 'Strawberry' },
  'chocolate-star': { icon: '⭐', label: 'Choco Star' },
  sprinkles: { icon: '✨', label: 'Sprinkles' },
  candle: { icon: '🕯️', label: 'Candle' },
  'candy-roll': { icon: '🍬', label: 'Candy Roll' },
};

// Preset sample orders for the Bakery Rush challenge
const SAMPLE_ORDERS: CustomerOrder[] = [
  {
    id: 1,
    customerName: 'Sweet Tooth Timmy',
    customerEmoji: '👦',
    targetTier: {
      shape: 'round',
      sponge: 'vanilla',
      frosting: 'strawberry',
      piping: 'rosettes',
      toppings: ['cherry', 'sprinkles'],
    },
    timeLimitSec: 45,
    rewardPoints: 200,
    hint: 'Round Vanilla sponge with Pink Glaze, Rosettes, Cherries & Sprinkles!',
  },
  {
    id: 2,
    customerName: 'Choco Lover Chloe',
    customerEmoji: '👧',
    targetTier: {
      shape: 'square',
      sponge: 'chocolate',
      frosting: 'chocolate',
      piping: 'drizzle',
      toppings: ['chocolate-star', 'sprinkles'],
    },
    timeLimitSec: 40,
    rewardPoints: 250,
    hint: 'Square Chocolate on Chocolate with Drizzle and Choco Stars!',
  },
  {
    id: 3,
    customerName: 'Birthday Mayor Leo',
    customerEmoji: '🎩',
    targetTier: {
      shape: 'heart',
      sponge: 'strawberry',
      frosting: 'vanilla',
      piping: 'star-beads',
      toppings: ['strawberry', 'candle'],
      candleLit: true,
    },
    timeLimitSec: 35,
    rewardPoints: 300,
    hint: 'Heart Berry Velvet with Whipped Cream, Star beads, Fresh Strawberry & a Birthday Candle!',
  },
  {
    id: 4,
    customerName: 'Master Chef Zen',
    customerEmoji: '🍵',
    targetTier: {
      shape: 'round',
      sponge: 'matcha',
      frosting: 'mint',
      piping: 'swirl',
      toppings: ['cherry', 'chocolate-star', 'sprinkles'],
    },
    timeLimitSec: 30,
    rewardPoints: 350,
    hint: 'Matcha Round with Mint Buttercream, Swirl piping, Cherry, Star & Sprinkles!',
  },
  {
    id: 5,
    customerName: 'Star Princess Luna',
    customerEmoji: '👑',
    targetTier: {
      shape: 'star',
      sponge: 'vanilla',
      frosting: 'blueberry',
      piping: 'rosettes',
      toppings: ['candle', 'sprinkles', 'cherry'],
      candleLit: true,
    },
    timeLimitSec: 30,
    rewardPoints: 400,
    hint: 'Star Vanilla cake with Berry Violet frosting, Rosettes, Candle, Cherries & Sprinkles!',
  },
];

export const CakeMakingGame: React.FC<CakeMakingGameProps> = ({ highScore, onNewHighScore }) => {
  // Modes: 'rush' (Purble Place style orders), 'studio' (Creative Decorator), 'stacker' (Cake Tower Drop)
  const [activeMode, setActiveMode] = useState<'rush' | 'studio' | 'stacker'>('rush');

  // --- RUSH MODE STATE ---
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [rushScore, setRushScore] = useState(0);
  const [rushLives, setRushLives] = useState(3);
  const [rushStreak, setRushStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [rushGameOver, setRushGameOver] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{ text: string; success: boolean; scoreDelta?: number } | null>(null);

  // Active Cake in Assembly
  const [cakeTier, setCakeTier] = useState<CakeTierData>({
    shape: 'round',
    sponge: 'vanilla',
    frosting: 'vanilla',
    piping: 'none',
    toppings: [],
    candleLit: false,
  });

  // Station flow: 1: Pan & Sponge, 2: Oven Bake, 3: Frosting, 4: Piping, 5: Toppings & Inspect
  const [stationStep, setStationStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isBaking, setIsBaking] = useState(false);
  const [bakeProgress, setBakeProgress] = useState(0);
  const [hasBaked, setHasBaked] = useState(false);

  // --- STUDIO MODE STATE ---
  const [studioTiers, setStudioTiers] = useState<CakeTierData[]>([
    {
      shape: 'round',
      sponge: 'strawberry',
      frosting: 'vanilla',
      piping: 'rosettes',
      toppings: ['cherry', 'candle', 'sprinkles'],
      candleLit: true,
    },
  ]);
  const [activeStudioTierIdx, setActiveStudioTierIdx] = useState(0);
  const [cakeGreeting, setCakeGreeting] = useState('Happy Birthday!');
  const [slicesEaten, setSlicesEaten] = useState(0);
  const [studioMessage, setStudioMessage] = useState('');

  // --- STACKER MODE STATE ---
  const stackerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stackerScore, setStackerScore] = useState(0);
  const [stackerGameOver, setStackerGameOver] = useState(false);
  const [stackerPerfectStreak, setStackerPerfectStreak] = useState(0);
  const stackerStateRef = useRef({
    running: false,
    layers: [] as { x: number; y: number; width: number; height: number; color: string; frostingColor: string }[],
    craneX: 100,
    craneDirection: 1,
    craneSpeed: 3.5,
    craneWidth: 160,
    craneColor: '#f472b6',
    craneFrosting: '#fffbeb',
    platY: 340,
    animId: 0,
  });

  // Current Order for Rush mode
  const currentOrder = SAMPLE_ORDERS[currentOrderIndex % SAMPLE_ORDERS.length];

  // Rush timer countdown
  useEffect(() => {
    if (activeMode !== 'rush' || rushGameOver) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired!
          sound.playHit();
          setRushLives((lives) => {
            const nextLives = lives - 1;
            if (nextLives <= 0) {
              setRushGameOver(true);
              sound.playGameOver();
            }
            return nextLives;
          });
          setLastFeedback({ text: 'Time expired on the order! The customer left.', success: false });
          setRushStreak(0);
          // Next order
          advanceOrder();
          return 40;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMode, rushGameOver, currentOrderIndex]);

  const advanceOrder = () => {
    setCurrentOrderIndex((prev) => (prev + 1) % SAMPLE_ORDERS.length);
    const nextOrder = SAMPLE_ORDERS[(currentOrderIndex + 1) % SAMPLE_ORDERS.length];
    setTimeLeft(nextOrder.timeLimitSec);
    resetAssemblyCake();
  };

  const resetAssemblyCake = () => {
    setCakeTier({
      shape: 'round',
      sponge: 'vanilla',
      frosting: 'vanilla',
      piping: 'none',
      toppings: [],
      candleLit: false,
    });
    setStationStep(1);
    setHasBaked(false);
    setBakeProgress(0);
  };

  // Handle baking in the oven
  const handleStartBake = () => {
    if (isBaking) return;
    setIsBaking(true);
    setBakeProgress(0);
    sound.playTone(400, 600, 200, 'triangle', 0.08);

    let progress = 0;
    const bakeInterval = setInterval(() => {
      progress += 25;
      setBakeProgress(progress);
      if (progress >= 100) {
        clearInterval(bakeInterval);
        setIsBaking(false);
        setHasBaked(true);
        sound.playOvenDing();
        setStationStep(3); // Move to Frosting station
      }
    }, 200);
  };

  // Toggle Topping on the Assembly Cake
  const toggleTopping = (topping: ToppingItem) => {
    setCakeTier((prev) => {
      const exists = prev.toppings.includes(topping);
      let nextToppings: ToppingItem[];
      if (exists) {
        sound.playTrash();
        nextToppings = prev.toppings.filter((t) => t !== topping);
      } else {
        if (topping === 'sprinkles') sound.playSprinkle();
        else sound.playPlop();
        nextToppings = [...prev.toppings, topping];
      }
      return {
        ...prev,
        toppings: nextToppings,
        candleLit: topping === 'candle' ? true : prev.candleLit,
      };
    });
  };

  // Check and Serve Cake in Rush Mode
  const handleServeCake = () => {
    if (!hasBaked) {
      sound.playHit();
      setLastFeedback({ text: 'Wait! You forgot to bake the cake in the oven!', success: false });
      return;
    }

    const target = currentOrder.targetTier;
    let scoreGained = 0;
    const errors: string[] = [];

    // Check Shape
    if (cakeTier.shape === target.shape) {
      scoreGained += 50;
    } else {
      errors.push(`Shape is ${cakeTier.shape} but should be ${target.shape}`);
    }

    // Check Sponge
    if (cakeTier.sponge === target.sponge) {
      scoreGained += 50;
    } else {
      errors.push(`Sponge is ${SPONGE_COLORS[cakeTier.sponge].label}`);
    }

    // Check Frosting
    if (cakeTier.frosting === target.frosting) {
      scoreGained += 60;
    } else {
      errors.push(`Frosting is ${FROSTING_COLORS[cakeTier.frosting].label}`);
    }

    // Check Piping
    if (cakeTier.piping === target.piping) {
      scoreGained += 40;
    } else {
      errors.push(`Piping pattern is ${cakeTier.piping}`);
    }

    // Check Toppings
    const missingToppings = target.toppings.filter((t) => !cakeTier.toppings.includes(t));
    const extraToppings = cakeTier.toppings.filter((t) => !target.toppings.includes(t));

    if (missingToppings.length === 0 && extraToppings.length === 0) {
      scoreGained += 100;
    } else {
      if (missingToppings.length > 0) {
        errors.push(`Missing: ${missingToppings.map((t) => TOPPING_DETAILS[t].label).join(', ')}`);
      }
      if (extraToppings.length > 0) {
        errors.push(`Extra: ${extraToppings.map((t) => TOPPING_DETAILS[t].label).join(', ')}`);
      }
    }

    const isPerfect = errors.length === 0;

    if (isPerfect) {
      const timeBonus = timeLeft * 4;
      const streakBonus = rushStreak * 50;
      const totalScore = scoreGained + timeBonus + streakBonus;
      const newScore = rushScore + totalScore;
      setRushScore(newScore);
      setRushStreak((prev) => prev + 1);

      if (newScore > highScore) {
        onNewHighScore(newScore);
      }

      sound.playCheer();
      setLastFeedback({
        text: `PERFECT BAKE! Order matched 100%! +${totalScore} pts (Time Bonus +${timeBonus})`,
        success: true,
        scoreDelta: totalScore,
      });

      advanceOrder();
    } else {
      // Partial or failed order
      sound.playHit();
      setRushStreak(0);
      setRushLives((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setRushGameOver(true);
          sound.playGameOver();
        }
        return next;
      });
      setLastFeedback({
        text: `Customer wanted adjustments! ${errors.join('. ')}`,
        success: false,
      });
    }
  };

  const restartRushGame = () => {
    setRushScore(0);
    setRushLives(3);
    setRushStreak(0);
    setTimeLeft(45);
    setRushGameOver(false);
    setLastFeedback(null);
    setCurrentOrderIndex(0);
    resetAssemblyCake();
  };

  // --- STACKER MINI GAME LOGIC ---
  const startStackerGame = () => {
    setStackerScore(0);
    setStackerGameOver(false);
    setStackerPerfectStreak(0);

    const canvas = stackerCanvasRef.current;
    if (!canvas) return;

    const baseWidth = 180;
    const baseLayer = {
      x: (canvas.width - baseWidth) / 2,
      y: 360,
      width: baseWidth,
      height: 32,
      color: '#fde047',
      frostingColor: '#fbcfe8',
    };

    stackerStateRef.current = {
      running: true,
      layers: [baseLayer],
      craneX: 20,
      craneDirection: 1,
      craneSpeed: 3.5,
      craneWidth: baseWidth,
      craneColor: '#f472b6',
      craneFrosting: '#fffbeb',
      platY: 360 - 32,
      animId: 0,
    };

    runStackerLoop();
  };

  const dropStackerLayer = () => {
    const state = stackerStateRef.current;
    if (!state.running || stackerGameOver) return;

    const topLayer = state.layers[state.layers.length - 1];
    const dropX = state.craneX;
    const dropWidth = state.craneWidth;

    // Calculate overhang
    const diff = dropX - topLayer.x;
    const tolerance = 4; // pixels tolerance for PERFECT hit

    if (Math.abs(diff) <= tolerance) {
      // Perfect drop!
      sound.playCoin();
      setStackerScore((prev) => {
        const next = prev + 50;
        if (next > highScore) onNewHighScore(next);
        return next;
      });
      setStackerPerfectStreak((prev) => prev + 1);

      // Stack directly aligned
      state.layers.push({
        x: topLayer.x,
        y: state.platY,
        width: topLayer.width,
        height: 30,
        color: state.craneColor,
        frostingColor: state.craneFrosting,
      });
    } else if (dropX + dropWidth <= topLayer.x || dropX >= topLayer.x + topLayer.width) {
      // Completely missed!
      sound.playGameOver();
      state.running = false;
      setStackerGameOver(true);
      return;
    } else {
      // Partial overlap - slice off excess!
      sound.playDrop();
      let newWidth = 0;
      let newX = 0;

      if (diff > 0) {
        // Dropped to the right
        newX = dropX;
        newWidth = topLayer.width - diff;
      } else {
        // Dropped to the left
        newX = topLayer.x;
        newWidth = dropWidth + diff;
      }

      setStackerScore((prev) => {
        const next = prev + 20;
        if (next > highScore) onNewHighScore(next);
        return next;
      });
      setStackerPerfectStreak(0);

      state.layers.push({
        x: newX,
        y: state.platY,
        width: newWidth,
        height: 30,
        color: state.craneColor,
        frostingColor: state.craneFrosting,
      });

      state.craneWidth = newWidth;
    }

    // Move to next height or shift camera down if stack gets tall
    if (state.layers.length > 8) {
      state.layers.forEach((l) => (l.y += 30));
    } else {
      state.platY -= 30;
    }

    // Pick new fun flavor for the next swinging tier
    const colors = ['#f472b6', '#84cc16', '#78350f', '#fde047', '#38bdf8'];
    const frostings = ['#fffbeb', '#451a03', '#fbcfe8', '#a7f3d0', '#fcd34d'];
    state.craneColor = colors[Math.floor(Math.random() * colors.length)];
    state.craneFrosting = frostings[Math.floor(Math.random() * frostings.length)];
    state.craneSpeed = Math.min(7.5, 3.5 + state.layers.length * 0.25);
  };

  const runStackerLoop = () => {
    const canvas = stackerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const state = stackerStateRef.current;

      // Update crane position
      if (state.running) {
        state.craneX += state.craneSpeed * state.craneDirection;
        if (state.craneX <= 10) {
          state.craneX = 10;
          state.craneDirection = 1;
        } else if (state.craneX + state.craneWidth >= canvas.width - 10) {
          state.craneX = canvas.width - 10 - state.craneWidth;
          state.craneDirection = -1;
        }
      }

      // Clear & Draw Background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Draw Platter pedestal at bottom
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, 385, 120, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(canvas.width / 2 - 18, 385, 36, 20);

      // Draw stacked layers
      state.layers.forEach((layer) => {
        // Sponge
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.roundRect(layer.x, layer.y, layer.width, layer.height, 4);
        ctx.fill();

        // Frosting drip on top
        ctx.fillStyle = layer.frostingColor;
        ctx.fillRect(layer.x, layer.y, layer.width, 8);

        // Rosette dots
        ctx.fillStyle = '#fbcfe8';
        for (let rx = layer.x + 8; rx < layer.x + layer.width; rx += 14) {
          ctx.beginPath();
          ctx.arc(rx, layer.y + 4, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw swinging crane cake layer at top
      if (state.running) {
        // Crane wire
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(state.craneX + state.craneWidth / 2, 0);
        ctx.lineTo(state.craneX + state.craneWidth / 2, 60);
        ctx.stroke();

        // Sponge layer
        ctx.fillStyle = state.craneColor;
        ctx.beginPath();
        ctx.roundRect(state.craneX, 60, state.craneWidth, 28, 4);
        ctx.fill();

        // Frosting
        ctx.fillStyle = state.craneFrosting;
        ctx.fillRect(state.craneX, 60, state.craneWidth, 7);

        // Little Cherry on crane piece
        ctx.font = '16px sans-serif';
        ctx.fillText('🍒', state.craneX + state.craneWidth / 2 - 8, 55);
      }

      if (state.running) {
        state.animId = requestAnimationFrame(render);
      }
    };

    stackerStateRef.current.animId = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (activeMode === 'stacker') {
      startStackerGame();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' || e.key === ' ') {
          e.preventDefault();
          dropStackerLayer();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        cancelAnimationFrame(stackerStateRef.current.animId);
        stackerStateRef.current.running = false;
      };
    }
    return () => {
      cancelAnimationFrame(stackerStateRef.current.animId);
      stackerStateRef.current.running = false;
    };
  }, [activeMode]);

  // Helper renderer for SVG Cake preview in bakery stations
  const renderCakeSVG = (tier: CakeTierData, size: number = 220, showCrumb: boolean = false) => {
    const sponge = SPONGE_COLORS[tier.sponge];
    const frosting = FROSTING_COLORS[tier.frosting];
    const centerX = size / 2;
    const centerY = size / 2 + 10;
    const baseW = size * 0.72;
    const baseH = size * 0.42;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-xl overflow-visible">
        <defs>
          <filter id="cake-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.3" />
          </filter>
          <linearGradient id="platter-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <radialGradient id="candle-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Silver Pedestal / Platter */}
        <ellipse cx={centerX} cy={centerY + baseH / 2 + 20} rx={baseW * 0.65} ry={14} fill="url(#platter-metal)" stroke="#94a3b8" strokeWidth="2" />
        <path d={`M ${centerX - 24} ${centerY + baseH / 2 + 20} L ${centerX + 24} ${centerY + baseH / 2 + 20} L ${centerX + 16} ${centerY + baseH / 2 + 34} L ${centerX - 16} ${centerY + baseH / 2 + 34} Z`} fill="#94a3b8" />

        {/* Cake Body based on Shape */}
        <g filter="url(#cake-shadow)">
          {tier.shape === 'round' && (
            <g>
              {/* Sponge side */}
              <rect x={centerX - baseW / 2} y={centerY - baseH / 4} width={baseW} height={baseH} rx={8} fill={sponge.bg} stroke={sponge.border} strokeWidth="3" />
              {/* Crumb texture */}
              {showCrumb && (
                <path d={`M ${centerX} ${centerY - baseH / 4} L ${centerX + baseW / 2} ${centerY + baseH / 4} L ${centerX} ${centerY + baseH * 0.7} Z`} fill="#fbcfe8" opacity="0.4" />
              )}
              {/* Frosting Glaze Top */}
              <ellipse cx={centerX} cy={centerY - baseH / 4} rx={baseW / 2} ry={baseH / 3} fill={frosting.fill} stroke={frosting.accent} strokeWidth="3" />
              {/* Frosting Drips */}
              <path
                d={`M ${centerX - baseW / 2} ${centerY - baseH / 4} 
                    Q ${centerX - baseW / 3} ${centerY} ${centerX - baseW / 4} ${centerY - baseH / 6}
                    Q ${centerX} ${centerY + 8} ${centerX + baseW / 5} ${centerY - baseH / 6}
                    Q ${centerX + baseW / 3} ${centerY + 4} ${centerX + baseW / 2} ${centerY - baseH / 4}`}
                fill={frosting.fill}
              />
            </g>
          )}

          {tier.shape === 'square' && (
            <g>
              <rect x={centerX - baseW / 2} y={centerY - baseH / 3} width={baseW} height={baseH} rx={4} fill={sponge.bg} stroke={sponge.border} strokeWidth="3" />
              {/* Frosting Top layer */}
              <rect x={centerX - baseW / 2} y={centerY - baseH / 3} width={baseW} height={baseH * 0.4} rx={4} fill={frosting.fill} stroke={frosting.accent} strokeWidth="2" />
            </g>
          )}

          {tier.shape === 'heart' && (
            <g>
              <path
                d={`M ${centerX} ${centerY + baseH / 2} 
                    C ${centerX - baseW * 0.7} ${centerY} ${centerX - baseW * 0.6} ${centerY - baseH * 0.6} ${centerX} ${centerY - baseH * 0.2}
                    C ${centerX + baseW * 0.6} ${centerY - baseH * 0.6} ${centerX + baseW * 0.7} ${centerY} ${centerX} ${centerY + baseH / 2} Z`}
                fill={sponge.bg}
                stroke={sponge.border}
                strokeWidth="3"
              />
              <path
                d={`M ${centerX} ${centerY + baseH * 0.2} 
                    C ${centerX - baseW * 0.55} ${centerY - baseH * 0.1} ${centerX - baseW * 0.45} ${centerY - baseH * 0.5} ${centerX} ${centerY - baseH * 0.25}
                    C ${centerX + baseW * 0.45} ${centerY - baseH * 0.5} ${centerX + baseW * 0.55} ${centerY - baseH * 0.1} ${centerX} ${centerY + baseH * 0.2} Z`}
                fill={frosting.fill}
              />
            </g>
          )}

          {tier.shape === 'star' && (
            <g>
              <polygon
                points={`
                  ${centerX},${centerY - baseH * 0.65} 
                  ${centerX + baseW * 0.2},${centerY - baseH * 0.2} 
                  ${centerX + baseW * 0.6},${centerY - baseH * 0.15} 
                  ${centerX + baseW * 0.3},${centerY + baseH * 0.2} 
                  ${centerX + baseW * 0.45},${centerY + baseH * 0.6} 
                  ${centerX},${centerY + baseH * 0.35} 
                  ${centerX - baseW * 0.45},${centerY + baseH * 0.6} 
                  ${centerX - baseW * 0.3},${centerY + baseH * 0.2} 
                  ${centerX - baseW * 0.6},${centerY - baseH * 0.15} 
                  ${centerX - baseW * 0.2},${centerY - baseH * 0.2}
                `}
                fill={sponge.bg}
                stroke={sponge.border}
                strokeWidth="3"
              />
              <circle cx={centerX} cy={centerY} r={baseW * 0.3} fill={frosting.fill} />
            </g>
          )}
        </g>

        {/* Piping Patterns */}
        {tier.piping === 'rosettes' && (
          <g fill={frosting.accent} stroke="#fff" strokeWidth="1">
            {[-baseW * 0.4, -baseW * 0.25, -baseW * 0.1, baseW * 0.1, baseW * 0.25, baseW * 0.4].map((offset, i) => (
              <circle key={i} cx={centerX + offset} cy={centerY - baseH / 4 - 6} r={7} />
            ))}
          </g>
        )}

        {tier.piping === 'drizzle' && (
          <path
            d={`M ${centerX - baseW * 0.4} ${centerY - baseH * 0.3} 
                Q ${centerX - baseW * 0.2} ${centerY - baseH * 0.1} ${centerX} ${centerY - baseH * 0.3}
                Q ${centerX + baseW * 0.2} ${centerY - baseH * 0.1} ${centerX + baseW * 0.4} ${centerY - baseH * 0.3}`}
            stroke={frosting.accent}
            strokeWidth="4"
            fill="none"
            strokeDasharray="6 2"
          />
        )}

        {tier.piping === 'star-beads' && (
          <g fill="#fde047">
            {[-baseW * 0.35, -baseW * 0.18, 0, baseW * 0.18, baseW * 0.35].map((offset, i) => (
              <polygon
                key={i}
                points={`${centerX + offset},${centerY - baseH / 3 - 6} ${centerX + offset + 3},${centerY - baseH / 3} ${centerX + offset - 3},${centerY - baseH / 3}`}
              />
            ))}
          </g>
        )}

        {tier.piping === 'swirl' && (
          <path
            d={`M ${centerX} ${centerY - baseH * 0.25} m -18 0 a 18 18 0 1 0 36 0 a 14 14 0 1 0 -28 0 a 10 10 0 1 0 20 0`}
            stroke={frosting.accent}
            strokeWidth="3"
            fill="none"
          />
        )}

        {/* Sprinkles scatter */}
        {tier.toppings.includes('sprinkles') && (
          <g>
            {[-25, -12, 0, 15, 26, -18, 10, -5].map((sx, i) => (
              <circle
                key={i}
                cx={centerX + sx}
                cy={centerY - baseH * 0.25 + (i % 3) * 6 - 8}
                r={2.5}
                fill={['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7'][i % 5]}
              />
            ))}
          </g>
        )}

        {/* Cherries */}
        {tier.toppings.includes('cherry') && (
          <g>
            <circle cx={centerX - 24} cy={centerY - baseH * 0.35} r={8} fill="#e11d48" />
            <path d={`M ${centerX - 24} ${centerY - baseH * 0.35 - 7} Q ${centerX - 18} ${centerY - baseH * 0.35 - 18} ${centerX - 14} ${centerY - baseH * 0.35 - 16}`} stroke="#15803d" strokeWidth="2" fill="none" />
            <circle cx={centerX + 24} cy={centerY - baseH * 0.35} r={8} fill="#e11d48" />
            <path d={`M ${centerX + 24} ${centerY - baseH * 0.35 - 7} Q ${centerX + 30} ${centerY - baseH * 0.35 - 18} ${centerX + 34} ${centerY - baseH * 0.35 - 16}`} stroke="#15803d" strokeWidth="2" fill="none" />
          </g>
        )}

        {/* Strawberries */}
        {tier.toppings.includes('strawberry') && (
          <g>
            <path d={`M ${centerX} ${centerY - baseH * 0.45} L ${centerX - 9} ${centerY - baseH * 0.35} Q ${centerX} ${centerY - baseH * 0.22} ${centerX + 9} ${centerY - baseH * 0.35} Z`} fill="#dc2626" />
            <ellipse cx={centerX} cy={centerY - baseH * 0.45} rx={5} ry={2} fill="#16a34a" />
          </g>
        )}

        {/* Chocolate Stars */}
        {tier.toppings.includes('chocolate-star') && (
          <g fill="#451a03">
            <polygon points={`${centerX - 35},${centerY - baseH * 0.25} ${centerX - 30},${centerY - baseH * 0.28} ${centerX - 25},${centerY - baseH * 0.25} ${centerX - 27},${centerY - baseH * 0.2} ${centerX - 33},${centerY - baseH * 0.2}`} />
            <polygon points={`${centerX + 35},${centerY - baseH * 0.25} ${centerX + 40},${centerY - baseH * 0.28} ${centerX + 45},${centerY - baseH * 0.25} ${centerX + 43},${centerY - baseH * 0.2} ${centerX + 37},${centerY - baseH * 0.2}`} />
          </g>
        )}

        {/* Candle with flickering flame */}
        {tier.toppings.includes('candle') && (
          <g>
            {/* Candle stick */}
            <rect x={centerX - 3} y={centerY - baseH * 0.45 - 20} width={6} height={20} fill="#38bdf8" rx={1} stroke="#0284c7" strokeWidth="1" />
            {/* Wick */}
            <line x1={centerX} y1={centerY - baseH * 0.45 - 20} x2={centerX} y2={centerY - baseH * 0.45 - 24} stroke="#475569" strokeWidth="1.5" />
            {/* Flame */}
            {tier.candleLit && (
              <g className="animate-pulse">
                <ellipse cx={centerX} cy={centerY - baseH * 0.45 - 28} rx={14} ry={14} fill="url(#candle-glow)" />
                <path d={`M ${centerX} ${centerY - baseH * 0.45 - 34} Q ${centerX - 4} ${centerY - baseH * 0.45 - 27} ${centerX} ${centerY - baseH * 0.45 - 24} Q ${centerX + 4} ${centerY - baseH * 0.45 - 27} ${centerX} ${centerY - baseH * 0.45 - 34} Z`} fill="#f59e0b" />
                <circle cx={centerX} cy={centerY - baseH * 0.45 - 26} r={2} fill="#ffffff" />
              </g>
            )}
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center">
      {/* Top Navigation Mode Pills */}
      <div className="w-full flex items-center justify-between mb-4 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
            <Cake className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-pink-300 flex items-center gap-1.5">
              <span>Retro Bakery & Cake Factory</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Purble Place Inspired
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Bake orders, design custom cakes, or stack cake towers!
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              setActiveMode('rush');
              sound.playBounce();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMode === 'rush'
                ? 'bg-pink-500 text-slate-950 font-bold shadow-md shadow-pink-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎂 Comfy Cakes Rush
          </button>
          <button
            onClick={() => {
              setActiveMode('studio');
              sound.playBounce();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMode === 'studio'
                ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎨 Creative Studio
          </button>
          <button
            onClick={() => {
              setActiveMode('stacker');
              sound.playBounce();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeMode === 'stacker'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏗️ Cake Stacker
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: COMFY CAKES RUSH (ORDER CHALLENGE) */}
      {/* ========================================================================= */}
      {activeMode === 'rush' && (
        <div className="w-full flex flex-col gap-4">
          {/* Header Score, Streak & Order Ticket */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Customer Ticket Card */}
            <div className="md:col-span-2 bg-slate-900/90 border-2 border-pink-500/40 rounded-2xl p-3.5 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                    {currentOrder.customerEmoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-200">
                        {currentOrder.customerName}'s Order
                      </h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        +{currentOrder.rewardPoints} PTS
                      </span>
                    </div>
                    <p className="text-xs text-pink-300 font-medium mt-0.5">
                      "{currentOrder.hint}"
                    </p>
                  </div>
                </div>

                {/* Target Cake Visual Preview */}
                <div className="bg-slate-950/80 p-1.5 rounded-xl border border-slate-800 flex flex-col items-center">
                  <span className="text-[9px] text-slate-400 font-bold uppercase mb-0.5 tracking-wider">
                    Target Spec
                  </span>
                  {renderCakeSVG(currentOrder.targetTier, 75)}
                </div>
              </div>

              {/* Time Remaining Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <Clock className="w-3 h-3 text-amber-400" /> Patience Meter
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      timeLeft < 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
                    }`}
                  >
                    {timeLeft}s
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      timeLeft < 10 ? 'bg-rose-500' : timeLeft < 20 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(timeLeft / currentOrder.timeLimitSec) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Score & Bakery Stats */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Trophy className="w-4 h-4 text-amber-400" /> Bakery Tips
                </div>
                <span className="text-xl font-bold font-mono text-amber-400">
                  ${rushScore}
                </span>
              </div>

              <div className="flex items-center justify-between my-2">
                <span className="text-xs text-slate-400">Reputation</span>
                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-4 h-4 ${
                        i < rushLives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">Combo Streak</span>
                <span className="font-bold text-pink-400 font-mono">
                  🔥 {rushStreak}x
                </span>
              </div>
            </div>
          </div>

          {/* Feedback banner if available */}
          {lastFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
                lastFeedback.success
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-200'
              }`}
            >
              {lastFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{lastFeedback.text}</span>
            </div>
          )}

          {/* MAIN BAKERY ASSEMBLY WORKSHOP */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center gap-6">
            {/* Center Stage: The Live Cake Turntable */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 w-full lg:w-80 relative min-h-[280px]">
              <span className="absolute top-3 left-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-pink-400" /> Turntable 01
              </span>

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {!hasBaked ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Raw Batter
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Freshly Baked
                  </span>
                )}
              </div>

              {/* The Rendered Cake */}
              <div className="my-2">{renderCakeSVG(cakeTier, 200)}</div>

              {/* Quick Reset / Scrape Pan Lever */}
              <button
                onClick={() => {
                  sound.playTrash();
                  resetAssemblyCake();
                }}
                className="mt-2 text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Scrape and start cake over"
              >
                <Trash2 className="w-3.5 h-3.5" /> Scrape & Clean Pan
              </button>
            </div>

            {/* Right Side: Interactive Assembly Stations */}
            <div className="flex-1 w-full flex flex-col gap-3">
              {/* Station Step Indicator */}
              <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-semibold">
                {[
                  { step: 1, label: '1. Pan & Batter' },
                  { step: 2, label: '2. Oven Bake' },
                  { step: 3, label: '3. Frosting' },
                  { step: 4, label: '4. Piping' },
                  { step: 5, label: '5. Toppings' },
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => {
                      setStationStep(s.step as 1 | 2 | 3 | 4 | 5);
                      sound.playBounce();
                    }}
                    className={`py-1.5 rounded-lg text-center transition-all ${
                      stationStep === s.step
                        ? 'bg-pink-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* STATION 1: PAN & SPONGE BATTER */}
              {stationStep === 1 && (
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col gap-3 animate-fade-in">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                      Choose Pan Shape:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'round', icon: '⭕', label: 'Round' },
                        { id: 'square', icon: '⬛', label: 'Square' },
                        { id: 'heart', icon: '❤️', label: 'Heart' },
                        { id: 'star', icon: '⭐', label: 'Star' },
                      ].map((shape) => (
                        <button
                          key={shape.id}
                          onClick={() => {
                            setCakeTier((prev) => ({ ...prev, shape: shape.id as CakeShape }));
                            sound.playSquirt();
                          }}
                          className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                            cakeTier.shape === shape.id
                              ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold scale-105'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-base">{shape.icon}</span>
                          <span>{shape.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                      Dispense Sponge Batter Flavor:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(Object.keys(SPONGE_COLORS) as SpongeFlavor[]).map((flavor) => {
                        const info = SPONGE_COLORS[flavor];
                        return (
                          <button
                            key={flavor}
                            onClick={() => {
                              setCakeTier((prev) => ({ ...prev, sponge: flavor }));
                              sound.playSquirt();
                            }}
                            className={`p-2 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                              cakeTier.sponge === flavor
                                ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold scale-102'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-slate-700 shrink-0"
                              style={{ backgroundColor: info.bg }}
                            />
                            <span className="truncate">{info.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => {
                        setStationStep(2);
                        sound.playBounce();
                      }}
                      className="px-4 py-2 bg-pink-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-pink-400 transition-colors"
                    >
                      <span>Proceed to Oven</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STATION 2: OVEN BAKE */}
              {stationStep === 2 && (
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-3 animate-fade-in text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Flame className={`w-8 h-8 ${isBaking ? 'animate-bounce text-orange-500' : ''}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">
                      Industrial Convection Oven
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Bake your sponge to a golden, fluffy rise!
                    </p>
                  </div>

                  {/* Baking Progress Bar */}
                  {isBaking && (
                    <div className="w-full max-w-xs">
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-linear-to-r from-amber-500 to-orange-500 transition-all duration-200"
                          style={{ width: `${bakeProgress}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-amber-400 font-mono mt-1 block">
                        Baking... {bakeProgress}%
                      </span>
                    </div>
                  )}

                  {!hasBaked ? (
                    <button
                      onClick={handleStartBake}
                      disabled={isBaking}
                      className="px-6 py-2.5 bg-linear-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 hover:opacity-90 shadow-lg shadow-orange-500/20 transition-all"
                    >
                      <Flame className="w-4 h-4" />
                      <span>{isBaking ? 'Baking in Progress...' : 'Start Oven Bake!'}</span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Freshly Baked & Ready to Frost!
                      </span>
                      <button
                        onClick={() => {
                          setStationStep(3);
                          sound.playBounce();
                        }}
                        className="px-4 py-2 bg-pink-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <span>Go to Frosting Station</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STATION 3: FROSTING & GLAZE */}
              {stationStep === 3 && (
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col gap-3 animate-fade-in">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Choose Frosting Coat:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(Object.keys(FROSTING_COLORS) as FrostingFlavor[]).map((flavor) => {
                      const info = FROSTING_COLORS[flavor];
                      return (
                        <button
                          key={flavor}
                          onClick={() => {
                            setCakeTier((prev) => ({ ...prev, frosting: flavor }));
                            sound.playSquirt();
                          }}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                            cakeTier.frosting === flavor
                              ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold scale-102'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-slate-700 shrink-0"
                            style={{ backgroundColor: info.fill }}
                          />
                          <span className="truncate">{info.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <button
                      onClick={() => setStationStep(2)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      ← Back to Oven
                    </button>
                    <button
                      onClick={() => {
                        setStationStep(4);
                        sound.playBounce();
                      }}
                      className="px-4 py-2 bg-pink-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-pink-400 transition-colors"
                    >
                      <span>Proceed to Piping</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STATION 4: PIPING PATTERN */}
              {stationStep === 4 && (
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col gap-3 animate-fade-in">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Select Decorative Piping Border:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'No Piping', icon: '⭕' },
                      { id: 'rosettes', label: 'Rosette Border', icon: '🍥' },
                      { id: 'drizzle', label: 'Caramel Drizzle', icon: '〰️' },
                      { id: 'star-beads', label: 'Star Beads', icon: '✨' },
                      { id: 'swirl', label: 'Center Swirl', icon: '🌀' },
                    ].map((pipe) => (
                      <button
                        key={pipe.id}
                        onClick={() => {
                          setCakeTier((prev) => ({ ...prev, piping: pipe.id as PipingPattern }));
                          sound.playSquirt();
                        }}
                        className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                          cakeTier.piping === pipe.id
                            ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold scale-102'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{pipe.icon}</span>
                        <span>{pipe.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <button
                      onClick={() => setStationStep(3)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      ← Back to Frosting
                    </button>
                    <button
                      onClick={() => {
                        setStationStep(5);
                        sound.playBounce();
                      }}
                      className="px-4 py-2 bg-pink-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-pink-400 transition-colors"
                    >
                      <span>Proceed to Toppings</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STATION 5: TOPPINGS & SERVE */}
              {stationStep === 5 && (
                <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col gap-3 animate-fade-in">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Garnish with Toppings (Tap to Toggle):
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(Object.keys(TOPPING_DETAILS) as ToppingItem[]).map((top) => {
                      const item = TOPPING_DETAILS[top];
                      const isSelected = cakeTier.toppings.includes(top);
                      return (
                        <button
                          key={top}
                          onClick={() => toggleTopping(top)}
                          className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold scale-105 shadow-md shadow-amber-500/20'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-[10px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quality Check & Serve Button */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setStationStep(4)}
                      className="text-xs text-slate-400 hover:text-slate-200"
                    >
                      ← Back to Piping
                    </button>
                    <button
                      onClick={handleServeCake}
                      className="px-6 py-2.5 bg-linear-to-r from-pink-500 to-emerald-500 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 hover:opacity-95 shadow-lg shadow-pink-500/25 transition-all scale-102"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Ring Bell & Deliver Order!</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Over Modal */}
          {rushGameOver && (
            <div className="p-6 bg-slate-900/95 border border-rose-500/50 rounded-2xl flex flex-col items-center text-center gap-3">
              <span className="text-4xl">🏪</span>
              <h3 className="text-lg font-bold text-rose-400">Bakery Closed for Today!</h3>
              <p className="text-xs text-slate-300 max-w-md">
                Customers grew too impatient or received mismatched cakes. You completed multiple orders and earned{' '}
                <span className="text-amber-400 font-bold">${rushScore}</span> in bakery tips!
              </p>
              <button
                onClick={restartRushGame}
                className="px-5 py-2.5 bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors mt-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Open Bakery Again</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CREATIVE CAKE STUDIO (FREE DECORATOR) */}
      {/* ========================================================================= */}
      {activeMode === 'studio' && (
        <div className="w-full flex flex-col gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center gap-6">
            {/* Left Decorator Canvas */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/70 rounded-2xl border border-slate-800/80 w-full lg:w-96 relative">
              <span className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-400" /> Custom Tier Decorator
              </span>

              {/* Inscription Ribbon */}
              {cakeGreeting && (
                <div className="mb-2 px-3 py-1 bg-amber-400 text-slate-950 font-arcade text-xs rounded-full shadow-md font-bold tracking-tight">
                  {cakeGreeting}
                </div>
              )}

              {/* The Rendered Cake */}
              <div className="my-2">
                {renderCakeSVG(studioTiers[activeStudioTierIdx], 230, slicesEaten > 0)}
              </div>

              {/* Interactive Slices & Candle Actions */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => {
                    sound.playBite();
                    setSlicesEaten((prev) => prev + 1);
                    setStudioMessage('Delicious! You took a slice of the cake!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-semibold hover:bg-pink-500/30 transition-colors flex items-center gap-1"
                >
                  <span>🍰 Cut & Taste ({slicesEaten})</span>
                </button>

                <button
                  onClick={() => {
                    setStudioTiers((prev) => {
                      const next = [...prev];
                      const cur = next[activeStudioTierIdx];
                      const lit = !cur.candleLit;
                      next[activeStudioTierIdx] = { ...cur, candleLit: lit };
                      if (lit) sound.playTone(600, 800, 100, 'sine', 0.1);
                      else sound.playTone(300, 150, 120, 'sawtooth', 0.08);
                      return next;
                    });
                    setStudioMessage('Flickered the birthday candle flame!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Toggle Candle</span>
                </button>
              </div>

              {studioMessage && (
                <p className="text-[11px] text-slate-400 mt-2 text-center animate-fade-in">
                  {studioMessage}
                </p>
              )}
            </div>

            {/* Right Controls */}
            <div className="flex-1 w-full flex flex-col gap-4 text-xs">
              {/* Inscription Ribbon Input */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="font-semibold text-slate-300 block mb-1">
                  Cake Ribbon Greeting Inscription:
                </label>
                <input
                  type="text"
                  value={cakeGreeting}
                  onChange={(e) => setCakeGreeting(e.target.value)}
                  placeholder="e.g. Happy Birthday Sarah!"
                  maxLength={30}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-hidden focus:border-purple-500"
                />
              </div>

              {/* Shape & Sponge */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
                <label className="font-semibold text-slate-300 block">Sponge & Pan:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['round', 'square', 'heart', 'star'] as CakeShape[]).map((shape) => (
                    <button
                      key={shape}
                      onClick={() => {
                        setStudioTiers((prev) => {
                          const next = [...prev];
                          next[activeStudioTierIdx] = { ...next[activeStudioTierIdx], shape };
                          return next;
                        });
                        sound.playSquirt();
                      }}
                      className={`p-2 rounded-lg border text-center capitalize ${
                        studioTiers[activeStudioTierIdx].shape === shape
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                  {(Object.keys(SPONGE_COLORS) as SpongeFlavor[]).map((sp) => (
                    <button
                      key={sp}
                      onClick={() => {
                        setStudioTiers((prev) => {
                          const next = [...prev];
                          next[activeStudioTierIdx] = { ...next[activeStudioTierIdx], sponge: sp };
                          return next;
                        });
                        sound.playSquirt();
                      }}
                      className={`p-2 rounded-lg border text-[11px] truncate flex items-center gap-1.5 ${
                        studioTiers[activeStudioTierIdx].sponge === sp
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: SPONGE_COLORS[sp].bg }}
                      />
                      <span>{sp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frosting & Toppings Palette */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
                <label className="font-semibold text-slate-300 block">Frosting & Glaze Flavor:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(FROSTING_COLORS) as FrostingFlavor[]).map((fr) => (
                    <button
                      key={fr}
                      onClick={() => {
                        setStudioTiers((prev) => {
                          const next = [...prev];
                          next[activeStudioTierIdx] = { ...next[activeStudioTierIdx], frosting: fr };
                          return next;
                        });
                        sound.playSquirt();
                      }}
                      className={`p-2 rounded-lg border text-[11px] truncate flex items-center gap-1.5 ${
                        studioTiers[activeStudioTierIdx].frosting === fr
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: FROSTING_COLORS[fr].fill }}
                      />
                      <span>{FROSTING_COLORS[fr].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toppings Picker */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Tap Toppings to Place:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(Object.keys(TOPPING_DETAILS) as ToppingItem[]).map((top) => {
                    const isSelected = studioTiers[activeStudioTierIdx].toppings.includes(top);
                    return (
                      <button
                        key={top}
                        onClick={() => {
                          setStudioTiers((prev) => {
                            const next = [...prev];
                            const cur = next[activeStudioTierIdx];
                            const exists = cur.toppings.includes(top);
                            let newTops = exists
                              ? cur.toppings.filter((t) => t !== top)
                              : [...cur.toppings, top];
                            if (!exists) {
                              if (top === 'sprinkles') sound.playSprinkle();
                              else sound.playPlop();
                            } else sound.playTrash();
                            next[activeStudioTierIdx] = {
                              ...cur,
                              toppings: newTops,
                              candleLit: top === 'candle' ? true : cur.candleLit,
                            };
                            return next;
                          });
                        }}
                        className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="text-base">{TOPPING_DETAILS[top].icon}</span>
                        <span className="text-[10px]">{TOPPING_DETAILS[top].label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: CAKE STACKER (TOWER DROP ARCADE) */}
      {/* ========================================================================= */}
      {activeMode === 'stacker' && (
        <div className="w-full flex flex-col items-center gap-4">
          <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            {/* Top Score & Streak */}
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <div>
                <span className="text-xs text-slate-400">Tiers Stacked</span>
                <div className="text-xl font-bold font-mono text-amber-400">
                  {stackerScore} PTS
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Perfect Streak</span>
                <div className="text-xl font-bold font-mono text-pink-400">
                  ⭐ {stackerPerfectStreak}
                </div>
              </div>
            </div>

            {/* Canvas Stage */}
            <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
              <canvas
                ref={stackerCanvasRef}
                width={400}
                height={420}
                className="w-full max-w-[400px] h-[360px] sm:h-[420px] block"
              />

              {/* Game Over Screen */}
              {stackerGameOver && (
                <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <span className="text-4xl mb-2">🍰💥</span>
                  <h3 className="text-lg font-bold text-rose-400 mb-1">
                    The Cake Tower Toppled!
                  </h3>
                  <p className="text-xs text-slate-300 mb-4">
                    Final Height Score: <span className="text-amber-400 font-bold">{stackerScore}</span>
                  </p>
                  <button
                    onClick={startStackerGame}
                    className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-amber-400 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Drop Another Cake!</span>
                  </button>
                </div>
              )}
            </div>

            {/* Drop Action Button for Mobile/Touch */}
            {!stackerGameOver && (
              <button
                onClick={dropStackerLayer}
                className="w-full max-w-xs mt-4 py-3 bg-linear-to-r from-amber-500 to-pink-500 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>DROP TIER NOW! (OR SPACEBAR)</span>
              </button>
            )}

            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Time the swinging cake layer to align directly over the platter. Overhang edges will be trimmed away!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
