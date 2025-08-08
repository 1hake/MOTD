
# Music BeReal – Fullstack (TypeScript)

Monorepo minimal pour lancer l'app **du premier coup** (web + backend).  
Notifications FCM incluses en *option* (non bloquantes).

## 0) Prérequis
- Node 20+
- npm 9+

## 1) Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
# Backend: http://localhost:4000
```

## 2) Frontend – Web (vite)
```bash
cd frontend
npm install
npm run dev
# Front: http://localhost:5173
```

Par défaut, le frontend pointe vers `http://localhost:4000`. Pour mobile/émulateur Android, crée `frontend/.env` :
```
VITE_API_URL=http://10.0.2.2:4000
```

## 3) Mobile (Capacitor) – iOS/Android
```bash
cd frontend
npm run build
npm run cap:init   # initialise Capacitor + ajoute iOS/Android si pas déjà fait
npm run cap:sync
npm run cap:run:ios      # ou: npm run cap:run:android
```

> Ouvre Xcode/Android Studio si nécessaire pour signer et builder.

## 4) Notifications (Optionnel)
- Configure Firebase (fichiers natifs + credentials Admin côté backend si tu veux envoyer des push).
- Le code client n'explose pas si FCM est absent (no-op sur Web et si pas natif).

## 5) API test rapide
- Auth:
```
POST /auth/signup { "email": "toi@ex.com", "password": "password123" }  -> { token: "jwt-token", user }
POST /auth/login  { "email": "toi@ex.com", "password": "password123" }  -> { token: "jwt-token", user }
POST /auth/email  { "email": "toi@ex.com" }  -> { token: "jwt-token", user } (simplified auth)
```
- Avec le token JWT, tu peux:
  - `POST /posts` { title, artist, link, userId }
  - `GET  /posts/today?userId=<id>`
  - `GET  /posts/me?userId=<id>`
  - `POST /friends` { userId, friendEmail }
  - `GET  /friends?userId=<id>`

## 6) Notes
- Sécurité: auth simplifiée (email/password sans hash). Mets un vrai bcrypt/scrypt pour prod.
- SQLite par défaut; passe à Postgres via `.env` + `prisma migrate`.
- OAuth retiré pour simplifier, seule l'auth email/password est supportée.

Bon dev! 🎧
