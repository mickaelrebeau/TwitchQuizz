/**
 * Types alignés sur les payloads serveur (camelCase).
 * Server: server/src/socket/socketHandlers.ts
 */

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  score: number;
}

export type GameState = "playing" | "ended" | "waiting";

export type ConnectionStatus = "connected" | "degraded" | "disconnected";

export type PuzzleType = "decode" | "cipher" | "binary" | "quiz";
export type Difficulty = "easy" | "medium" | "hard";

/** État hack (phase, barre, boss). */
export interface HackState {
  phase: 1 | 2;
  difficulty: Difficulty;
  hackProgress: number;
  currentPuzzle: {
    type: PuzzleType;
    data: string;
    prompt: string;
    difficulty: Difficulty;
  } | null;
  correctAnswers: number;
  totalAnswers: number;
  bossPhaseActive: boolean;
  bossHints: number;
  puzzleOpenedAt: number | null;
}

/** Payload leaderboard:update */
export interface LeaderboardUpdatePayload {
  leaderboard: LeaderboardEntry[];
}

/** Payload game:state */
export interface GameStatePayload {
  gameState: GameState;
  currentQuestionIndex?: number;
  questionOpenedAt?: number | null;
  questionText?: string | null;
  totalQuestions?: number;
  questionDurationMs?: number;
  hackState?: HackState;
}

/** Config de la partie (setup). */
export interface GameSetup {
  questionDurationMs: number;
  numberOfQuestions: number;
  maxAvailableQuestions?: number;
}

/** Payload connection:degraded */
export interface ConnectionDegradedPayload {
  reason: string;
}
