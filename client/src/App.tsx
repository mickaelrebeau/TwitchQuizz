import "./App.css";
import { CommandsPanel } from "./components/CommandsPanel";
import { GameStateHeader } from "./components/GameStateHeader";
import { HackProgressBar } from "./components/HackProgressBar";
import { Leaderboard } from "./components/Leaderboard";
import { StreamerPanel } from "./components/StreamerPanel";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { useTwitchStatus } from "./hooks/useTwitchStatus";

function App() {
  const {
    leaderboard,
    connectionStatus,
    hasReceivedData,
    gameState,
    currentQuestionIndex,
    questionOpenedAt,
    questionText,
    totalQuestions,
    questionDurationMs,
    hackState,
  } = useLeaderboard();
  const { channel, connected: twitchConnected, loading: twitchLoading } = useTwitchStatus();

  const isLoading = !hasReceivedData;
  const isDegraded =
    connectionStatus === "degraded" ||
    (connectionStatus === "disconnected" && hasReceivedData);

  return (
    <main className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-mono tracking-tight">
        Leaderboard
      </h1>

      {!twitchLoading && twitchConnected && channel && (
        <p className="font-mono text-[#9146ff] text-sm mb-2" role="status">
          Connecté à Twitch #{channel}
        </p>
      )}

      <div className="mb-6">
        <StreamerPanel
          gameState={gameState}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
        />
      </div>

      {!isLoading && hackState && (
        <div className="w-full max-w-xl mb-6">
          <HackProgressBar hackState={hackState} />
        </div>
      )}

      {!isLoading && (
        <GameStateHeader
          gameState={gameState}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          questionOpenedAt={questionOpenedAt}
          questionText={questionText}
          questionDurationMs={questionDurationMs}
        />
      )}

      {isLoading && (
        <p
          className="font-mono text-[#00d4ff] text-lg mb-4"
          role="status"
          aria-live="polite"
        >
          Chargement…
        </p>
      )}

      {isDegraded && !isLoading && (
        <p
          className="font-mono font-semibold text-[#ff8c00] text-lg mb-4"
          role="alert"
          aria-live="assertive"
        >
          {connectionStatus === "degraded" ? "En pause" : "Connexion perdue"}
        </p>
      )}

      {!isLoading && <Leaderboard leaderboard={leaderboard} />}

      <div className="mt-8 w-full max-w-md">
        <CommandsPanel />
      </div>
    </main>
  );
}

export default App;
