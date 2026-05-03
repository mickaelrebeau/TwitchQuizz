/**
 * Socket.IO emission: leaderboard:update, game:state, connection:degraded.
 * No business logic; receives data and broadcasts to all connected clients.
 */

import type { Server } from "socket.io";
import type { HackState } from "../game/gameSession";

/** Payload shape for leaderboard:update (camelCase). */
export interface LeaderboardEntryPayload {
  rank: number;
  playerId: string;
  displayName: string;
  score: number;
}

let io: Server | null = null;
let hasWarnedNoIo = false;

function warnIfNoIo(): void {
  if (!io && !hasWarnedNoIo) {
    hasWarnedNoIo = true;
    console.warn("socketHandlers: io not initialized, skip emit (call init(io) before gameSession)");
  }
}

export function init(server: Server): void {
  io = server;
}

export function emitLeaderboardUpdate(leaderboard: LeaderboardEntryPayload[]): void {
  if (!io) {
    warnIfNoIo();
    return;
  }
  io.emit("leaderboard:update", { leaderboard });
}

export function emitGameState(
  gameState: "playing" | "ended" | "waiting",
  currentQuestionIndex?: number,
  questionOpenedAt?: number | null,
  questionText?: string | null,
  totalQuestions?: number,
  questionDurationMs?: number,
  hackState?: HackState
): void {
  if (!io) {
    warnIfNoIo();
    return;
  }
  const payload: {
    gameState: string;
    currentQuestionIndex?: number;
    questionOpenedAt?: number | null;
    questionText?: string | null;
    totalQuestions?: number;
    questionDurationMs?: number;
    hackState?: HackState;
  } = { gameState };
  if (currentQuestionIndex !== undefined) payload.currentQuestionIndex = currentQuestionIndex;
  if (questionOpenedAt !== undefined) payload.questionOpenedAt = questionOpenedAt ?? null;
  if (questionText !== undefined) payload.questionText = questionText ?? null;
  if (totalQuestions !== undefined) payload.totalQuestions = totalQuestions;
  if (questionDurationMs !== undefined) payload.questionDurationMs = questionDurationMs;
  if (hackState !== undefined) payload.hackState = hackState;
  io.emit("game:state", payload);
}

export function emitConnectionDegraded(reason: string): void {
  if (!io) {
    warnIfNoIo();
    return;
  }
  io.emit("connection:degraded", { reason });
}
