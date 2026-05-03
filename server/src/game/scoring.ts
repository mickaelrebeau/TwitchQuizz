/**
 * Points par rapidité et difficulté. Plus rapide = plus de points.
 * Bonus streak pour réponses consécutives correctes.
 */

import type { Difficulty } from "./puzzles/types";

const BASE_MAX_POINTS = 100;
const EASY_MULTIPLIER = 1;
const MEDIUM_MULTIPLIER = 1.5;
const HARD_MULTIPLIER = 2;
const STREAK_BONUS_PER_STEP = 5;
const MAX_STREAK_BONUS = 50;

/**
 * Multiplicateur selon la difficulté du puzzle.
 */
export function getDifficultyMultiplier(difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      return EASY_MULTIPLIER;
    case "medium":
      return MEDIUM_MULTIPLIER;
    case "hard":
      return HARD_MULTIPLIER;
    default:
      return 1;
  }
}

/**
 * Points selon le temps de réponse et la difficulté.
 * @param openedAt - Timestamp (ms) ouverture du puzzle
 * @param answeredAt - Timestamp (ms) réponse
 * @param difficulty - Difficulté du puzzle
 * @param streak - Nombre de réponses correctes consécutives (bonus)
 */
export function computePoints(
  openedAt: number,
  answeredAt: number,
  difficulty: Difficulty,
  streak: number
): number {
  if (answeredAt < openedAt) return 0;
  const responseTimeMs = answeredAt - openedAt;
  const responseTimeSeconds = Math.floor(responseTimeMs / 1000);
  const base = Math.max(0, BASE_MAX_POINTS - responseTimeSeconds);
  const mult = getDifficultyMultiplier(difficulty);
  const streakBonus = Math.min(MAX_STREAK_BONUS, Math.max(0, streak - 1) * STREAK_BONUS_PER_STEP);
  return Math.floor((base * mult) + streakBonus);
}
