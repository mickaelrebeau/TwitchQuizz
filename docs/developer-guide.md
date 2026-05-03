# 🛠️ Guide du développeur

## Setup local

### Prérequis
- Node.js ≥ 18
- npm ≥ 9

### Installation
```bash
cd client && npm install
cd ../server && npm install
```

### Lancement
```bash
# Terminal 1
cd server && npm run dev    # tsx watch, port 3000

# Terminal 2
cd client && npm run dev    # Vite HMR, port 5173
```

---

## Conventions

### Code
- **TypeScript strict** — Pas de `any` implicite
- **camelCase** pour les noms de variables, fonctions, et payloads JSON
- **Modules ES** côté client, **CommonJS** côté serveur
- **Pas de secrets dans le code** — tout dans `.env`

### Structure
- Un fichier = un module/composant
- Les composants React sont des fonctions exportées nommées
- Les services sont des singletons (module-level)
- Les hooks commencent par `use`

### Git
- `.env` est gitignored (client + serveur)
- `node_modules/` et `dist/` sont gitignored

---

## Ajouter un nouveau type de puzzle

1. Créer `server/src/game/puzzles/monPuzzle.ts` :

```typescript
import type { Difficulty, BasePuzzle } from "./types";

interface MonPuzzle extends BasePuzzle {
  type: "monPuzzle";
}

export function generateMonPuzzle(difficulty: Difficulty): MonPuzzle {
  // Générer data, prompt, expectedAnswer selon la difficulté
  return {
    type: "monPuzzle",
    difficulty,
    data: "...",
    prompt: "...",
    expectedAnswer: "...",
  };
}

export function validateMonPuzzle(puzzle: MonPuzzle, answer: string): boolean {
  return answer.trim().toLowerCase() === puzzle.expectedAnswer.trim().toLowerCase();
}
```

2. Ajouter le type dans `types.ts` :
```typescript
export type PuzzleType = "decode" | "cipher" | "binary" | "quiz" | "monPuzzle";
```

3. Enregistrer dans `puzzles/index.ts` :
```typescript
import { generateMonPuzzle, validateMonPuzzle } from "./monPuzzle";
// Ajouter dans PUZZLE_TYPES, switch generateRandomPuzzle, switch validateAnswer
```

4. Ajouter le type côté client dans `client/src/types/socket.ts` :
```typescript
export type PuzzleType = "decode" | "cipher" | "binary" | "quiz" | "monPuzzle";
```

---

## Ajouter une commande Twitch

1. Éditer `server/src/twitch/commands.ts`
2. Ajouter un `case` dans le `switch` :

```typescript
case "!macommande":
  if (gameSession.getGameState() === "playing") {
    // logique
    twitchClient.say(channel, `@${displayName} Résultat`);
  }
  return;
```

3. Ajouter dans `client/src/components/CommandsPanel.tsx` pour l'affichage.

---

## Ajouter un composant React

1. Créer `client/src/components/MonComposant.tsx`
2. Utiliser les hooks existants (`useLeaderboard`, `useTwitchStatus`)
3. Utiliser TailwindCSS avec la palette existante :
   - Fond : `#0d1117`, `#161b22`
   - Bordures : `#30363d`
   - Texte : `#e6edf3`, `#8b949e`
   - Accents : `#00d4ff` (cyan), `#ff8c00` (orange), `#58a6ff` (bleu)
   - Succès : `#238636`
   - Erreur : `#f85149`, `#da3633`
   - Twitch : `#9146ff`

---

## Tests manuels

1. Lancer serveur + client en mode dev
2. Configurer la partie dans le panneau streamer
3. Démarrer une partie
4. Dans un autre navigateur/onglet, vérifier que le puzzle s'affiche
5. Tester via curl :
```bash
# Simuler un join + réponse (nécessite le chat Twitch connecté)
curl http://localhost:3000/api/game/state
```

---

## Build de production

```bash
cd client && npm run build     # → client/dist/
cd ../server && npm run build  # → server/dist/
cd server && npm start         # Sert client + API
```
