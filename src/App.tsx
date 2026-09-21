import React, { useState, useEffect } from 'react';
import { GameType, HighScores } from './types';
import { CakeMakingGame } from './components/games/CakeMakingGame';
import { SnakeGame } from './components/games/SnakeGame';
import { BreakoutGame } from './components/games/BreakoutGame';
import { PlatformRunnerGame } from './components/games/PlatformRunnerGame';
import { TetrisGame } from './components/games/TetrisGame';
import { IdeasExplorer } from './components/ideas/IdeasExplorer';
import { sound } from './utils/sound';
import {
  Volume2,
  VolumeX,
  Tv,
  Gamepad2,
  Lightbulb,
  Sparkles,
  Trophy,
  Keyboard,
  Info,
  Layers,
  Cake,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<GameType | 'ideas'>('cakemaker');
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [crtEnabled, setCrtEnabled] = useState(false);

  // High score tracking with local storage
  const [highScores, setHighScores] = useState<HighScores>(() => {
    try {
      const stored = localStorage.getItem('retro_arcade_highscores');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return {
      cakemaker: 550,
      snake: 120,
      breakout: 340,
      runner: 850,
      tetris: 1200,
    };
  });

  const handleUpdateHighScore = (game: GameType, score: number) => {
    setHighScores((prev) => {
      if (score > prev[game]) {
        const next = { ...prev, [game]: score };
        try {
          localStorage.setItem('retro_arcade_highscores', JSON.stringify(next));
        } catch {}
        return next;
      }
      return prev;
    });
  };

  const toggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sound.playCoin();
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center select-none ${crtEnabled ? 'crt-effect' : ''}`}>
      {/* Top Arcade Marquee & Navigation */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-arcade text-amber-400 text-sm sm:text-base tracking-tight arcade-glow">
                  RETRO ARCADE
                </h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  BROWSER READY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Play Classic Mini Games & Explore 16 Arcade Archetypes
              </p>
            </div>
          </div>

          {/* Quick Action Toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCrtEnabled((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border transition-colors ${
                crtEnabled
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle retro CRT scanlines"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>CRT: {crtEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={toggleSound}
              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border transition-colors ${
                !isMuted
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle retro sound synthesizer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Muted' : '8-Bit FX'}</span>
            </button>
          </div>
        </div>

        {/* Game Selection Tabs Bar */}
        <div className="max-w-6xl mx-auto px-4 pb-2 pt-1 flex items-center justify-start md:justify-center overflow-x-auto gap-2 scrollbar-none">
          <button
            onClick={() => {
              setActiveTab('cakemaker');
              sound.playBounce();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'cakemaker'
                ? 'bg-pink-500 text-slate-950 font-bold shadow-lg shadow-pink-500/25 scale-102 ring-2 ring-pink-400/50'
                : 'bg-slate-900/80 text-pink-300 hover:bg-slate-800 border border-pink-500/30'
            }`}
          >
            <span>🎂</span> Cake Bakery (Comfy Cakes)
          </button>

          <button
            onClick={() => {
              setActiveTab('snake');
              sound.playBounce();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'snake'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 scale-102'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>🐍</span> Classic Snake
          </button>

          <button
            onClick={() => {
              setActiveTab('breakout');
              sound.playBounce();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'breakout'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 scale-102'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>🧱</span> Breakout Bounce
          </button>

          <button
            onClick={() => {
              setActiveTab('runner');
              sound.playBounce();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'runner'
                ? 'bg-rose-500 text-slate-950 font-bold shadow-lg shadow-rose-500/20 scale-102'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>🏃</span> Mini Mario Runner
          </button>

          <button
            onClick={() => {
              setActiveTab('tetris');
              sound.playBounce();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'tetris'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-102'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <span>🧩</span> Falling Blocks (Tetris)
          </button>

          <button
            onClick={() => {
              setActiveTab('ideas');
              sound.playBounce();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ideas'
                ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 scale-102'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Game Ideas & Blueprints (16)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col items-center">
        {activeTab === 'cakemaker' && (
          <CakeMakingGame
            highScore={highScores.cakemaker}
            onNewHighScore={(score) => handleUpdateHighScore('cakemaker', score)}
          />
        )}

        {activeTab === 'snake' && (
          <SnakeGame
            highScore={highScores.snake}
            onNewHighScore={(score) => handleUpdateHighScore('snake', score)}
          />
        )}

        {activeTab === 'breakout' && (
          <BreakoutGame
            highScore={highScores.breakout}
            onNewHighScore={(score) => handleUpdateHighScore('breakout', score)}
          />
        )}

        {activeTab === 'runner' && (
          <PlatformRunnerGame
            highScore={highScores.runner}
            onNewHighScore={(score) => handleUpdateHighScore('runner', score)}
          />
        )}

        {activeTab === 'tetris' && (
          <TetrisGame
            highScore={highScores.tetris}
            onNewHighScore={(score) => handleUpdateHighScore('tetris', score)}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeasExplorer
            onLaunchGame={(game) => {
              setActiveTab(game);
              sound.playScore();
            }}
          />
        )}

        {/* Global Keybinds & Arcade Info Panel (shown under games) */}
        {activeTab !== 'ideas' && (
          <div className="mt-8 w-full max-w-lg p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5 text-amber-400" /> Universal Controls
              </span>
              <button
                onClick={() => setActiveTab('ideas')}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Browse 16 More Game Ideas</span>
                <span>→</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                  Arrow Keys / WASD
                </span>{' '}
                Move / Steer
              </div>
              <div>
                <span className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                  Space
                </span>{' '}
                Action / Jump / Hard Drop
              </div>
              <div>
                <span className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                  P
                </span>{' '}
                Pause Game
              </div>
              <div>
                <span className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded border border-slate-800">
                  Touch / Drag
                </span>{' '}
                Full Mobile On-Screen Support
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          Built for Google AI Studio • Pure HTML5 Canvas 2D + Web Audio API • 0 external game engine dependencies
        </p>
      </footer>
    </div>
  );
}
