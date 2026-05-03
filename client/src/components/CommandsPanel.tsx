/**
 * Panneau permanent listant les commandes Twitch disponibles.
 */

const COMMANDS = [
  { cmd: "!join", desc: "Rejoindre la partie" },
  { cmd: "!r <réponse>", desc: "Répondre au puzzle" },
  { cmd: "!skip", desc: "Passer au puzzle suivant (coûte 100 pts)" },
  { cmd: "!next", desc: "Question suivante (streamer uniquement)" },
  { cmd: "!hint", desc: "Indice boss (max 2 par boss)" },
  { cmd: "!stats", desc: "Tes stats (score, rang, streak)" },
  { cmd: "!leaderboard", desc: "Top 10 dans le chat" },
  { cmd: "!retry", desc: "Réessayer le puzzle (1 par puzzle)" },
] as const;

export function CommandsPanel() {
  return (
    <section
      className="font-mono rounded-xl border border-[#30363d] bg-[#161b22] p-4 text-left w-full max-w-md"
      aria-label="Commandes Twitch disponibles"
    >
      <h2 className="text-sm font-semibold text-[#8b949e] mb-3 uppercase tracking-wider">
        Commandes chat
      </h2>
      <ul className="space-y-2 text-sm">
        {COMMANDS.map(({ cmd, desc }) => (
          <li key={cmd} className="flex flex-wrap gap-x-2 gap-y-0 items-baseline">
            <code className="text-[#58a6ff] shrink-0">{cmd}</code>
            <span className="text-[#8b949e]">{desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
