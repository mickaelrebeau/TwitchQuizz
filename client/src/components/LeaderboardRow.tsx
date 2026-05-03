/**
 * Une ligne du classement : rang | pseudo | score.
 * Variante top3 : style distinct (orange, taille plus grande) pour les trois premiers.
 */

import type { LeaderboardEntry } from "../types/socket";

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  variant?: "top3" | "default";
}

export function LeaderboardRow({ entry, variant = "default" }: LeaderboardRowProps) {
  const isTop3 = variant === "top3";

  return (
    <li
      className={
        isTop3
          ? "flex items-center justify-between gap-4 py-2 px-3 rounded font-mono text-lg md:text-xl text-[#ff8c00] font-semibold"
          : "flex items-center justify-between gap-4 py-1.5 px-3 font-mono text-base text-[#e6edf3]"
      }
      aria-label={`Rang ${entry.rank}, ${entry.displayName}, ${entry.score} points`}
    >
      <span className="tabular-nums w-8 shrink-0">{entry.rank}</span>
      <span className="min-w-0 truncate flex-1 text-center">{entry.displayName}</span>
      <span className="tabular-nums w-16 shrink-0 text-right">{entry.score}</span>
    </li>
  );
}
