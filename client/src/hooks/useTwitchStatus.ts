/**
 * Hook qui récupère le statut Twitch depuis le serveur (GET /api/twitch/status).
 * Utilise la même URL de base que le socket (VITE_SOCKET_URL ou window.location.origin).
 */

import { useEffect, useState } from "react";

export interface TwitchStatus {
  channel: string | null;
  connected: boolean;
}

export interface UseTwitchStatusResult extends TwitchStatus {
  loading: boolean;
  error: string | null;
}

function getApiBase(): string {
  const env = import.meta.env.VITE_SOCKET_URL;
  if (typeof env === "string" && env.trim() !== "") return env.trim();
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function useTwitchStatus(pollIntervalMs = 30_000): UseTwitchStatusResult {
  const [state, setState] = useState<UseTwitchStatusResult>({
    channel: null,
    connected: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const base = getApiBase();
    if (!base) {
      setState((prev) => ({ ...prev, loading: false, error: "API URL non configurée" }));
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${base}/api/twitch/status`);
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
