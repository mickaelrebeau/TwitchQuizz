/**
 * Générateur aléatoire de puzzles et validation par type.
 * Types : decode, cipher, binary, quiz (150 questions code + IA).
 */

import type { Puzzle, PuzzleType, Difficulty, BasePuzzle } from "./types";
import { generateDecode, validateDecode } from "./decode";
import { generateCipher, validateCipher } from "./cipher";
import { generateBinary, validateBinary } from "./binary";
import { generateQuiz, validateQuiz } from "./quiz";

const PUZZLE_TYPES: PuzzleType[] = ["decode", "cipher", "binary", "quiz"];

export type { Puzzle, PuzzleType, Difficulty, BasePuzzle };

/** Évite de répéter le même type que le puzzle précédent pour plus de variété. */
export function generateRandomPuzzle(difficulty: Difficulty, type?: PuzzleType, lastType?: PuzzleType): Puzzle {
  let pool = PUZZLE_TYPES;
  if (lastType && pool.length > 1) {
    pool = pool.filter((x) => x !== lastType);
  }
  const t = type ?? pool[Math.floor(Math.random() * pool.length)];
  switch (t) {
    case "decode":
      return generateDecode(difficulty);
    case "cipher":
      return generateCipher(difficulty);
    case "binary":
      return generateBinary(difficulty);
    case "quiz":
      return generateQuiz(difficulty);
    default:
      return generateDecode(difficulty);
  }
}

export function validateAnswer(puzzle: Puzzle, answer: string): boolean {
  switch (puzzle.type) {
    case "decode":
      return validateDecode(puzzle, answer);
    case "cipher":
      return validateCipher(puzzle, answer);
    case "binary":
      return validateBinary(puzzle, answer);
    case "quiz":
      return validateQuiz(puzzle, answer);
    default:
      return false;
  }
}

/**
 * Retourne un indice pour le puzzle (boss).
 * whichHint: 1 = premier indice (longueur), 2 = second indice (première lettre).
 */
export function getHint(puzzle: Puzzle, whichHint: 1 | 2): string {
  const answer = puzzle.expectedAnswer.trim();
  const len = answer.replace(/\s+/g, " ").length;
  if (whichHint === 1) {
    return `Indice: la réponse fait ${len} caractère${len > 1 ? "s" : ""}.`;
  }
  const first = answer.charAt(0);
  if (first === " ") {
    const firstNonSpace = answer.replace(/^\s+/, "").charAt(0);
    return firstNonSpace
      ? `Indice: la réponse commence par « ${firstNonSpace.toUpperCase()} ».`
      : `Indice: la réponse fait ${len} caractère${len > 1 ? "s" : ""}.`;
  }
  return `Indice: la réponse commence par « ${first.toUpperCase()} ».`;
}
