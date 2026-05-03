/**
 * Classement ordonné : titre sémantique + liste (rang | pseudo | score).
 * Les trois premières lignes utilisent la variante top3 (orange, plus grand).
 */

import type { LeaderboardEntry } from "../types/socket";
import { LeaderboardRow } from "./LeaderboardRow";

export interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

export function Leaderboard({ leaderboard }: LeaderboardProps) {
  return (
    <section className="w-full max-w-md" aria-labelledby="leaderboard-title">
      <h2
        id="leaderboard-title"
        className="text-2xl md:text-3xl font-bold text-white mb-4 font-mono tracking-tight"
      >
        LEADERBOARD
      </h2>
      <ol className="list-none p-0 m-0 space-y-0 rounded-lg bg-[#161b22]/80 border border-[#30363d]">
        {leaderboard.length === 0 ? (
          <li className="py-4 px-3 font-mono text-base text-[#a0aec0] text-center">
            Aucun joueur pour l&apos;instant
          </li>
        ) : (
          leaderboard.map((entry) => (
            <LeaderboardRow
              key={entry.playerId}
              entry={entry}
              variant={entry.rank <= 3 ? "top3" : "default"}
            />
          ))
        )}
      </ol>
    </section>
  );
}
