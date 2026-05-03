/**
 * Puzzles quiz : questions thématiques code et IA.
 * Une question est affichée, la réponse est un court texte (comparaison normalisée).
 */

import type { QuizPuzzle, Difficulty } from "./types";
import { QUIZ_QUESTIONS, getQuizCount } from "./quizQuestions";

function toComparable(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function generateQuiz(_difficulty: Difficulty): QuizPuzzle {
  const count = getQuizCount();
  const q = QUIZ_QUESTIONS[Math.floor(Math.random() * count)];
  return {
    type: "quiz",
    difficulty: _difficulty,
    data: q.text,
    prompt: q.text,
    expectedAnswer: toComparable(q.answer),
  };
}

export function validateQuiz(puzzle: QuizPuzzle, answer: string): boolean {
  const normalized = toComparable(answer);
  return normalized === puzzle.expectedAnswer;
}
