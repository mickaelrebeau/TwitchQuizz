/**
 * Hook qui s'abonne aux événements Socket.IO leaderboard:update, game:state, connection:degraded
 * et expose leaderboard, gameState, connectionStatus (et currentQuestionIndex).
 * Un seul client Socket partagé (socketService singleton).
 */

import { useEffect, useState } from "react";
import * as socketService from "../services/socketService";
import type {
  LeaderboardEntry,
  GameState,
  ConnectionStatus,
  LeaderboardUpdatePayload,
  GameStatePayload,
  HackState,
} from "../types/socket";

export interface UseLeaderboardResult {
  leaderboard: LeaderboardEntry[];
  gameState: GameState;
  connectionStatus: ConnectionStatus;
  currentQuestionIndex: number | undefined;
  questionOpenedAt: number | undefined;
  questionText: string | null;
  totalQuestions: number;
  questionDurationMs: number;
  hackState: HackState | undefined;
  /** True dès qu'au moins un événement leaderboard:update ou game:state a été reçu. */
  hasReceivedData: boolean;
}

const INITIAL: UseLeaderboardResult = {
  leaderboard: [],
  gameState: "waiting",
  connectionStatus: "disconnected",
  currentQuestionIndex: undefined,
  questionOpenedAt: undefined,
  questionText: null,
  totalQuestions: 0,
  questionDurationMs: 5 * 60 * 1000,
  hackState: undefined,
  hasReceivedData: false,
};

export function useLeaderboard(): UseLeaderboardResult {
  const [state, setState] = useState<UseLeaderboardResult>(INITIAL);

  useEffect(() => {
    socketService.connect();

    const leaderboardHandler = (payload: unknown) => {
      const p = payload as LeaderboardUpdatePayload;
      setState((prev) => ({
        ...prev,
        leaderboard: Array.isArray(p?.leaderboard) ? [...p.leaderboard] : [],
        hasReceivedData: true,
      }));
    };

    const gameStateHandler = (payload: unknown) => {
      const p = payload as GameStatePayload;
      setState((prev) => ({
        ...prev,
        gameState:
          p?.gameState === "playing" ||
          p?.gameState === "ended" ||
          p?.gameState === "waiting"
            ? p.gameState
            : prev.gameState,
        currentQuestionIndex:
          typeof p?.currentQuestionIndex === "number" ? p.currentQuestionIndex : undefined,
        questionOpenedAt:
          p?.questionOpenedAt != null ? (p.questionOpenedAt as number) : undefined,
        questionText: p?.questionText != null ? String(p.questionText) : null,
        totalQuestions: typeof p?.totalQuestions === "number" ? p.totalQuestions : 0,
        questionDurationMs:
          typeof p?.questionDurationMs === "number" ? p.questionDurationMs : prev.questionDurationMs,
        hackState: p?.hackState ?? prev.hackState,
        hasReceivedData: true,
      }));
    };

    const degradedHandler = () => {
      setState((prev) => ({ ...prev, connectionStatus: "degraded" }));
    };

    const connectHandler = () => {
      setState((prev) => ({ ...prev, connectionStatus: "connected" }));
    };

    const disconnectHandler = () => {
      setState((prev) => ({ ...prev, connectionStatus: "disconnected" }));
    };

    socketService.on("leaderboard:update", leaderboardHandler);
    socketService.on("game:state", gameStateHandler);
    socketService.on("connection:degraded", degradedHandler);
    socketService.on("connect", connectHandler);
    socketService.on("disconnect", disconnectHandler);

    if (socketService.isConnected()) {
      setState((prev) => ({ ...prev, connectionStatus: "connected" }));
    }

    return () => {
      socketService.off("leaderboard:update", leaderboardHandler);
      socketService.off("game:state", gameStateHandler);
      socketService.off("connection:degraded", degradedHandler);
      socketService.off("connect", connectHandler);
      socketService.off("disconnect", disconnectHandler);
    };
  }, []);

  return state;
}
