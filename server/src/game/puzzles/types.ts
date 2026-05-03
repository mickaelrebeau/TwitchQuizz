/**
 * Types pour le système de puzzles (decode, cipher, binary, quiz).
 */

export type PuzzleType = "decode" | "cipher" | "binary" | "quiz";

export type Difficulty = "easy" | "medium" | "hard";

export interface BasePuzzle {
  type: PuzzleType;
  difficulty: Difficulty;
  /** Donnée affichée (ex: "SGVsbG8gV29ybGQ=", "01001000...") */
  data: string;
  /** Énoncé court (ex: "Decode this (Base64):") */
  prompt: string;
  /** Réponse attendue (normalisée pour comparaison) */
  expectedAnswer: string;
}

export interface DecodePuzzle extends BasePuzzle {
  type: "decode";
  /** "base64" | "hex" */
  encoding: "base64" | "hex";
}

export interface CipherPuzzle extends BasePuzzle {
  type: "cipher";
  /** "rot13" | "caesar" */
  cipher: "rot13" | "caesar";
  shift?: number; // pour Caesar
}

export interface BinaryPuzzle extends BasePuzzle {
  type: "binary";
}

export interface QuizPuzzle extends BasePuzzle {
  type: "quiz";
}

export type Puzzle = DecodePuzzle | CipherPuzzle | BinaryPuzzle | QuizPuzzle;
