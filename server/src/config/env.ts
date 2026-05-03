/**
 * Centralized environment configuration.
 * PORT, CLIENT_ORIGIN (and later TWITCH_CHANNEL, TWITCH_OAUTH).
 * No secrets in code — all from env vars.
 */

function parsePort(value: string | undefined): number {
  if (value === undefined || value === "") return 3000;
  const n = Number(value);
  if (Number.isNaN(n) || n < 0 || !Number.isInteger(n)) {
    console.warn(`Invalid PORT "${value}", using 3000`);
    return 3000;
  }
  return n;
}

const PORT = parsePort(process.env.PORT);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
/** Optional: path to client build (client/dist). If set, server serves SPA from this folder. */
const CLIENT_DIST_PATH = process.env.CLIENT_DIST_PATH;
/** Twitch chat: channel name (e.g. "mychannel"). Not logged. */
const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL?.trim() || "";
/** Twitch chat: OAuth token (e.g. "oauth:xxxx"). Never log or expose. */
const TWITCH_OAUTH = process.env.TWITCH_OAUTH?.trim() || "oauth:...";

export const env = {
  PORT,
  CLIENT_ORIGIN,
  CLIENT_DIST_PATH: CLIENT_DIST_PATH || undefined,
  TWITCH_CHANNEL,
  TWITCH_OAUTH,
} as const;

export function hasTwitchConfig(): boolean {
  return Boolean(env.TWITCH_CHANNEL && env.TWITCH_OAUTH);
}
