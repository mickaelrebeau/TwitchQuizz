/**
 * Puzzles de décodage Base64 et Hex.
 * Énoncé : "Decode this: <data>"
 */

import type { DecodePuzzle, Difficulty } from "./types";

const EASY_WORDS = ["Hello", "World", "Code", "Hack", "Test", "Node", "Twitch", "Stream", "Chat", "Bot"];
const MEDIUM_WORDS = ["Hello World", "Base64 Decode", "Hex String", "Twitch Chat", "Stream Bot"];
const HARD_PHRASES = ["The quick brown fox jumps over the lazy dog", "Hacking the mainframe in 3... 2... 1..."];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toComparable(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function generateDecode(difficulty: Difficulty): DecodePuzzle {
  const encoding: "base64" | "hex" = Math.random() > 0.5 ? "base64" : "hex";
  let text: string;
  switch (difficulty) {
    case "easy":
      text = pickRandom(EASY_WORDS);
      break;
    case "medium":
      text = pickRandom(MEDIUM_WORDS);
      break;
    default:
      text = pickRandom(HARD_PHRASES);
  }
  const data = encoding === "base64"
    ? Buffer.from(text, "utf8").toString("base64")
    : Buffer.from(text, "utf8").toString("hex");
  const prompt = encoding === "base64"
    ? `Decode this (Base64): ${data}`
    : `Decode this (Hex): ${data}`;
  return {
    type: "decode",
    difficulty,
    data,
    prompt,
    expectedAnswer: toComparable(text),
    encoding,
  };
}

export function validateDecode(puzzle: DecodePuzzle, answer: string): boolean {
  const normalized = toComparable(answer);
  return normalized === puzzle.expectedAnswer;
}
