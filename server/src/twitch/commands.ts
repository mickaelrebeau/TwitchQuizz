/**
 * Parsing des commandes Twitch : !join, !r (réponse), !skip, !next (streamer), !hint, !stats, !leaderboard, !retry.
 * Délègue à gameSession selon l'état de la partie.
 */

import * as gameSession from "../game/gameSession";
import * as twitchClient from "./twitchClient";

/** Retourne true si l'utilisateur est le streamer (propriétaire du canal). */
function isStreamer(channel: string, username: string): boolean {
  const ch = (channel || "").replace(/^#/, "").trim().toLowerCase();
  return ch !== "" && username.trim().toLowerCase() === ch;
}

export function handleMessage(
  channel: string,
  tags: Record<string, unknown>,
  message: string,
  self: boolean
): void {
  if (self) return;

  const raw = (message || "").trim();
  if (!raw) return;

  const firstSpace = raw.indexOf(" ");
  const firstWord = (firstSpace === -1 ? raw : raw.slice(0, firstSpace)).toLowerCase();
  const rest = firstSpace === -1 ? "" : raw.slice(firstSpace + 1).trim();

  const username = typeof tags.username === "string" ? tags.username.trim() : "";
  if (!username) return;
  const displayName = typeof tags["display-name"] === "string" ? tags["display-name"] : username;
  const playerId = username.toLowerCase();

  switch (firstWord) {
    case "!join":
      gameSession.join(playerId, displayName);
      return;

    case "!r":
      if (gameSession.getGameState() === "playing") {
        gameSession.submitAnswer(playerId, rest);
      }
      return;

    case "!skip":
      if (gameSession.getGameState() === "playing") {
        gameSession.skipPuzzle(playerId);
      }
      return;

    case "!next":
      if (gameSession.getGameState() === "playing" && isStreamer(channel, username)) {
        gameSession.forceNextPuzzle();
      }
      return;

    case "!hint":
      if (gameSession.getGameState() === "playing") {
        const used = gameSession.useBossHint(playerId);
        if (used) {
          const hintText = gameSession.getBossHintText();
          if (hintText) {
            twitchClient.say(channel, `@${displayName} ${hintText}`);
          } else {
            twitchClient.say(channel, `@${displayName} Indice boss utilisé (limite 2 par boss).`);
          }
        }
      }
      return;

    case "!stats":
      {
        const stats = gameSession.getPlayerStats(playerId);
        if (stats) {
          twitchClient.say(
            channel,
            `@${displayName} Score: ${stats.score} | Rang: #${stats.rank} | Streak: ${stats.streak}`
          );
        } else {
          twitchClient.say(channel, `@${displayName} Tu n'as pas encore joué. Utilise !join en partie.`);
        }
      }
      return;

    case "!leaderboard":
      {
        const top = gameSession.getLeaderboard().slice(0, 10);
        if (top.length === 0) {
          twitchClient.say(channel, "Leaderboard vide. Lance une partie et utilise !join.");
        } else {
          const line = top
            .map((e, i) => `#${i + 1} ${e.displayName} (${e.score})`)
            .join(" | ");
          twitchClient.say(channel, `Top 10: ${line}`);
        }
      }
      return;

    case "!retry":
      if (gameSession.getGameState() === "playing") {
        const ok = gameSession.useRetry(playerId);
        if (ok) {
          twitchClient.say(channel, `@${displayName} Tu peux réessayer ce puzzle (1 retry par puzzle).`);
        }
      }
      return;

    default:
      break;
  }
}
