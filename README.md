# 🎮 Twitch Hack Game

Un jeu interactif de type **"hack the system"** pour les streams Twitch. Les viewers participent en temps réel via le chat Twitch en résolvant des puzzles (décodage, chiffrement, binaire, quiz code) pour faire progresser une barre de hack de 0 à 100 %. Le streamer contrôle la partie depuis un panneau dédié dans le navigateur.

---

## ✨ Fonctionnalités

- **4 types de puzzles** — Décodage (Base64/Hex), Chiffrement (ROT13/Caesar), Binaire, Quiz code
- **Système de phases & boss** — Phase 1 (easy → 50 %), Boss, Phase 2 (medium → 100 %), Boss final
- **Scoring par rapidité** — Plus tu réponds vite, plus tu marques de points
- **Bonus streak** — Réponses correctes consécutives = points bonus (+5/streak, max +50)
- **Leaderboard temps réel** — Classement mis à jour en direct via Socket.IO
- **Commandes Twitch** — `!join`, `!r`, `!skip`, `!hint`, `!stats`, `!retry`, `!leaderboard`
- **Panneau streamer** — Configurer le nombre de questions, le timer, démarrer/terminer la partie
- **Barre de progression hack** — Affichage visuel de la progression (phase, difficulté, boss)
- **Timer automatique** — Passage au puzzle suivant à expiration du timer
- **Mode combiné** — Le serveur peut servir le client en production (une seule URL)

---

## 🏗️ Architecture

```
twitch-game/
├── client/                  # Frontend React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/      # Composants UI React
│   │   ├── hooks/           # Custom hooks (Socket.IO, Twitch status)
│   │   ├── services/        # API client + Socket.IO singleton
│   │   └── types/           # Types TypeScript partagés
│   └── ...
├── server/                  # Backend Node.js + Express + Socket.IO
│   ├── src/
│   │   ├── config/          # Variables d'environnement
│   │   ├── game/            # Logique de jeu (session, scoring, puzzles)
│   │   │   └── puzzles/     # Générateurs de puzzles (decode, cipher, binary, quiz)
│   │   ├── socket/          # Handlers Socket.IO
│   │   └── twitch/          # Client TMI.js + commandes chat
│   └── ...
└── docs/                    # Documentation
```

### Stack technique

| Couche     | Technologie                                         |
| ---------- | --------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite 7, TailwindCSS 4         |
| Backend    | Node.js, Express 5, TypeScript                      |
| Temps réel | Socket.IO 4 (serveur ↔ client)                      |
| Twitch     | TMI.js (IRC chat)                                   |
| Dev        | TSX (watch mode serveur), Vite (HMR client)         |

---

## 🚀 Installation

### Prérequis

- **Node.js** ≥ 18
- **npm** ≥ 9
- Un **compte Twitch** avec un token OAuth (pour connecter le chat)

### 1. Cloner le dépôt

```bash
git clone https://github.com/<votre-username>/twitch-game.git
cd twitch-game
```

### 2. Installer les dépendances

```bash
# Client
cd client
npm install

# Serveur
cd ../server
npm install
```

### 3. Configurer les variables d'environnement

#### Serveur (`server/.env`)

Copier le fichier d'exemple et le remplir :

```bash
cp server/.env.example server/.env
```

```env
# Port du serveur (défaut: 3000)
PORT=3000

# Origine du client pour CORS (défaut: http://localhost:5173)
CLIENT_ORIGIN=http://localhost:5173

# Optionnel : chemin vers le build client pour le mode combiné
# CLIENT_DIST_PATH=../client/dist

# Twitch (requis pour le chat)
TWITCH_CHANNEL=votre_chaine
TWITCH_OAUTH=oauth:votre_token_ici
```

#### Client (`client/.env`)

```bash
cp client/.env.example client/.env
```

```env
# URL du serveur Socket.IO
# Dev : http://localhost:3000
# Prod : laisser vide (même origine que la page)
VITE_SOCKET_URL=http://localhost:3000
```

### 4. Obtenir un token Twitch OAuth

Plusieurs options :
1. **Twitch Token Generator** (swiftyspiffy) — pour des tests rapides
2. **Twitch OAuth** — [Documentation officielle](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/)
3. **Twitch Chat OAuth** — [Authentification bot IRC](https://dev.twitch.tv/docs/irc/authenticate-bot)

Le token doit avoir le format `oauth:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`.

---

## 🎯 Utilisation

### Mode développement

Lancer le serveur et le client dans deux terminaux séparés :

```bash
# Terminal 1 — Serveur (port 3000)
cd server
npm run dev

# Terminal 2 — Client (port 5173)
cd client
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173) dans le navigateur.

### Mode production (combiné)

Build le client, puis le serveur sert tout :

```bash
# Build du client
cd client
npm run build

# Build du serveur
cd ../server
npm run build

# Lancer (sert le client + l'API depuis le même port)
npm start
```

Le serveur détecte automatiquement `client/dist` et sert le SPA.

---

## 🎮 Comment jouer

### Pour les viewers (chat Twitch)

| Commande              | Description                                         |
| --------------------- | --------------------------------------------------- |
| `!join`               | Rejoindre la partie en cours                        |
| `!r <réponse>`        | Soumettre une réponse au puzzle courant              |
| `!skip`               | Passer au puzzle suivant (coûte **100 points**)      |
| `!hint`               | Demander un indice boss (max 2 par boss)             |
| `!retry`              | Réessayer le puzzle courant (1 retry par puzzle)     |
| `!stats`              | Voir ses stats (score, rang, streak)                 |
| `!leaderboard`        | Afficher le Top 10 dans le chat                      |
| `!next`               | Passer à la question suivante (**streamer only**)    |

### Pour le streamer (panneau web)

1. **Configurer** — Nombre de questions (1–50) et durée par question (30s à 10min)
2. **Démarrer** — Cliquer sur "Démarrer une partie"
3. **Contrôler** — Skip manuel, passer à la question suivante, terminer

---

## 🧩 Types de puzzles

### 🔓 Decode (Base64 / Hex)

Décoder un texte encodé en Base64 ou Hexadécimal.

```
Prompt: "Decode (base64) : SGVsbG8gV29ybGQ="
Réponse: "Hello World"
```

### 🔐 Cipher (ROT13 / Caesar)

Déchiffrer un texte avec un chiffre de substitution.

```
Prompt: "Déchiffre (ROT13) : Uryyb Jbeyq"
Réponse: "Hello World"
```

### 💻 Binary

Convertir du binaire en texte ASCII.

```
Prompt: "Convertis ce binaire : 01001000 01101001"
Réponse: "Hi"
```

### 🧠 Quiz

Questions de culture code/programmation avec réponse courte.

```
Prompt: "En JavaScript, quel mot-clé déclare une constante ?"
Réponse: "const"
```

---

## 📊 Système de scoring

### Points de base

- **100 points max** par puzzle, dégressive selon le temps de réponse
- Formule : `max(0, 100 - temps_en_secondes) × multiplicateur_difficulté`

### Multiplicateurs de difficulté

| Difficulté | Multiplicateur | Phase              |
| ---------- | -------------- | -------------------|
| Easy       | ×1.0           | Phase 1            |
| Medium     | ×1.5           | Phase 2            |
| Hard       | ×2.0           | Boss               |

### Bonus streak

- À partir de la 2ème réponse correcte consécutive : **+5 pts/streak** (max +50)
- Une mauvaise réponse remet le streak à 0

---

## 🔄 Système de phases

```
Phase 1 (Easy)  ──→  5 bonnes réponses  ──→  Boss Phase 1 (Hard)
       │                                            │
       └──────── Hack: 0% → 50% ──────────────────┘
                                                    │
Phase 2 (Medium) ──→  15 bonnes réponses ──→  Boss Final (Hard)
       │                                            │
       └──────── Hack: 50% → 100% ────────────────┘
```

1. **Phase 1** — Puzzles faciles, +10 % par bonne réponse (→ 50 %)
2. **Boss Phase 1** — Un puzzle difficile, indices disponibles (`!hint`)
3. **Phase 2** — Puzzles moyens, progression proportionnelle (→ 100 %)
4. **Boss Final** — Dernier puzzle difficile, victoire à la résolution

---

## 🌐 API REST

### Endpoints

| Méthode | Route                | Description                            |
| ------- | -------------------- | -------------------------------------- |
| `GET`   | `/api/health`        | Health check                           |
| `GET`   | `/api/twitch/status` | Statut connexion Twitch (channel, connected) |
| `GET`   | `/api/game/setup`    | Configuration actuelle de la partie    |
| `POST`  | `/api/game/setup`    | Modifier la configuration              |
| `GET`   | `/api/game/state`    | État complet de la partie              |
| `POST`  | `/api/game/start`    | Démarrer une nouvelle partie           |
| `POST`  | `/api/game/next`     | Forcer le passage au puzzle suivant    |
| `POST`  | `/api/game/end`      | Terminer la partie                     |

### Exemples

```bash
# Vérifier la santé du serveur
curl http://localhost:3000/api/health

# Voir le statut Twitch
curl http://localhost:3000/api/twitch/status

# Configurer la partie (10 questions, 2 min par question)
curl -X POST http://localhost:3000/api/game/setup \
  -H "Content-Type: application/json" \
  -d '{"numberOfQuestions": 10, "questionDurationMs": 120000}'

# Démarrer la partie
curl -X POST http://localhost:3000/api/game/start

# Voir l'état de la partie
curl http://localhost:3000/api/game/state

# Passer à la question suivante
curl -X POST http://localhost:3000/api/game/next

# Terminer la partie
curl -X POST http://localhost:3000/api/game/end
```

---

## 🔌 Événements Socket.IO

### Serveur → Client

| Événement              | Payload                          | Description                              |
| ---------------------- | -------------------------------- | ---------------------------------------- |
| `leaderboard:update`   | `{ leaderboard: LeaderboardEntry[] }` | Mise à jour du classement               |
| `game:state`           | `GameStatePayload`               | État de la partie (question, timer, hack)|
| `connection:degraded`  | `{ reason: string }`            | Alerte connexion dégradée                |

### Types de payload

```typescript
interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  score: number;
}

interface GameStatePayload {
  gameState: "playing" | "ended" | "waiting";
  currentQuestionIndex?: number;
  questionOpenedAt?: number | null;
  questionText?: string | null;
  totalQuestions?: number;
  questionDurationMs?: number;
  hackState?: HackState;
}

interface HackState {
  phase: 1 | 2;
  difficulty: "easy" | "medium" | "hard";
  hackProgress: number;           // 0–100
  currentPuzzle: {
    type: "decode" | "cipher" | "binary" | "quiz";
    data: string;
    prompt: string;
    difficulty: "easy" | "medium" | "hard";
  } | null;
  correctAnswers: number;
  totalAnswers: number;
  bossPhaseActive: boolean;
  bossHints: number;              // 0, 1 ou 2
  puzzleOpenedAt: number | null;
}
```

---

## 📁 Structure détaillée des fichiers

### Client (`client/src/`)

```
src/
├── App.tsx                  # Composant racine — layout principal
├── App.css                  # Styles du composant App
├── index.css                # Tokens CSS globaux (thème sombre, monospace)
├── main.tsx                 # Point d'entrée React
├── components/
│   ├── CommandsPanel.tsx    # Liste des commandes Twitch disponibles
│   ├── GameStateHeader.tsx  # Indicateur d'état (question N/M, timer)
│   ├── HackProgressBar.tsx  # Barre de progression hack (0–100 %)
│   ├── Leaderboard.tsx      # Tableau du classement
│   ├── LeaderboardRow.tsx   # Ligne du classement (variante top3)
│   └── StreamerPanel.tsx    # Panneau de contrôle streamer
├── hooks/
│   ├── useLeaderboard.ts    # Hook Socket.IO (leaderboard, game state)
│   └── useTwitchStatus.ts   # Hook API (statut Twitch, polling)
├── services/
│   ├── apiService.ts        # Client API REST (fetch)
│   └── socketService.ts     # Singleton Socket.IO
└── types/
    └── socket.ts            # Types TypeScript (payloads, game state)
```

### Serveur (`server/src/`)

```
src/
├── index.ts                 # Point d'entrée — Express, Socket.IO, routes API
├── config/
│   └── env.ts               # Configuration centralisée (env vars)
├── game/
│   ├── gameSession.ts       # Logique de session (phases, joueurs, timer)
│   ├── scoring.ts           # Calcul des points (rapidité, difficulté, streak)
│   ├── questions.ts         # Gestion question courante (legacy)
│   ├── predefinedQuestions.ts # Banque de questions prédéfinies
│   └── puzzles/
│       ├── types.ts         # Types (Puzzle, Difficulty, PuzzleType)
│       ├── index.ts         # Générateur aléatoire + validation + indices
│       ├── decode.ts        # Puzzles décodage (Base64, Hex)
│       ├── cipher.ts        # Puzzles chiffrement (ROT13, Caesar)
│       ├── binary.ts        # Puzzles binaire → ASCII
│       ├── quiz.ts          # Puzzles quiz code
│       └── quizQuestions.ts # Banque de questions quiz (150+)
├── socket/
│   └── socketHandlers.ts    # Émetteurs Socket.IO (broadcast)
└── twitch/
    ├── twitchClient.ts      # Client TMI.js (connexion, reconnexion)
    └── commands.ts          # Parser de commandes (!join, !r, etc.)
```

---

## 🔧 Scripts npm

### Client

| Script          | Commande             | Description                      |
| --------------- | -------------------- | -------------------------------- |
| `dev`           | `vite`               | Serveur de dev avec HMR          |
| `build`         | `tsc -b && vite build` | Build de production            |
| `preview`       | `vite preview`       | Preview du build de prod         |
| `lint`          | `eslint .`           | Linting ESLint                   |

### Serveur

| Script          | Commande               | Description                      |
| --------------- | ---------------------- | -------------------------------- |
| `dev`           | `tsx watch src/index.ts` | Dev avec hot reload            |
| `build`         | `tsc`                  | Compilation TypeScript           |
| `start`         | `node dist/index.js`   | Lancement en production          |

---

## 🛡️ Sécurité

- Les tokens OAuth ne sont **jamais loggés** dans la console
- Les secrets sont stockés dans `.env` (gitignored)
- Les messages d'erreur Twitch sont sanitisés (pas de fuite de tokens)
- Les entrées utilisateurs sont limitées (64 chars pour le pseudo, 500 chars pour les réponses)
- CORS configuré pour n'autoriser que l'origine du client

---

## 📄 Licence

ISC
