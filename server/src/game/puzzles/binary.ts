/**
 * Puzzles décodage binaire (octets en binaire → texte ASCII).
 * Énoncé : "01001000 01100101 01101100 01101100 01101111" → "Hello"
 */

import type { BinaryPuzzle, Difficulty } from "./types";

const EASY_WORDS = ["Hi", "No", "OK", "Go"];
const MEDIUM_WORDS = ["Hello", "World", "Code", "Hack"];
const HARD_PHRASES = ["Hello World", "Binary Decode"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function textToBinary(s: string): string {
  const bytes = Buffer.from(s, "utf8");
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, "0"))
    .join(" ");
}

function toComparable(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function generateBinary(difficulty: Difficulty): BinaryPuzzle {
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
  const data = textToBinary(text);
  return {
    type: "binary",
    difficulty,
    data,
    prompt: `Decode this (binary): ${data}`,
    expectedAnswer: toComparable(text),
  };
}

export function validateBinary(puzzle: BinaryPuzzle, answer: string): boolean {
  const normalized = toComparable(answer);
  return normalized === puzzle.expectedAnswer;
}
