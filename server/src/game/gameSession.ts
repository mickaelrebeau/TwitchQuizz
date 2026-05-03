/**
 * Session de jeu : hack progress, phases, boss, puzzles générés.
 * Joueurs : !join, réponses via !r. Timer : passage auto au puzzle suivant à l'expiration.
 * Émission Socket.IO via socketHandlers.
 */

import type { Puzzle, Difficulty } from "./puzzles/types";
import * as puzzles from "./puzzles";
import * as scoring from "./scoring";
import * as socketHandlers from "../socket/socketHandlers";

export type GameState = "waiting" | "playing" | "ended";

export interface Player {
  playerId: string;
  displayName: string;
  score: number;
  /** Réponses correctes consécutives (pour bonus et badges) */
  streak: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  score: number;
}

export interface GameSetup {
  questionDurationMs: number;
  numberOfQuestions: number;
}

/** État hack pour API / overlay (phase, barre, boss). */
export interface HackState {
  phase: 1 | 2;
  difficulty: Difficulty;
  hackProgress: number;
  currentPuzzle: {
    type: Puzzle["type"];
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

const DEFAULT_QUESTION_DURATION_MS = 5 * 60 * 1000;
const DEFAULT_NUMBER_OF_QUESTIONS = 15;
const MIN_QUESTION_DURATION_MS = 10 * 1000;
const MAX_QUESTION_DURATION_MS = 10 * 60 * 1000;

/** Phase 1 : 5 correct = 50%, puis Boss. Phase 2 : 15 correct = 100%, puis Final Boss. */
const PHASE1_CORRECT_TO_50 = 5;
const PHASE2_CORRECT_TO_100 = 15;
const HACK_PERCENT_PER_CORRECT_P1 = 10;
const HACK_PERCENT_PER_CORRECT_P2 = 100 / PHASE2_CORRECT_TO_100;
const MAX_BOSS_HINTS = 2;

let gameSetup: GameSetup = {
  questionDurationMs: DEFAULT_QUESTION_DURATION_MS,
  numberOfQuestions: DEFAULT_NUMBER_OF_QUESTIONS,
};

let sessionQuestionDurationMs = DEFAULT_QUESTION_DURATION_MS;
let sessionNumberOfQuestions = DEFAULT_NUMBER_OF_QUESTIONS;

let state: GameState = "waiting";
const players = new Map<string, Player>();
/** Réponses déjà comptées : playerId -> Set<puzzleId> */
const responses = new Map<string, Set<number>>();
/** Retry utilisés : playerId -> Set<puzzleId> (1 retry par puzzle par joueur) */
const retriesUsed = new Map<string, Set<number>>();

let phase: 1 | 2 = 1;
let difficulty: Difficulty = "easy";
let hackProgress = 0;
let currentPuzzle: Puzzle | null = null;
let puzzleOpenedAt: number | null = null;
let correctAnswers = 0;
let totalAnswers = 0;
let bossPhaseActive = false;
let bossHints = 0;
/** Identifiant unique du puzzle courant (pour éviter double comptage) */
let currentPuzzleId = 0;

/** Numéro de la question affichée (0-based). Question 1 = 0, utilisé pour l'affichage et la limite. */
let currentPuzzleIndex = 0;

/** Timer pour passer automatiquement au puzzle suivant à l'expiration. */
let puzzleTimerHandle: ReturnType<typeof setTimeout> | null = null;

function clearPuzzleTimer(): void {
  if (puzzleTimerHandle !== null) {
    clearTimeout(puzzleTimerHandle);
    puzzleTimerHandle = null;
  }
}

function schedulePuzzleTimer(): void {
  clearPuzzleTimer();
  if (state !== "playing" || sessionQuestionDurationMs <= 0) return;
  puzzleTimerHandle = setTimeout(() => {
    puzzleTimerHandle = null;
    if (state !== "playing") return;
    openNextPuzzle();
  }, sessionQuestionDurationMs);
}

const MAX_DISPLAY_NAME_LENGTH = 64;
const MAX_ANSWER_LENGTH = 500;

export function getSetup(): GameSetup {
  return { ...gameSetup };
}

export function setSetup(partial: Partial<GameSetup>): void {
  if (state === "playing") return;
  if (typeof partial.questionDurationMs === "number") {
    gameSetup.questionDurationMs = Math.max(
      MIN_QUESTION_DURATION_MS,
      Math.min(MAX_QUESTION_DURATION_MS, partial.questionDurationMs)
    );
  }
  if (typeof partial.numberOfQuestions === "number") {
    gameSetup.numberOfQuestions = Math.max(1, Math.min(50, Math.floor(partial.numberOfQuestions)));
  }
}

function getCurrentDifficulty(): Difficulty {
  if (bossPhaseActive) return "hard";
  return phase === 1 ? "easy" : "medium";
}

function openNextPuzzle(): void {
  if (currentPuzzleIndex >= sessionNumberOfQuestions) {
    endSession();
    return;
  }
  clearPuzzleTimer();
  const diff = getCurrentDifficulty();
  const lastType = currentPuzzle?.type;
  currentPuzzle = puzzles.generateRandomPuzzle(diff, undefined, lastType);
  puzzleOpenedAt = Date.now();
  currentPuzzleId = puzzleOpenedAt;
  socketHandlers.emitGameState(
    state,
    currentPuzzleIndex,
    puzzleOpenedAt,
    currentPuzzle.prompt,
    sessionNumberOfQuestions,
    sessionQuestionDurationMs,
    getHackState()
  );
  currentPuzzleIndex++;
  schedulePuzzleTimer();
}

function finishBossAndContinue(): void {
  bossPhaseActive = false;
  bossHints = 0;
  if (phase === 1) {
    phase = 2;
    difficulty = "medium";
    openNextPuzzle();
  } else {
    hackProgress = 100;
    socketHandlers.emitGameState(
      state,
      currentPuzzleIndex,
      null,
      null,
      sessionNumberOfQuestions,
      sessionQuestionDurationMs,
      getHackState()
    );
    endSession();
  }
}

export function getHackState(): HackState {
  return {
    phase,
    difficulty: getCurrentDifficulty(),
    hackProgress,
    currentPuzzle: currentPuzzle
      ? {
          type: currentPuzzle.type,
          data: currentPuzzle.data,
          prompt: currentPuzzle.prompt,
          difficulty: currentPuzzle.difficulty,
        }
      : null,
    correctAnswers,
    totalAnswers,
    bossPhaseActive,
    bossHints,
    puzzleOpenedAt,
  };
}

export function startSession(): void {
  state = "playing";
  sessionQuestionDurationMs = gameSetup.questionDurationMs;
  sessionNumberOfQuestions = gameSetup.numberOfQuestions;
  players.clear();
  responses.clear();
  retriesUsed.clear();
  phase = 1;
  difficulty = "easy";
  hackProgress = 0;
  correctAnswers = 0;
  totalAnswers = 0;
  bossPhaseActive = false;
  bossHints = 0;
  currentPuzzle = null;
  puzzleOpenedAt = null;
  currentPuzzleId = 0;
  currentPuzzleIndex = 0;
  openNextPuzzle();
  socketHandlers.emitLeaderboardUpdate(getLeaderboard());
}

export function getSessionQuestionDurationMs(): number {
  return sessionQuestionDurationMs;
}

export function getSessionNumberOfQuestions(): number {
  return state === "playing" ? sessionNumberOfQuestions : gameSetup.numberOfQuestions;
}

export function endSession(): void {
  state = "ended";
  clearPuzzleTimer();
  currentPuzzle = null;
  puzzleOpenedAt = null;
  socketHandlers.emitGameState("ended", undefined, undefined, null, undefined, undefined, getHackState());
}

export function getGameState(): GameState {
  return state;
}

/** Index de la question affichée (0-based). Question 1 = 0. */
export function getCurrentQuestionIndex(): number {
  return currentPuzzleIndex;
}

export function join(playerId: string, displayName: string): void {
  if (state !== "playing") return;
  const normalizedId = playerId.trim().toLowerCase();
  if (!normalizedId) return;
  if (players.has(normalizedId)) return;
  const name = (displayName || normalizedId).trim() || normalizedId;
  players.set(normalizedId, {
    playerId: normalizedId,
    displayName: name.slice(0, MAX_DISPLAY_NAME_LENGTH),
    score: 0,
    streak: 0,
  });
  socketHandlers.emitLeaderboardUpdate(getLeaderboard());
  socketHandlers.emitGameState(
    state,
    currentPuzzleIndex,
    puzzleOpenedAt,
    currentPuzzle?.prompt ?? null,
    sessionNumberOfQuestions,
    sessionQuestionDurationMs,
    getHackState()
  );
}

export function submitAnswer(playerId: string, answer: string): void {
  if (state !== "playing") return;
  const normalizedId = playerId.trim().toLowerCase();
  if (!players.has(normalizedId)) return;
  const trimmed = answer.trim().slice(0, MAX_ANSWER_LENGTH);
  if (!trimmed || !currentPuzzle || puzzleOpenedAt === null) return;

  let perPlayer = responses.get(normalizedId);
  if (!perPlayer) {
    perPlayer = new Set<number>();
    responses.set(normalizedId, perPlayer);
  }
  if (perPlayer.has(currentPuzzleId)) return;

  if (!puzzles.validateAnswer(currentPuzzle, trimmed)) {
    const player = players.get(normalizedId);
    if (player) player.streak = 0;
    totalAnswers++;
    socketHandlers.emitGameState(
      state,
      currentPuzzleIndex,
      puzzleOpenedAt,
      currentPuzzle.prompt,
      sessionNumberOfQuestions,
      sessionQuestionDurationMs,
      getHackState()
    );
    return;
  }

  perPlayer.add(currentPuzzleId);
  totalAnswers++;
  correctAnswers++;

  const player = players.get(normalizedId)!;
  const points = scoring.computePoints(
    puzzleOpenedAt,
    Date.now(),
    currentPuzzle.difficulty,
    player.streak
  );
  player.score += points;
  player.streak += 1;

  if (phase === 1 && !bossPhaseActive) {
    hackProgress = Math.min(50, correctAnswers * HACK_PERCENT_PER_CORRECT_P1);
    if (hackProgress >= 50) {
      bossPhaseActive = true;
      bossHints = 0;
      openNextPuzzle();
      socketHandlers.emitLeaderboardUpdate(getLeaderboard());
      return;
    }
  } else if (phase === 2 && !bossPhaseActive) {
    const phase2Correct = correctAnswers - PHASE1_CORRECT_TO_50 - 1;
    hackProgress = 50 + Math.min(50, phase2Correct * HACK_PERCENT_PER_CORRECT_P2);
    if (hackProgress >= 100) {
      bossPhaseActive = true;
      bossHints = 0;
      openNextPuzzle();
      socketHandlers.emitLeaderboardUpdate(getLeaderboard());
      return;
    }
  } else if (bossPhaseActive) {
    finishBossAndContinue();
    socketHandlers.emitLeaderboardUpdate(getLeaderboard());
    return;
  }

  // Ne pas passer au puzzle suivant : le timer le fera, pour laisser les autres joueurs marquer des points
  socketHandlers.emitLeaderboardUpdate(getLeaderboard());
  socketHandlers.emitGameState(
    state,
    currentPuzzleIndex,
    puzzleOpenedAt,
    currentPuzzle.prompt,
    sessionNumberOfQuestions,
    sessionQuestionDurationMs,
    getHackState()
  );
}

/** Retry : annule la réponse du joueur pour ce puzzle (limite 1 par puzzle). */
export function useRetry(playerId: string): boolean {
  if (state !== "playing" || !currentPuzzle || puzzleOpenedAt === null) return false;
  const normalizedId = playerId.trim().toLowerCase();
  let used = retriesUsed.get(normalizedId);
  if (!used) {
    used = new Set<number>();
    retriesUsed.set(normalizedId, used);
  }
  if (used.has(currentPuzzleId)) return false;
  used.add(currentPuzzleId);
  const perPlayer = responses.get(normalizedId);
  if (perPlayer) perPlayer.delete(currentPuzzleId);
  socketHandlers.emitGameState(
    state,
    currentPuzzleIndex,
    puzzleOpenedAt,
    currentPuzzle.prompt,
    sessionNumberOfQuestions,
    sessionQuestionDurationMs,
    getHackState()
  );
  return true;
}

const SKIP_COST_POINTS = 100;

/** Skip le puzzle courant : coûte 100 points au joueur qui l'utilise. */
export function skipPuzzle(playerId: string): void {
  if (state !== "playing" || !currentPuzzle) return;
  const normalizedId = playerId.trim().toLowerCase();
  const player = players.get(normalizedId);
  if (player) {
    player.score = Math.max(0, player.score - SKIP_COST_POINTS);
  }
  openNextPuzzle();
  socketHandlers.emitLeaderboardUpdate(getLeaderboard());
}

/** Indice pendant une phase boss (limite 2). */
export function useBossHint(playerId: string): boolean {
  if (state !== "playing" || !bossPhaseActive || bossHints >= MAX_BOSS_HINTS) return false;
  bossHints++;
  socketHandlers.emitGameState(
    state,
    currentPuzzleIndex,
    puzzleOpenedAt,
    currentPuzzle?.prompt ?? null,
    sessionNumberOfQuestions,
    sessionQuestionDurationMs,
    getHackState()
  );
  return true;
}

/** Texte de l'indice boss (après useBossHint, bossHints vaut 1 ou 2). */
export function getBossHintText(): string | null {
  if (!currentPuzzle || bossHints < 1 || bossHints > MAX_BOSS_HINTS) return null;
  return puzzles.getHint(currentPuzzle, bossHints as 1 | 2);
}

export function getLeaderboard(): LeaderboardEntry[] {
  const list = Array.from(players.values());
  list.sort((a, b) => b.score - a.score);
  return list.map((p, i) => ({
    rank: i + 1,
    playerId: p.playerId,
    displayName: p.displayName,
    score: p.score,
  }));
}

/** Force le passage au puzzle suivant (contrôle streamer / API). */
export function forceNextPuzzle(): void {
  if (state !== "playing") return;
  openNextPuzzle();
}

/** Stats personnelles d'un joueur. */
export function getPlayerStats(playerId: string): { score: number; streak: number; rank: number } | null {
  const normalized = playerId.trim().toLowerCase();
  const player = players.get(normalized);
  if (!player) return null;
  const list = getLeaderboard();
  const rank = list.findIndex((e) => e.playerId === normalized) + 1;
  return { score: player.score, streak: player.streak, rank: rank || list.length };
}
