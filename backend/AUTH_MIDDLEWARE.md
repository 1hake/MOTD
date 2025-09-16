# Middleware d'authentification JWT

## Description

Ce middleware d'authentification JWT a été créé pour sécuriser les routes de l'API. Il vérifie la validité des tokens JWT et ajoute les informations de l'utilisateur à l'objet `req`.

## Fichiers

- `src/middleware/auth.ts` - Middleware d'authentification principal

## Fonctionnalités

### 1. `authenticateToken`

Middleware obligatoire qui :

- Vérifie la présence du token dans l'en-tête `Authorization: Bearer <token>`
- Valide le token JWT
- Vérifie que l'utilisateur existe toujours en base de données
- Ajoute les informations utilisateur à `req.user`
- Retourne une erreur 401 si l'authentification échoue

### 2. `optionalAuth`

Middleware optionnel qui :

- Tente d'authentifier l'utilisateur si un token est fourni
- Continue sans erreur si aucun token n'est fourni
- Utile pour les routes qui peuvent fonctionner avec ou sans authentification

## Utilisation

### Routes protégées

```typescript
import { authenticateToken } from '../middleware/auth'

router.post('/posts', authenticateToken, async (req, res) => {
  const userId = req.user!.id // L'utilisateur est garanti d'être authentifié
  // ... logique de la route
})
```

### Routes avec authentification optionnelle

```typescript
import { optionalAuth } from '../middleware/auth'

router.get('/posts', optionalAuth, async (req, res) => {
  if (req.user) {
    // Utilisateur authentifié
    const userId = req.user.id
  } else {
    // Utilisateur non authentifié
  }
  // ... logique de la route
})
```

## Structure de `req.user`

```typescript
interface User {
  id: number
  email: string
  name?: string
  profileImage?: string
  platformPreference?: string
}
```

## Routes modifiées

### Posts (`/posts`)

- `POST /` - Créer un post (authentification requise)
- `GET /today` - Posts des amis aujourd'hui (authentification requise)
- `GET /me` - Mes posts (authentification requise)
- `POST /:postId/like` - Liker un post (authentification requise)
- `DELETE /:postId/like` - Unliker un post (authentification requise)

### Friends (`/friends`)

- `POST /` - Ajouter un ami (authentification requise)
- `GET /` - Liste des amis (authentification requise)
- `GET /posts` - Posts des amis (authentification requise)
- `GET /status` - Statut d'amitié (authentification requise)
- `DELETE /` - Supprimer un ami (authentification requise)

### Users (`/users`)

- `GET /:id` - Profil utilisateur (public)
- `PUT /:id` - Modifier le profil (authentification requise + vérification propriétaire)
- `GET /me` - Mon profil (authentification requise)
- `GET /search/:query` - Rechercher des utilisateurs (public)

## Gestion des erreurs

Le middleware retourne les codes d'erreur suivants :

- `401` - Token manquant, invalide ou expiré
- `500` - Erreur serveur lors de la vérification

## Configuration

Le secret JWT est lu depuis la variable d'environnement `SESSION_SECRET` ou utilise une valeur par défaut.

## Sécurité

- Les tokens JWT sont vérifiés à chaque requête
- L'utilisateur est vérifié en base de données pour s'assurer qu'il existe toujours
- Les routes de modification de profil vérifient que l'utilisateur modifie son propre profil
- Les tokens ont une durée de vie de 30 jours (configurable dans `auth.ts`)
