import React, { useState } from 'react';
import { GAME_IDEAS } from '../../data/gameIdeas';
import { GameIdea, GameType } from '../../types';
import {
  Search,
  Gamepad2,
  Sparkles,
  Zap,
  Code2,
  Lightbulb,
  Play,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight,
  Check,
  Copy,
} from 'lucide-react';

interface IdeasExplorerProps {
  onLaunchGame: (gameId: GameType) => void;
}

export const IdeasExplorer: React.FC<IdeasExplorerProps> = ({ onLaunchGame }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIdea, setActiveIdea] = useState<GameIdea | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const categories = ['All', 'Arcade', 'Physics', 'Puzzle', 'Platformer', 'Action'];

  const filteredIdeas = GAME_IDEAS.filter((idea) => {
    const matchesCategory =
      selectedCategory === 'All' || idea.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyBadge = (difficulty: GameIdea['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            Beginner (1-2 days)
          </span>
        );
      case 'Intermediate':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/60 border border-amber-500/30 text-amber-400">
            Intermediate (3-5 days)
          </span>
        );
      case 'Advanced':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/60 border border-rose-500/30 text-rose-400">
            Advanced (1-2 weeks)
          </span>
        );
    }
  };

  const copyPrompt = (idea: GameIdea) => {
    const promptText = `I want to build a browser-based "${idea.title}" mini game using HTML5 Canvas and React in Google AI Studio. 
Original mechanic: ${idea.coreMechanic}
Modern twists to incorporate: 
1. ${idea.modernTwists[0]}
2. ${idea.modernTwists[1]}
Math/Algorithm guidance: ${idea.mathAndLogic.join('; ')}
Please write clean, responsive TypeScript code with keyboard and mobile touch controls, retro sound effects, and high score tracking.`;

    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(idea.id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  return (
    <div id="ideas-explorer-section" className="w-full max-w-5xl mx-auto py-4 px-2">
      {/* Header Banner */}
      <div className="mb-6 bg-linear-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Lightbulb className="w-4 h-4" />
              <span>Classic Mini Game Design Matrix</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              16 Classic Browser Game Archetypes & Modern Twists
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Curated ideas in the same lightweight browser-playable segment as Snake, Tetris, Bounce Ball, and Mario Runner, complete with physics blueprints, AI twists, and implementation blueprints.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>4 Instantly Playable in Top Arcade</span>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search concepts or mechanics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Grid of Idea Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => {
          const isPlayable = !!idea.playableInApp;

          return (
            <div
              key={idea.id}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 ${
                isPlayable
                  ? 'bg-slate-900/90 border-slate-700 hover:border-amber-500/50 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Card Top Row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                      {idea.category}
                    </span>
                    {isPlayable && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Play className="w-2.5 h-2.5 fill-current" /> PLAYABLE
                      </span>
                    )}
                  </div>
                  {getDifficultyBadge(idea.difficulty)}
                </div>

                {/* Title & Origin */}
                <h3 className="font-bold text-slate-100 text-base group-hover:text-amber-400 transition-colors">
                  {idea.title}
                </h3>
                <div className="text-[11px] text-slate-400 mb-2">
                  Origin: <span className="text-slate-300 font-medium">{idea.originalInspiration}</span>
                </div>

                {/* Summary */}
                <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                  {idea.summary}
                </p>

                {/* Modern Twist Highlight */}
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs mb-3">
                  <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" /> Creative Twist:
                  </div>
                  <p className="text-slate-400 text-[11px] line-clamp-2">
                    {idea.modernTwists[0]}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 mt-2">
                <button
                  onClick={() => setActiveIdea(idea)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  View Blueprint
                </button>

                {isPlayable && (
                  <button
                    onClick={() => onLaunchGame(idea.playableInApp!)}
                    className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Play
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Blueprint Detail Modal */}
      {activeIdea && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-y-auto p-6 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {activeIdea.category}
                  </span>
                  {getDifficultyBadge(activeIdea.difficulty)}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-arcade">
                  {activeIdea.title}
                </h2>
                <div className="text-xs text-slate-400 mt-1">
                  Original Genesis: {activeIdea.originalInspiration}
                </div>
              </div>

              <button
                onClick={() => setActiveIdea(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Core Loop Breakdown */}
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-4 h-4" /> Core Game Loop & State Mechanics
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {activeIdea.coreMechanic}
                </p>
              </div>

              {/* 3 Modern Twists */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-cyan-400 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4" /> Modern Creative Twists (Elevate the Classic)
                </h4>
                <ul className="space-y-2">
                  {activeIdea.modernTwists.map((twist, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{twist}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Math & Algorithms */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <Code2 className="w-4 h-4" /> Mathematics, Physics & Algorithms
                </h4>
                <div className="space-y-1.5 font-mono text-xs text-slate-300">
                  {activeIdea.mathAndLogic.map((formula, idx) => (
                    <div key={idx} className="bg-slate-900/90 p-2 rounded border border-slate-800">
                      {formula}
                    </div>
                  ))}
                </div>
              </div>

              {/* Browser Advantage */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                  <Layers className="w-4 h-4 text-amber-400" /> HTML5 Browser Execution Notes
                </h4>
                <p className="text-slate-400">
                  {activeIdea.browserAdvantage}
                </p>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => copyPrompt(activeIdea)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                {copiedPromptId === activeIdea.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Copied AI Studio Prompt!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-400" />
                    Copy Ready AI Studio Prompt
                  </>
                )}
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                {activeIdea.playableInApp && (
                  <button
                    onClick={() => {
                      const game = activeIdea.playableInApp!;
                      setActiveIdea(null);
                      onLaunchGame(game);
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Launch Playable Version
                  </button>
                )}
                <button
                  onClick={() => setActiveIdea(null)}
                  className="px-4 py-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
