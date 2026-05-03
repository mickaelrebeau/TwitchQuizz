# 🔌 API Reference

## Base URL

- **Développement** : `http://localhost:3000`
- **Production** : Même domaine que le client (mode combiné)

---

## Endpoints

### `GET /api/health`

Health check du serveur.

**Response** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-05-03T12:00:00.000Z"
}
```

---

### `GET /api/twitch/status`

Statut de la connexion Twitch IRC.

**Response** `200 OK`

```json
{
  "channel": "mike_dreeman",
  "connected": true
}
```

| Champ       | Type              | Description                                      |
| ----------- | ----------------- | ------------------------------------------------ |
| `channel`   | `string \| null`  | Nom de la chaîne Twitch, `null` si non configuré |
| `connected` | `boolean`         | `true` si connecté au chat IRC                   |

---

### `GET /api/game/setup`

Configuration actuelle de la partie (modifiable avant le démarrage).

**Response** `200 OK`

```json
{
  "questionDurationMs": 300000,
  "numberOfQuestions": 15
}
```

| Champ               | Type     | Description                               |
| ------------------- | -------- | ----------------------------------------- |
| `questionDurationMs` | `number` | Durée par question en millisecondes       |
| `numberOfQuestions`  | `number` | Nombre total de questions pour la partie  |

---

### `POST /api/game/setup`

Modifier la configuration de la partie. **Ignoré si une partie est en cours.**

**Request Body**

```json
{
  "questionDurationMs": 120000,
  "numberOfQuestions": 10
}
```

| Champ                | Type     | Requis | Contraintes                 |
| -------------------- | -------- | ------ | --------------------------- |
| `questionDurationMs` | `number` | Non    | 10 000 – 600 000 ms        |
| `numberOfQuestions`   | `number` | Non    | 1 – 50 (entier)            |

**Response** `200 OK` — Retourne la configuration mise à jour (même format que `GET`).

---

### `GET /api/game/state`

État complet de la partie en cours.

**Response** `200 OK`

```json
{
  "gameState": "playing",
  "currentQuestionIndex": 3,
  "questionOpenedAt": 1714737600000,
  "questionText": "Decode (base64) : SGVsbG8=",
  "totalQuestions": 15,
  "questionDurationMs": 300000,
  "hackState": {
    "phase": 1,
    "difficulty": "easy",
    "hackProgress": 30,
    "currentPuzzle": {
      "type": "decode",
      "data": "SGVsbG8=",
      "prompt": "Decode (base64) : SGVsbG8=",
      "difficulty": "easy"
    },
    "correctAnswers": 3,
    "totalAnswers": 7,
    "bossPhaseActive": false,
    "bossHints": 0,
    "puzzleOpenedAt": 1714737600000
  }
}
```

| Champ                 | Type                          | Description                                |
| --------------------- | ----------------------------- | ------------------------------------------ |
| `gameState`           | `"waiting" \| "playing" \| "ended"` | État courant de la partie            |
| `currentQuestionIndex`| `number`                      | Index de la question (0-based)             |
| `questionOpenedAt`    | `number \| null`              | Timestamp d'ouverture du puzzle (ms)       |
| `questionText`        | `string \| null`              | Texte/prompt du puzzle courant             |
| `totalQuestions`       | `number`                      | Nombre total de questions configuré        |
| `questionDurationMs`  | `number`                      | Durée par question (ms)                    |
| `hackState`           | `HackState`                   | État complet du hack (voir ci-dessous)     |

---

### `POST /api/game/start`

Démarre une nouvelle session de jeu. Réinitialise tout (joueurs, scores, progression).

**Request Body** — Aucun

**Response** `200 OK`

```json
{
  "ok": true,
  "gameState": "playing"
}
```

---

### `POST /api/game/next`

Force le passage au puzzle suivant (contrôle streamer). Si toutes les questions ont été posées, la partie se termine.

**Request Body** — Aucun

**Response** `200 OK`

```json
{
  "ok": true
}
```

---

### `POST /api/game/end`

Termine la partie immédiatement.

**Request Body** — Aucun

**Response** `200 OK`

```json
{
  "ok": true,
  "gameState": "ended"
}
```

---

## Types partagés

### `HackState`

```typescript
interface HackState {
  phase: 1 | 2;
  difficulty: "easy" | "medium" | "hard";
  hackProgress: number;           // 0 à 100
  currentPuzzle: {
    type: "decode" | "cipher" | "binary" | "quiz";
    data: string;                 // Donnée encodée/chiffrée
    prompt: string;               // Texte affiché
    difficulty: "easy" | "medium" | "hard";
  } | null;
  correctAnswers: number;         // Total bonnes réponses
  totalAnswers: number;           // Total tentatives
  bossPhaseActive: boolean;       // true pendant un boss
  bossHints: number;              // 0, 1 ou 2
  puzzleOpenedAt: number | null;  // Timestamp ouverture
}
```

---

## Codes d'erreur HTTP

| Code | Cas d'usage                            |
| ---- | -------------------------------------- |
| 200  | Succès                                 |
| 404  | Route inconnue                         |
| 500  | Erreur serveur interne                 |

> **Note** : L'API ne retourne pas de codes 4xx personnalisés. Les erreurs de validation (ex: configuration invalide) sont silencieusement corrigées (clamp des valeurs).
