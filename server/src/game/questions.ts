/**
 * Current question state: expected answer and opened timestamp.
 * Les questions viennent de predefinedQuestions (thème code).
 */

export const QUESTION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export interface CurrentQuestion {
  questionIndex: number;
  expectedAnswer: string;
  openedAt: number;
  /** Texte affiché aux viewers (optionnel). */
  questionText?: string;
}

let current: CurrentQuestion | null = null;

export function getCurrentQuestion(): CurrentQuestion | null {
  return current;
}

export function isCorrectAnswer(answer: string): boolean {
  if (!current) return false;
  const normalized = answer.trim().toLowerCase();
  const expected = current.expectedAnswer.trim().toLowerCase();
  return normalized === expected;
}

export function openQuestion(
  questionIndex: number,
  expectedAnswer: string,
  questionText?: string
): void {
  const trimmed = expectedAnswer.trim();
  if (!trimmed) return;
  current = {
    questionIndex,
    expectedAnswer: trimmed,
    openedAt: Date.now(),
    questionText: questionText?.trim() || undefined,
  };
}

export function clearQuestion(): void {
  current = null;
}
