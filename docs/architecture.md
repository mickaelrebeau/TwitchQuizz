# 🏗️ Architecture

## Vue d'ensemble

Le projet suit une architecture **client-serveur** avec communication temps réel via **Socket.IO** et intégration **Twitch IRC** pour le chat.

```
┌──────────────────────────────────────────────────────────────┐
│                    TWITCH CHAT (IRC)                         │
│          Les viewers envoient des commandes (!join, !r)      │
└─────────────────────────┬────────────────────────────────────┘
                          │ TMI.js
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                      SERVEUR (Express)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Twitch      │  │   Game       │  │  Socket          │   │
│  │  Module      │──│   Session    │──│  Handlers        │   │
│  │              │  │              │  │                   │   │
│  │ twitchClient │  │ gameSession  │  │ socketHandlers   │   │
│  │ commands     │  │ scoring      │  │ (broadcast)      │   │
│  │              │  │ puzzles/*    │  │                   │   │
│  └──────────────┘  └──────────────┘  └────────┬──────────┘  │
│                                                │             │
│  ┌──────────────────────────────────┐          │             │
│  │   API REST (Express routes)     │          │             │
│  │   /api/health                   │          │             │
│  │   /api/twitch/status            │          │             │
│  │   /api/game/*                   │          │             │
│  └────────────────┬─────────────────┘          │             │
└───────────────────┼────────────────────────────┼─────────────┘
                    │ HTTP                Socket.IO
                    ▼                        ▼
┌──────────────────────────────────────────────────────────────┐
│                   CLIENT (React + Vite)                      │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Services │  │   Hooks      │  │   Components         │   │
│  │          │  │              │  │                       │   │
│  │ apiSvc   │──│ useLeader…   │──│ App                   │   │
│  │ socketSvc│  │ useTwitch…   │  │ ├─ StreamerPanel      │   │
│  │          │  │              │  │ ├─ HackProgressBar    │   │
│  └──────────┘  └──────────────┘  │ ├─ GameStateHeader    │   │
│                                   │ ├─ Leaderboard       │   │
│                                   │ │  └─ LeaderboardRow │   │
│                                   │ └─ CommandsPanel     │   │
│                                   └──────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Flux de données

### 1. Viewer envoie `!join` dans le chat Twitch

```
Chat Twitch  →  TMI.js (twitchClient)  →  commands.handleMessage()
                                           →  gameSession.join(playerId, displayName)
                                               →  socketHandlers.emitLeaderboardUpdate()
                                                   →  Socket.IO broadcast "leaderboard:update"
                                                       →  Client: useLeaderboard hook met à jour le state
                                                           →  React re-render du Leaderboard
```

### 2. Viewer envoie `!r <réponse>`

```
Chat Twitch  →  TMI.js  →  commands.handleMessage()
                            →  gameSession.submitAnswer(playerId, answer)
                                →  puzzles.validateAnswer(currentPuzzle, answer)
                                    ├── ❌ Incorrect → streak = 0, emit game:state
                                    └── ✅ Correct → scoring.computePoints()
                                        →  hackProgress += increment
                                        →  socketHandlers.emitLeaderboardUpdate()
                                        →  socketHandlers.emitGameState()
                                            →  Client: met à jour leaderboard + hack bar
```

### 3. Streamer clique "Démarrer" dans le panneau web

```
Client  →  POST /api/game/start
            →  gameSession.startSession()
                →  reset state (players, scores, phase)
                →  openNextPuzzle() → générer puzzle aléatoire
                →  emit "game:state" (playing) + "leaderboard:update" ([])
                    →  Client: affiche le puzzle + timer
```

### 4. Timer expire

```
setTimeout (serveur)  →  openNextPuzzle()
                          →  si index >= total → endSession()
                          →  sinon → generateRandomPuzzle(difficulty)
                              →  emit "game:state" (nouveau puzzle)
                                  →  Client: affiche le nouveau puzzle + reset timer
```

---

## Modules serveur

### `config/env.ts`

Configuration centralisée. Lit les variables d'environnement et fournit des valeurs par défaut. Exporte un objet `env` immuable et une fonction `hasTwitchConfig()`.

### `game/gameSession.ts`

Cœur du jeu. Gère :
- **État de la partie** (`waiting`, `playing`, `ended`)
- **Joueurs** (Map `playerId → Player`)
- **Phases** (1 → boss → 2 → boss final)
- **Progression hack** (0–100 %)
- **Timer** (`setTimeout` par puzzle)
- **Réponses** (dédup par `puzzleId`, retry 1x par puzzle)

Fonctions publiques principales :
- `startSession()` — Initialise et lance la partie
- `endSession()` — Termine la partie
- `join(playerId, displayName)` — Inscrit un joueur
- `submitAnswer(playerId, answer)` — Traite une réponse
- `forceNextPuzzle()` — Passe au puzzle suivant (streamer)
- `skipPuzzle(playerId)` — Skip moyennant 100 pts
- `useRetry(playerId)` — Annule la réponse pour réessayer
- `useBossHint(playerId)` — Utilise un indice boss (max 2)

### `game/scoring.ts`

Calcul des points :
```
points = max(0, 100 - temps_secondes) × multiplicateur + streakBonus
```

### `game/puzzles/`

Système modulaire de puzzles avec 4 générateurs :
- `decode.ts` — Base64, Hexadécimal
- `cipher.ts` — ROT13, Caesar (shift variable)
- `binary.ts` — Binaire → ASCII
- `quiz.ts` — Questions de code (150+ dans `quizQuestions.ts`)

Chaque module expose `generate(difficulty)` et `validate(puzzle, answer)`.

### `socket/socketHandlers.ts`

Couche de broadcast Socket.IO. Aucune logique métier — reçoit des données et les diffuse à tous les clients connectés.

### `twitch/twitchClient.ts`

Singleton TMI.js avec :
- Connexion/reconnexion automatique
- Logging sécurisé (jamais de token)
- Handlers `onMessage` et `onConnectionLost`

### `twitch/commands.ts`

Routeur de commandes Twitch. Parse le message, extrait la commande et les arguments, puis délègue à `gameSession`.

---

## Modules client

### Services

- **`socketService.ts`** — Singleton Socket.IO. Gère la connexion, reconnexion, et expose `on/off/connect/isConnected`.
- **`apiService.ts`** — Client HTTP (fetch). Appelle les endpoints REST du serveur.

### Hooks

- **`useLeaderboard.ts`** — S'abonne aux événements Socket.IO (`leaderboard:update`, `game:state`, `connection:degraded`). Expose le state complet (leaderboard, gameState, hackState, timer).
- **`useTwitchStatus.ts`** — Polling GET `/api/twitch/status` (défaut : 30s). Expose `channel`, `connected`, `loading`, `error`.

### Composants

- **`App.tsx`** — Layout principal, orchestration des composants
- **`StreamerPanel.tsx`** — Panneau de configuration et contrôle (nombre de questions, durée, start/next/end)
- **`HackProgressBar.tsx`** — Barre visuelle 0–100 % avec indicateurs de phase et boss
- **`GameStateHeader.tsx`** — Affiche la question courante, le numéro (N/M), et un timer dégressif
- **`Leaderboard.tsx`** — Liste ordonnée du classement
- **`LeaderboardRow.tsx`** — Ligne de classement avec variante top3 (style doré)
- **`CommandsPanel.tsx`** — Référence permanente des commandes chat disponibles

---

## Communication

```
                    HTTP REST
Client  ◄─────────────────────────► Serveur
         (fetch API : setup, start,
          next, end, state, health)

                   Socket.IO
Client  ◄──────────────────────────  Serveur
         (leaderboard:update,
          game:state,
          connection:degraded)

                   TMI.js (IRC)
Twitch  ◄─────────────────────────► Serveur
         (messages chat :
          !join, !r, !stats, etc.)
```

Le client ne communique **jamais** directement avec Twitch. Tout passe par le serveur.
