/**
 * Indicateur d'état de partie : Partie en cours, question affichée, timer, Terminée, En attente.
 */

import { useEffect, useState } from "react";
import type { GameState } from "../types/socket";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface GameStateHeaderProps {
  gameState: GameState;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  questionOpenedAt?: number;
  questionText?: string | null;
  questionDurationMs?: number;
}

export function GameStateHeader({
  gameState,
  currentQuestionIndex = 0,
  totalQuestions,
  questionOpenedAt,
  questionText,
  questionDurationMs = 5 * 60 * 1000,
}: GameStateHeaderProps) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    if (gameState !== "playing" || typeof questionOpenedAt !== "number" || questionDurationMs <= 0) {
      setRemainingMs(null);
      return;
    }
    const endAt = questionOpenedAt + questionDurationMs;
    const tick = () => {
      const now = Date.now();
      if (now >= endAt) {
        setRemainingMs(0);
        return;
      }
      setRemainingMs(endAt - now);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [gameState, questionOpenedAt, questionDurationMs]);

  const label =
    gameState === "playing"
      ? typeof currentQuestionIndex === "number"
        ? typeof totalQuestions === "number" && totalQuestions > 0
          ? `Question ${currentQuestionIndex + 1} / ${totalQuestions}`
          : `Question ${currentQuestionIndex + 1}`
        : "Partie en cours"
      : gameState === "ended"
        ? "Terminée"
        : "En attente";

  return (
    <div className="font-mono text-base text-[#00d4ff] mb-4 space-y-2" role="status" aria-live="polite">
      <p>{label}</p>
      {gameState === "playing" && (questionText ?? "").trim() && (
        <p className="text-white text-lg max-w-2xl">{questionText}</p>
      )}
      {gameState === "playing" && remainingMs !== null && (
        <p
          className={
            remainingMs <= 5000
              ? "text-[#f85149] font-semibold text-xl tabular-nums"
              : "text-[#00d4ff] text-xl tabular-nums"
          }
        >
          {formatRemaining(remainingMs)}
        </p>
      )}
    </div>
  );
}
