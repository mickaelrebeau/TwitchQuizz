/**
 * Client Socket.IO singleton.
 * Seul point de connexion Socket.IO côté client ; utilisé par useLeaderboard.
 */

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

function getDefaultUrl(): string {
  const env = import.meta.env.VITE_SOCKET_URL;
  if (typeof env === "string" && env.trim() !== "") return env.trim();
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

const SOCKET_OPTIONS = {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
};

function getSocket(): Socket {
  if (!socket) {
    const url = getDefaultUrl();
    socket = io(url, SOCKET_OPTIONS);
  }
  return socket;
}

/** Crée et connecte le client Socket (singleton). Optionnel : url explicite. */
export function connect(url?: string): Socket {
  if (socket) return socket;
  const u = url ?? getDefaultUrl();
  socket = io(u, SOCKET_OPTIONS);
  return socket;
}

export function on(event: string, callback: (...args: unknown[]) => void): void {
  getSocket().on(event, callback);
}

export function off(event: string, callback?: (...args: unknown[]) => void): void {
  getSocket().off(event, callback);
}

/** État de connexion du socket (connecté au transport). */
export function isConnected(): boolean {
  return getSocket().connected;
}

/** Retourne l'instance Socket (pour lecture .connected ou tests). Ne pas utiliser pour créer une seconde connexion. */
export function getSocketInstance(): Socket {
  return getSocket();
}
