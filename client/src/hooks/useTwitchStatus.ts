/**
 * Hook qui récupère le statut Twitch depuis le serveur (GET /api/twitch/status).
 * Utilise la même URL de base que le socket (VITE_SOCKET_URL ou window.location.origin).
 */

import { useEffect, useState } from "react";
import { apiUrl } from "../utils/apiBase";

export interface TwitchStatus {
  channel: string | null;
  connected: boolean;
}

export interface UseTwitchStatusResult extends TwitchStatus {
  loading: boolean;
  error: string | null;
}

export function useTwitchStatus(pollIntervalMs = 30_000): UseTwitchStatusResult {
  const [state, setState] = useState<UseTwitchStatusResult>({
    channel: null,
    connected: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(apiUrl("/api/twitch/status"));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as TwitchStatus;
        setState((prev) => ({
          ...prev,
          channel: data.channel ?? null,
          connected: Boolean(data.connected),
          loading: false,
          error: null,
        }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: msg,
        }));
      }
    };

    fetchStatus();
    const interval =
      pollIntervalMs > 0 ? setInterval(fetchStatus, pollIntervalMs) : undefined;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return state;
}
