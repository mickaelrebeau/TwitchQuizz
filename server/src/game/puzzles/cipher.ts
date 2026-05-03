/**
 * Puzzles chiffrement ROT13 et Caesar.
 * Énoncé : "Decrypt (ROT13): Uryyb Jbeyq" → "Hello World"
 */

import type { CipherPuzzle, Difficulty } from "./types";

function rot13(s: string): string {
  return s.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

function caesarEncrypt(s: string, shift: number): string {
  const n = ((shift % 26) + 26) % 26;
  return s.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26) + base);
  });
}

const EASY_WORDS = ["Hello", "World", "Code", "Hack"];
const MEDIUM_PHRASES = ["Hello World", "Decode Me", "Twitch Stream"];
const HARD_PHRASES = ["The quick brown fox jumps over the lazy dog", "Hack the planet"];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toComparable(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function generateCipher(difficulty: Difficulty): CipherPuzzle {
  const useRot13 = Math.random() > 0.5;
  let plain: string;
  switch (difficulty) {
    case "easy":
      plain = pickRandom(EASY_WORDS);
      break;
    case "medium":
      plain = pickRandom(MEDIUM_PHRASES);
      break;
    default:
      plain = pickRandom(HARD_PHRASES);
  }
  const cipher = useRot13 ? "rot13" : "caesar";
  const shift = useRot13 ? undefined : (Math.floor(Math.random() * 25) + 1);
  const encrypted = useRot13 ? rot13(plain) : caesarEncrypt(plain, shift ?? 1);
  const prompt = useRot13
    ? `Decrypt (ROT13): ${encrypted}`
    : `Decrypt (Caesar shift ${shift}): ${encrypted}`;
  return {
    type: "cipher",
    difficulty,
    data: encrypted,
    prompt,
    expectedAnswer: toComparable(plain),
    cipher,
    shift,
  };
}

export function validateCipher(puzzle: CipherPuzzle, answer: string): boolean {
  const normalized = toComparable(answer);
  return normalized === puzzle.expectedAnswer;
}
