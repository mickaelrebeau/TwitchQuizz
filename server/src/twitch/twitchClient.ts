/**
 * Twitch chat client (TMI.js). Single point of connection.
 * Connects to the configured channel, receives messages, reconnects on disconnect.
 * Never logs OAuth or secrets.
 */

import { env, hasTwitchConfig } from "../config/env";

export type MessageHandler = (
  channel: string,
  tags: Record<string, unknown>,
  message: string,
  self: boolean
) => void;

interface TmiClient {
  connect: () => Promise<[string, number]>;
  disconnect: () => Promise<void>;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  say: (channel: string, message: string) => void;
}

let client: TmiClient | null = null;
let messageHandler: MessageHandler | null = null;
let connectionLostHandler: (() => void) | null = null;
let hasLoggedFirstMessage = false;
let connected = false;

function getClient(): TmiClient {
  if (!client) {
    const tmi = require("tmi.js");
    const channel = env.TWITCH_CHANNEL!;
    const oauth = env.TWITCH_OAUTH!;
    const opts = {
      options: { debug: false },
      identity: {
        username: channel,
        password: oauth.startsWith("oauth:") ? oauth : `oauth:${oauth}`,
      },
      channels: [channel],
      connection: {
        reconnect: true,
        maxReconnectAttempts: Infinity,
      },
    };
    const c = new tmi.Client(opts) as TmiClient;

    c.on("message", (...args: unknown[]) => {
      const [ch, tags, msg, self] = args as [string, Record<string, unknown>, string, boolean];
      if (!hasLoggedFirstMessage) {
        hasLoggedFirstMessage = true;
        console.log("Twitch: receiving messages from channel");
      }
      if (messageHandler) messageHandler(ch, tags, msg, self);
    });

    c.on("connected", (_address: unknown, _port: unknown) => {
      connected = true;
      console.log(`Twitch: connected to #${channel}`);
    });

    c.on("disconnected", () => {
      connected = false;
      console.log("Twitch: disconnected, reconnecting…");
      try {
        if (connectionLostHandler) connectionLostHandler();
      } catch (e) {
        console.error("Twitch connectionLost handler error:", e instanceof Error ? e.message : String(e));
      }
    });

    c.on("error", (err: unknown) => {
      connected = false;
      const msg = err instanceof Error ? err.message : String(err);
      const lower = msg.toLowerCase();
      if (lower.includes("oauth") || lower.includes("token") || lower.includes("password")) {
        console.error("Twitch error: authentication failed");
      } else {
        console.error("Twitch error:", msg);
      }
      try {
        if (connectionLostHandler) connectionLostHandler();
      } catch (e) {
        console.error("Twitch connectionLost handler error:", e instanceof Error ? e.message : String(e));
      }
    });

    client = c;
    return c;
  }
  return client;
}

export function connect(): Promise<[string, number]> {
  if (!hasTwitchConfig()) {
    return Promise.reject(new Error("Twitch config missing"));
  }
  return getClient().connect();
}

export function disconnect(): Promise<void> {
  if (client) {
    const c = client;
    client = null;
    return c.disconnect();
  }
  return Promise.resolve();
}

export function onMessage(handler: MessageHandler): void {
  messageHandler = handler;
}

export function onConnectionLost(callback: () => void): void {
  connectionLostHandler = callback;
}

export function isConfigured(): boolean {
  return hasTwitchConfig();
}

/** Canal Twitch configuré (nom du channel). */
export function getChannel(): string | undefined {
  return env.TWITCH_CHANNEL;
}

/** True si le client TMI est actuellement connecté au chat. */
export function isConnected(): boolean {
  return connected;
}

/** Envoyer un message dans le chat (pour !stats, !leaderboard). */
export function say(channel: string, message: string): void {
  if (!client || !connected) return;
  const msg = (message || "").trim().slice(0, 500);
  if (!msg) return;
  try {
    client.say(channel, msg);
  } catch (_e) {
    // ignore
  }
}
