/**
 * Appels API du serveur (game, etc.).
 * Utilise la même URL de base que le socket (VITE_SOCKET_URL ou window.location.origin).
 */

function getApiBase(): string {
  const env = import.meta.env.VITE_SOCKET_URL;
  if (typeof env === "string" && env.trim() !== "") return env.trim();
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

import type { HackState } from "../types/socket";

export interface GameStateResponse {
  gameState: "waiting" | "playing" | "ended";
  currentQuestionIndex: number;
  questionDurationMs?: number;
  hackState?: HackState;
}

export interface GameSetupResponse {
  questionDurationMs: number;
  numberOfQuestions: number;
  maxAvailableQuestions?: number;
}

export async function fetchSetup(): Promise<GameSetupResponse> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/game/setup`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<GameSetupResponse>;
}

export async function saveSetup(partial: {
  questionDurationMs?: number;
  numberOfQuestions?: number;
}): Promise<GameSetupResponse> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/game/setup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<GameSetupResponse>;
}

export async function fetchGameState(): Promise<GameStateResponse> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/game/state`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<GameStateResponse>;
}

export async function startGame(): Promise<void> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/game/start`, { method: "POST" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/** Passe à la question suivante (liste prédéfinie côté serveur). */
export async function nextQuestion(): Promise<void> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/game/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
}

export async function endGame(): Promise<void> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/game/end`, { method: "POST" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
