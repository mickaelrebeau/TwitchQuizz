# 🔄 Événements Socket.IO

## Connexion

Le client se connecte via `VITE_SOCKET_URL` (dev) ou `window.location.origin` (prod).

Options : `reconnection: true`, `reconnectionAttempts: Infinity`, `reconnectionDelay: 2s`, `timeout: 20s`.

---

## Serveur → Client

### `leaderboard:update`

Émis à chaque changement du classement.

```json
{
  "leaderboard": [
    { "rank": 1, "playerId": "viewer42", "displayName": "Viewer42", "score": 450 },
    { "rank": 2, "playerId": "codemaster", "displayName": "CodeMaster", "score": 320 }
  ]
}
```

**Quand** : join, réponse correcte, skip, boss battu.

---

### `game:state`

Émis à chaque changement d'état.

```json
{
  "gameState": "playing",
  "currentQuestionIndex": 5,
  "questionOpenedAt": 1714737600000,
  "questionText": "Déchiffre (ROT13) : Uryyb Jbeyq",
  "totalQuestions": 15,
  "questionDurationMs": 300000,
  "hackState": {
    "phase": 1,
    "difficulty": "easy",
    "hackProgress": 40,
    "currentPuzzle": { "type": "cipher", "data": "Uryyb Jbeyq", "prompt": "...", "difficulty": "easy" },
    "correctAnswers": 4,
    "totalAnswers": 12,
    "bossPhaseActive": false,
    "bossHints": 0,
    "puzzleOpenedAt": 1714737600000
  }
}
```

**Quand** : démarrage, nouveau puzzle, réponse, indice boss, timer expiré, fin de partie.

---

### `connection:degraded`

Émis quand la connexion Twitch est perdue.

```json
{ "reason": "twitch_disconnected" }
```

---

## Événements standards

- `connect` — Client connecté → `connectionStatus = "connected"`
- `disconnect` — Client déconnecté → `connectionStatus = "disconnected"`

---

## Utilisation côté client

```tsx
// Via hook (recommandé)
const { leaderboard, gameState, hackState } = useLeaderboard();

// Via service
socketService.connect();
socketService.on('leaderboard:update', (payload) => { /* ... */ });
```
