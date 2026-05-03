# 🚀 Déploiement

## Mode combiné (recommandé)

Le serveur Express peut servir le client React buildé, permettant de tout faire tourner depuis **une seule URL**.

### Build

```bash
# 1. Build du client
cd client
npm run build       # → client/dist/

# 2. Build du serveur
cd ../server
npm run build       # → server/dist/
```

### Lancement

```bash
cd server
npm start           # node dist/index.js
```

Le serveur détecte automatiquement `client/dist` et sert le SPA + l'API depuis le même port.

### Variables d'environnement (production)

```env
PORT=3000
CLIENT_ORIGIN=https://mondomaine.com

# Optionnel : chemin custom vers le build client
# CLIENT_DIST_PATH=../client/dist

TWITCH_CHANNEL=ma_chaine
TWITCH_OAUTH=oauth:mon_token_secret
```

> En production, `VITE_SOCKET_URL` côté client doit être **vide** pour utiliser `window.location.origin`.

---

## Déploiement VPS / VM

```bash
# Sur le serveur
git clone <repo> && cd twitch-game

# Install + build
cd client && npm ci && npm run build
cd ../server && npm ci && npm run build

# Configurer .env
cp server/.env.example server/.env
nano server/.env  # Remplir TWITCH_CHANNEL, TWITCH_OAUTH, etc.

# Lancer
cd server && npm start
```

### Avec PM2

```bash
npm install -g pm2
cd server
pm2 start dist/index.js --name twitch-game
pm2 save
pm2 startup
```

### Avec systemd

```ini
[Unit]
Description=Twitch Hack Game
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/twitch-game/server
ExecStart=/usr/bin/node dist/index.js
Restart=on-failure
EnvironmentFile=/opt/twitch-game/server/.env

[Install]
WantedBy=multi-user.target
```

---

## Reverse proxy (Nginx)

```nginx
server {
    listen 80;
    server_name game.mondomaine.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> Les headers `Upgrade` et `Connection` sont **requis** pour Socket.IO (WebSocket).

---

## Variables d'environnement — Référence

### Serveur (`server/.env`)

| Variable           | Requis | Défaut                     | Description                              |
|--------------------|--------|----------------------------|------------------------------------------|
| `PORT`             | Non    | `3000`                     | Port d'écoute du serveur                 |
| `CLIENT_ORIGIN`    | Non    | `http://localhost:5173`    | Origine CORS autorisée                   |
| `CLIENT_DIST_PATH` | Non    | `../client/dist` (relatif) | Chemin vers le build client              |
| `TWITCH_CHANNEL`   | Oui    | —                          | Nom de la chaîne Twitch                  |
| `TWITCH_OAUTH`     | Oui    | —                          | Token OAuth Twitch (`oauth:xxx`)         |

### Client (`client/.env`)

| Variable         | Requis | Défaut                      | Description                    |
|------------------|--------|-----------------------------|--------------------------------|
| `VITE_SOCKET_URL`| Non    | `window.location.origin`    | URL du serveur Socket.IO       |

---

## Checklist de déploiement

- [ ] Build client (`npm run build`)
- [ ] Build serveur (`npm run build`)
- [ ] `.env` serveur configuré (TWITCH_CHANNEL, TWITCH_OAUTH)
- [ ] `.env` client : `VITE_SOCKET_URL` vide en prod
- [ ] `CLIENT_ORIGIN` correspond à l'URL publique
- [ ] Reverse proxy configuré (WebSocket headers)
- [ ] Test : `curl https://mondomaine.com/api/health`
- [ ] Test : vérifier la connexion Twitch dans les logs
