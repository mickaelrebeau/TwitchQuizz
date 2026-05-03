/**
 * Barre de progression "hack" (0–100 %).
 * Affiche la phase, le type de puzzle et un indicateur boss.
 */

import type { HackState } from "../types/socket";

interface HackProgressBarProps {
  hackState: HackState | undefined;
  className?: string;
}

export function HackProgressBar({ hackState, className = "" }: HackProgressBarProps) {
  if (!hackState) return null;

  const { hackProgress, phase, difficulty, currentPuzzle, bossPhaseActive, bossHints } = hackState;
  const percent = Math.min(100, Math.max(0, hackProgress));

  return (
    <div className={`font-mono ${className}`} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Hack progress">
      <div className="flex items-center justify-between text-sm text-[#8b949e] mb-1">
        <span>
          Phase {phase} · {difficulty}
          {currentPuzzle && (
            <span className="ml-2 text-[#58a6ff]">
              [{currentPuzzle.type}]
            </span>
          )}
        </span>
        <span className="text-white font-semibold">{Math.round(percent)}%</span>
      </div>
      <div className="h-4 bg-[#21262d] rounded-md overflow-hidden border border-[#30363d]">
        <div
          className={`h-full transition-all duration-500 ${
            bossPhaseActive ? "bg-[#da3633]" : "bg-[#238636]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {bossPhaseActive && (
        <p className="text-[#f85149] text-sm mt-1 font-semibold" role="status">
          🎯 Boss phase · Indices: {bossHints}/2
        </p>
      )}
    </div>
  );
}
