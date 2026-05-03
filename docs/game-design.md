# 🎮 Game Design

## Concept

Les viewers du stream participent à un jeu de type **"hack the system"**. En résolvant des puzzles via le chat Twitch, ils font progresser collectivement une barre de hack de 0 à 100 %. Le jeu est structuré en 2 phases avec des boss intermédiaires.

---

## Système de phases

### Phase 1 — Easy (0 % → 50 %)
- Puzzles de difficulté **easy**
- +10 % par bonne réponse (5 bonnes réponses = 50 %)
- À 50 % → déclenchement du **Boss Phase 1**

### Boss Phase 1
- Un puzzle de difficulté **hard**
- Les joueurs peuvent utiliser `!hint` (max 2 indices)
  - Indice 1 : longueur de la réponse
  - Indice 2 : première lettre de la réponse
- Une fois résolu → passage en Phase 2

### Phase 2 — Medium (50 % → 100 %)
- Puzzles de difficulté **medium**
- Progression proportionnelle (100/15 ≈ 6.67 % par bonne réponse)
- 15 bonnes réponses nécessaires
- À 100 % → déclenchement du **Boss Final**

### Boss Final
- Un puzzle de difficulté **hard**
- Mêmes mécaniques d'indices
- Résolution = **victoire**, hack complété à 100 %

---

## Types de puzzles

### Decode (Base64 / Hex)
- **Easy** : mots courts, encodage Base64
- **Medium** : mots/phrases, encodage Hex
- **Hard** : phrases longues, encodages mixtes

### Cipher (ROT13 / Caesar)
- **Easy** : ROT13 sur des mots simples
- **Medium** : Caesar avec shift variable, mots plus longs
- **Hard** : Caesar avec shift inconnu, phrases complexes

### Binary
- **Easy** : 1–2 caractères ASCII en binaire
- **Medium** : mots courts
- **Hard** : mots/phrases longues

### Quiz Code
- 150+ questions de culture code/programmation
- Réponses courtes (1 mot généralement)
- Sujets : JavaScript, Python, HTML/CSS, algorithmes, concepts CS

---

## Scoring

### Points de base
- **100 points maximum** par puzzle
- Dégressive : `max(0, 100 - temps_en_secondes)`
- Répondre en 1s = 99 pts, en 50s = 50 pts, après 100s = 0 pts

### Multiplicateurs
| Difficulté | Multiplicateur |
|-----------|---------------|
| Easy      | ×1.0          |
| Medium    | ×1.5          |
| Hard      | ×2.0          |

### Bonus streak
- À partir de 2 réponses correctes consécutives : **+5 pts par step**
- Maximum : **+50 pts** (après 11 réponses consécutives)
- Reset à 0 sur une mauvaise réponse

### Formule complète
```
points = floor((max(0, 100 - temps_secondes) × multiplicateur) + streakBonus)
```

### Skip
- `!skip` passe au puzzle suivant
- Coûte **100 points** au joueur qui l'utilise
- Le score ne peut pas descendre en dessous de 0

---

## Commandes Twitch

| Commande         | Description                              | Condition           |
|-----------------|------------------------------------------|---------------------|
| `!join`         | Rejoindre la partie                       | Partie en cours      |
| `!r <réponse>`  | Soumettre une réponse                     | Partie en cours      |
| `!skip`         | Passer le puzzle (-100 pts)               | Partie en cours      |
| `!next`         | Question suivante                         | Streamer uniquement  |
| `!hint`         | Indice boss                               | Boss actif, max 2    |
| `!retry`        | Réessayer le puzzle (1/puzzle)            | Partie en cours      |
| `!stats`        | Voir ses stats                            | Toujours             |
| `!leaderboard`  | Top 10 dans le chat                       | Toujours             |

---

## Configuration streamer

| Paramètre            | Défaut      | Min      | Max       |
|----------------------|------------|----------|-----------|
| Nombre de questions   | 15         | 1        | 50        |
| Durée par question    | 5 minutes  | 10s      | 10 min    |

Configurable via le panneau web ou `POST /api/game/setup`.
Verrouillé pendant une partie en cours.

---

## Timer

- Chaque puzzle a un timer automatique (configurable)
- À expiration → passage automatique au puzzle suivant
- Le timer est visible dans l'interface (compte à rebours)
- Dernières 5 secondes = rouge clignotant
