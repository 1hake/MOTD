# Système d'authentification Frontend

## Vue d'ensemble

Ce système d'authentification complet utilise JWT avec refresh tokens, adapté pour Capacitor avec stockage sécurisé via `@capacitor/preferences`.

## Architecture

### 1. Stockage sécurisé (`src/lib/storage.ts`)

- Utilise `@capacitor/preferences` pour le stockage cross-platform
- Gère les tokens d'accès et de refresh séparément
- Stocke les données utilisateur de manière persistante
- Fonctions de nettoyage pour la déconnexion

### 2. Service d'authentification (`src/lib/auth.ts`)

- Gère les appels API d'authentification
- Implémente le refresh automatique des tokens
- Gère les erreurs d'authentification
- Interface unifiée pour login/signup/logout

### 3. API Client (`src/lib/api.ts`)

- Intercepteurs automatiques pour l'ajout des tokens
- Refresh automatique en cas d'expiration (401)
- Redirection automatique vers login si refresh échoue
- Gestion des erreurs d'authentification

### 4. Contexte React (`src/contexts/AuthContext.tsx`)

- État global d'authentification
- Initialisation automatique au démarrage
- Hooks personnalisés pour l'utilisation
- Gestion des états de chargement

### 5. Hooks personnalisés (`src/hooks/useAuth.ts`)

- `useAuth()` - Accès complet au contexte
- `useRequireAuth()` - Pour les routes protégées
- `useAuthActions()` - Actions d'authentification
- `useUser()` - Données utilisateur

## Utilisation

### Routes protégées

```tsx
import ProtectedRoute from '../components/ProtectedRoute'

;<ProtectedRoute>
  <MyComponent />
</ProtectedRoute>
```

### Actions d'authentification

```tsx
import { useAuth } from '../hooks/useAuth'

const { login, logout, user, isAuthenticated } = useAuth()

// Login
await login({ email, password })

// Logout
await logout()

// Vérifier l'authentification
if (isAuthenticated) {
  // Utilisateur connecté
}
```

### Accès aux données utilisateur

```tsx
import { useUser } from '../hooks/useUser'

const { user, refreshUser } = useUser()

// Accéder aux données
console.log(user?.email, user?.name)
```

## Fonctionnalités

### Refresh Token automatique

- Les tokens d'accès expirent en 15 minutes
- Refresh automatique en arrière-plan
- Nouveau refresh token à chaque refresh
- Gestion des erreurs de refresh

### Stockage sécurisé

- Compatible Capacitor (iOS/Android/Web)
- Stockage persistant entre les sessions
- Nettoyage automatique à la déconnexion
- Pas d'accès direct aux tokens côté client

### Gestion des erreurs

- Retry automatique en cas d'expiration
- Redirection vers login si refresh échoue
- Messages d'erreur utilisateur
- États de chargement

### Sécurité

- Tokens stockés de manière sécurisée
- Pas d'exposition des tokens dans l'URL
- Validation côté serveur
- Nettoyage complet à la déconnexion

## Configuration

### Variables d'environnement

```env
VITE_API_URL=http://localhost:4000
```

### Durée des tokens (Backend)

- Access token: 15 minutes
- Refresh token: 7 jours

## Composants

### AuthProvider

Enveloppe l'application pour fournir le contexte d'authentification.

### ProtectedRoute

Composant pour protéger les routes nécessitant une authentification.

### LogoutButton

Bouton de déconnexion avec nettoyage automatique.

## Intégration Capacitor

Le système est entièrement compatible avec Capacitor :

- Utilise `@capacitor/preferences` pour le stockage
- Fonctionne sur iOS, Android et Web
- Pas de dépendance à localStorage
- Stockage sécurisé natif

## Gestion des états

### États d'authentification

- `isLoading` - Initialisation ou action en cours
- `isAuthenticated` - Utilisateur connecté
- `user` - Données utilisateur actuelles

### Flux d'authentification

1. Initialisation au démarrage de l'app
2. Vérification des tokens existants
3. Refresh automatique si nécessaire
4. Redirection vers login si non authentifié

## Exemples d'utilisation

### Page de login

```tsx
const { login, isLoading } = useAuth()

const handleLogin = async (credentials) => {
  try {
    await login(credentials)
    navigate('/feed')
  } catch (error) {
    setError(error.message)
  }
}
```

### Composant protégé

```tsx
const { user, logout } = useAuth()

return (
  <div>
    <h1>Bonjour {user?.name}</h1>
    <button onClick={logout}>Déconnexion</button>
  </div>
)
```

### Appel API authentifié

```tsx
import { api } from '../lib/api'

// Le token est automatiquement ajouté
const response = await api.get('/posts')
```
