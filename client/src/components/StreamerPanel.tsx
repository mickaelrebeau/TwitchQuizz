/**
 * Panneau streamer : config de la partie, démarrer, question suivante, terminer.
 */

import { useEffect, useState } from "react";
import * as api from "../services/apiService";
import type { GameState } from "../types/socket";

const TIMER_OPTIONS_MS = [
  { label: "30 s", value: 30 * 1000 },
  { label: "1 min", value: 60 * 1000 },
  { label: "2 min", value: 2 * 60 * 1000 },
  { label: "5 min", value: 5 * 60 * 1000 },
  { label: "10 min", value: 10 * 60 * 1000 },
] as const;

interface StreamerPanelProps {
  gameState: GameState;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  onAction?: () => void;
}

export function StreamerPanel({
  gameState,
  onAction,
}: StreamerPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<{
    questionDurationMs: number;
    numberOfQuestions: number;
    maxAvailableQuestions?: number;
  } | null>(null);
  const [setupForm, setSetupForm] = useState({ questionDurationMs: 5 * 60 * 1000, numberOfQuestions: 15 });

  useEffect(() => {
    api
      .fetchSetup()
      .then((data) => {
        setSetup(data);
        setSetupForm({
          questionDurationMs: data.questionDurationMs,
          numberOfQuestions: data.numberOfQuestions,
        });
      })
      .catch(() => setSetup(null));
  }, [gameState]);

  const handleSaveSetup = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.saveSetup(setupForm);
      setSetup(data);
      setSetupForm({ questionDurationMs: data.questionDurationMs, numberOfQuestions: data.numberOfQuestions });
      onAction?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.startGame();
      onAction?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.nextQuestion();
      onAction?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.endGame();
      onAction?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const isPlaying = gameState === "playing";

  return (
    <section
      className="w-full max-w-md rounded-xl border border-[#30363d] bg-[#161b22] p-4 text-left"
      aria-label="Contrôles streamer"
    >
      <h2 className="font-mono text-sm font-semibold text-[#8b949e] mb-3 uppercase tracking-wider">
        Contrôles streamer
      </h2>

      {error && (
        <p
          className="font-mono text-sm text-[#f85149] mb-3"
          role="alert"
        >
          {error}
        </p>
      )}

      {!isPlaying && (
        <div className="space-y-4">
          {setup !== null && (
            <div className="space-y-3 rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
              <h3 className="font-mono text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                Configurer la partie
              </h3>
              <div>
                <label htmlFor="setup-questions" className="block font-mono text-sm text-[#8b949e] mb-1">
                  Nombre de questions (1–{setup.maxAvailableQuestions ?? 50})
                </label>
                <input
                  id="setup-questions"
                  type="number"
                  min={1}
                  max={setup.maxAvailableQuestions ?? 50}
                  value={setupForm.numberOfQuestions}
                  onChange={(e) =>
                    setSetupForm((prev) => ({
                      ...prev,
                      numberOfQuestions: Math.max(1, Math.min(setup.maxAvailableQuestions ?? 50, Number(e.target.value) || 1)),
                    }))
                  }
                  className="w-full font-mono py-2 px-3 rounded-lg border border-[#30363d] bg-[#161b22] text-white focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                />
              </div>
              <div>
                <label className="block font-mono text-sm text-[#8b949e] mb-1">
                  Temps par question
                </label>
                <select
                  value={setupForm.questionDurationMs}
                  onChange={(e) =>
                    setSetupForm((prev) => ({
                      ...prev,
                      questionDurationMs: Number(e.target.value),
                    }))
                  }
                  className="w-full font-mono py-2 px-3 rounded-lg border border-[#30363d] bg-[#161b22] text-white focus:outline-none focus:ring-2 focus:ring-[#58a6ff]"
                >
                  {TIMER_OPTIONS_MS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleSaveSetup}
                disabled={loading}
                className="w-full font-mono py-2 px-4 rounded-lg bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "…" : "Enregistrer la config"}
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full font-mono py-2 px-4 rounded-lg bg-[#238636] text-white hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "En cours…" : "Démarrer une partie"}
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="flex-1 font-mono py-2 px-4 rounded-lg bg-[#1f6feb] text-white hover:bg-[#388bfd] disabled:opacity-50 disabled:cursor-not-allowed"
            title="Passer au puzzle suivant (manuel)"
          >
            {loading ? "…" : "Question suivante"}
          </button>
          <button
            type="button"
            onClick={handleEnd}
            disabled={loading}
            className="font-mono py-2 px-4 rounded-lg border border-[#da3633] text-[#f85149] hover:bg-[#da3633] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Terminer
          </button>
        </div>
      )}
    </section>
  );
}
