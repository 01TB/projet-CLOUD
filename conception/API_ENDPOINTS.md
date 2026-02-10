# Documentation des Endpoints API

Ce document liste tous les endpoints disponibles dans le backend Spring Boot.

---

## Table des matières

1. [Auth Controller](#auth-controller)
2. [Entreprise Controller](#entreprise-controller)
3. [Signalement Controller](#signalement-controller)
4. [Signalement Photo Controller](#signalement-photo-controller)
5. [Statut Avancement Controller](#statut-avancement-controller)
6. [Sync Controller](#sync-controller)
7. [Role Controller](#role-controller)
8. [Utilisateur Controller](#utilisateur-controller)

---

## Auth Controller

**Base URL:** `/api/auth`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/auth` | Test de fonctionnement du controller |
| `POST` | `/api/auth/login` | Authentification d'un utilisateur |
| `POST` | `/api/auth/sign-in` | Inscription d'un utilisateur (non implémenté) |

### Détails

#### `POST /api/auth/login`
- **Description:** Authentifie un utilisateur avec email et mot de passe
- **Body:** `LoginCredentialsDto`
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Réponse:** Token JWT (String)

---

## Entreprise Controller

**Base URL:** `/api/entreprises`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/entreprises` | Récupérer toutes les entreprises |
| `GET` | `/api/entreprises/{id}` | Récupérer une entreprise par son ID |

### Détails

#### `GET /api/entreprises`
- **Description:** Retourne la liste de toutes les entreprises
- **Réponse:** `List<Entreprise>`

#### `GET /api/entreprises/{id}`
- **Description:** Retourne une entreprise spécifique
- **Paramètres:** `id` (Integer) - ID de l'entreprise
- **Réponse:** `Entreprise`
- **Erreurs:** `404` si l'entreprise n'existe pas

---

## Signalement Controller

**Base URL:** `/api/signalements`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/signalements` | Créer un nouveau signalement |
| `GET` | `/api/signalements` | Récupérer tous les signalements |
| `GET` | `/api/signalements/{id}` | Récupérer un signalement par ID |
| `PUT` | `/api/signalements/{id}` | Mettre à jour un signalement |
| `DELETE` | `/api/signalements/{id}` | Supprimer un signalement |
| `GET` | `/api/signalements/entreprise/{entrepriseId}` | Signalements par entreprise |
| `GET` | `/api/signalements/utilisateur/{utilisateurId}` | Signalements par utilisateur créateur |
| `GET` | `/api/signalements/synchro/{synchro}` | Signalements par statut de synchronisation |
| `GET` | `/api/signalements/budget/min/{budgetMin}` | Signalements avec budget minimum |
| `GET` | `/api/signalements/surface/min/{surfaceMin}` | Signalements avec surface minimum |
| `GET` | `/api/signalements/budget/range` | Signalements par plage de budget |
| `GET` | `/api/signalements/surface/range` | Signalements par plage de surface |
| `PATCH` | `/api/signalements/{id}/synchro` | Mettre à jour le statut de synchronisation |

### Détails

#### `POST /api/signalements`
- **Description:** Crée un nouveau signalement
- **Body:** `SignalementInsertDTO`
- **Réponse:** `SignalementResponseDTO` avec statut `201 CREATED`

#### `GET /api/signalements`
- **Description:** Retourne la liste de tous les signalements
- **Réponse:** `List<SignalementResponseDTO>`

#### `GET /api/signalements/{id}`
- **Description:** Retourne un signalement spécifique
- **Paramètres:** `id` (Integer)
- **Réponse:** `SignalementResponseDTO`

#### `PUT /api/signalements/{id}`
- **Description:** Met à jour un signalement existant
- **Paramètres:** `id` (Integer)
- **Body:** `SignalementInsertDTO`
- **Réponse:** `SignalementResponseDTO`

#### `DELETE /api/signalements/{id}`
- **Description:** Supprime un signalement
- **Paramètres:** `id` (Integer)
- **Réponse:** 
  ```json
  {
    "message": "Signalement supprimé avec succès",
    "id": "string"
  }
  ```

#### `GET /api/signalements/entreprise/{entrepriseId}`
- **Description:** Récupère les signalements d'une entreprise
- **Paramètres:** `entrepriseId` (Integer)
- **Réponse:** `List<SignalementResponseDTO>`

#### `GET /api/signalements/utilisateur/{utilisateurId}`
- **Description:** Récupère les signalements créés par un utilisateur
- **Paramètres:** `utilisateurId` (Integer)
- **Réponse:** `List<SignalementResponseDTO>`

#### `GET /api/signalements/synchro/{synchro}`
- **Description:** Récupère les signalements par statut de synchronisation
- **Paramètres:** `synchro` (Boolean)
- **Réponse:** `List<SignalementResponseDTO>`

#### `GET /api/signalements/budget/min/{budgetMin}`
- **Description:** Récupère les signalements avec un budget minimum
- **Paramètres:** `budgetMin` (Integer)
- **Réponse:** `List<SignalementResponseDTO>`

#### `GET /api/signalements/surface/min/{surfaceMin}`
- **Description:** Récupère les signalements avec une surface minimum
- **Paramètres:** `surfaceMin` (Double)
- **Réponse:** `List<SignalementResponseDTO>`

#### `GET /api/signalements/budget/range`
- **Description:** Récupère les signalements dans une plage de budget
- **Query params:** `min` (Integer), `max` (Integer)
- **Exemple:** `/api/signalements/budget/range?min=1000&max=5000`
- **Réponse:** `List<SignalementResponseDTO>`

#### `GET /api/signalements/surface/range`
- **Description:** Récupère les signalements dans une plage de surface
- **Query params:** `min` (Double), `max` (Double)
- **Exemple:** `/api/signalements/surface/range?min=100.0&max=500.0`
- **Réponse:** `List<SignalementResponseDTO>`

#### `PATCH /api/signalements/{id}/synchro`
- **Description:** Met à jour uniquement le statut de synchronisation
- **Paramètres:** `id` (Integer)
- **Query params:** `synchro` (Boolean)
- **Réponse:** `SignalementResponseDTO`

---

## Signalement Photo Controller

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/signalements/{idSignalement}/photos` | Liste des photos d'un signalement |
| `GET` | `/api/images/{fileName}` | Servir un fichier image |

### Détails

#### `GET /api/signalements/{idSignalement}/photos`
- **Description:** Récupère la liste des noms de fichiers photo pour un signalement
- **Paramètres:** `idSignalement` (Integer)
- **Réponse:** `List<String>` - noms des fichiers
- **Exemple de réponse:** `["photo_1_sig_3.jpg", "photo_2_sig_3.png"]`

#### `GET /api/images/{fileName}`
- **Description:** Sert un fichier image depuis le répertoire de stockage
- **Paramètres:** `fileName` (String) - nom du fichier image
- **Réponse:** Fichier image (JPEG ou PNG)
- **Headers:** 
  - `Content-Type`: image/jpeg ou image/png
  - `Cache-Control`: public, max-age=86400

---

## Statut Avancement Controller

**Base URL:** `/api/statutAvancements`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/statutAvancements` | Récupérer tous les statuts |
| `GET` | `/api/statutAvancements/{id}` | Récupérer un statut par ID |

### Détails

#### `GET /api/statutAvancements`
- **Description:** Retourne la liste de tous les statuts d'avancement
- **Réponse:** `List<StatutAvancement>`

#### `GET /api/statutAvancements/{id}`
- **Description:** Retourne un statut d'avancement spécifique
- **Paramètres:** `id` (Integer)
- **Réponse:** `StatutAvancement`
- **Erreurs:** `404` si le statut n'existe pas

---

## Sync Controller

**Base URL:** `/api/sync`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/sync` | Synchronisation principale |
| `POST` | `/api/sync/push` | Push vers Firebase |
| `POST` | `/api/sync/pull` | Pull depuis Firebase |
| `POST` | `/api/sync/bidirectional` | Synchronisation bidirectionnelle |
| `GET` | `/api/sync/status/{entityType}` | Statut de sync d'une entité |
| `GET` | `/api/sync/supported-entities` | Liste des types supportés |
| `GET` | `/api/sync/health` | Health check du service |

### Types d'entités supportés

- `roles`
- `statuts_avancement`
- `entreprises`
- `parametres`
- `utilisateurs`
- `signalements`
- `avancements_signalement`
- `signalements_photos`
- `utilisateurs_bloques`

### Détails

#### `POST /api/sync`
- **Description:** Endpoint principal de synchronisation
- **Body:** `SyncRequest`
  ```json
  {
    "entityTypes": ["signalements", "statuts_avancement"],
    "direction": "PUSH",
    "forceSync": false
  }
  ```
- **Direction:** `PUSH`, `PULL`, ou `BIDIRECTIONAL`
- **Réponse:** `SyncResponse`

#### `POST /api/sync/push`
- **Description:** Push vers Firebase (simplifié)
- **Query params:** 
  - `entities` (optionnel) - liste séparée par virgules
  - `forceSync` (optionnel, default: false)
- **Exemple:** `/api/sync/push?entities=signalements,utilisateurs`
- **Réponse:** `SyncResponse`

#### `POST /api/sync/pull`
- **Description:** Pull depuis Firebase (simplifié)
- **Query params:** `entities` (optionnel)
- **Réponse:** `SyncResponse`

#### `POST /api/sync/bidirectional`
- **Description:** Synchronisation bidirectionnelle
- **Query params:** 
  - `entities` (optionnel)
  - `forceSync` (optionnel, default: false)
- **Réponse:** `SyncResponse`

#### `GET /api/sync/status/{entityType}`
- **Description:** Vérifie le statut de synchronisation d'un type d'entité
- **Paramètres:** `entityType` (String)
- **Réponse:** Message de statut

#### `GET /api/sync/supported-entities`
- **Description:** Retourne la liste des types d'entités supportés
- **Réponse:** `List<String>`

#### `GET /api/sync/health`
- **Description:** Health check du service de synchronisation
- **Réponse:** `HealthResponse`
  ```json
  {
    "status": "UP",
    "service": "Sync Service",
    "supportedEntities": [...],
    "registeredRepositories": [...]
  }
  ```

---

## Role Controller

**Base URL:** `/api/roles`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/roles` | Récupérer tous les rôles |

### Détails

#### `GET /api/roles`
- **Description:** Retourne la liste de tous les rôles disponibles
- **Réponse:** `List<Role>`

---

## Utilisateur Controller

**Base URL:** `/api/utilisateurs`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/utilisateurs` | Créer un utilisateur |
| `GET` | `/api/utilisateurs` | Récupérer tous les utilisateurs |
| `GET` | `/api/utilisateurs/{id}` | Récupérer un utilisateur par ID |
| `GET` | `/api/utilisateurs/search` | Rechercher par email |
| `PUT` | `/api/utilisateurs/{id}` | Modifier un utilisateur |
| `DELETE` | `/api/utilisateurs/{id}` | Supprimer un utilisateur |
| `POST` | `/api/utilisateurs/{id}/bloquer` | Bloquer un utilisateur |
| `DELETE` | `/api/utilisateurs/{id}/bloquer` | Débloquer un utilisateur |
| `GET` | `/api/utilisateurs/{id}/est-bloque` | Vérifier si bloqué |

### Détails

#### `POST /api/utilisateurs`
- **Description:** Crée un nouvel utilisateur
- **Body:** `UtilisateurDTO`
- **Réponse:** `UtilisateurResponseDTO` avec statut `201 CREATED`
- **Erreurs:** `400` si données invalides

#### `GET /api/utilisateurs`
- **Description:** Retourne la liste de tous les utilisateurs avec info de blocage
- **Réponse:** `List<UtilisateurResponseDTO>`

#### `GET /api/utilisateurs/{id}`
- **Description:** Retourne un utilisateur spécifique avec info de blocage
- **Paramètres:** `id` (Integer)
- **Réponse:** `UtilisateurResponseDTO`
- **Erreurs:** `404` si l'utilisateur n'existe pas

#### `GET /api/utilisateurs/search`
- **Description:** Recherche un utilisateur par email
- **Query params:** `email` (String)
- **Exemple:** `/api/utilisateurs/search?email=user@example.com`
- **Réponse:** `UtilisateurDTO`
- **Erreurs:** `404` si l'utilisateur n'existe pas

#### `PUT /api/utilisateurs/{id}`
- **Description:** Modifie un utilisateur existant
- **Paramètres:** `id` (Integer)
- **Body:** `UtilisateurDTO`
- **Réponse:** `UtilisateurResponseDTO`
- **Erreurs:** 
  - `400` si données invalides
  - `409` si conflit (ex: email déjà utilisé)

#### `DELETE /api/utilisateurs/{id}`
- **Description:** Supprime un utilisateur
- **Paramètres:** `id` (Integer)
- **Réponse:** 
  ```json
  {
    "message": "Utilisateur supprimé avec succès"
  }
  ```
- **Erreurs:** `404` si l'utilisateur n'existe pas

#### `POST /api/utilisateurs/{id}/bloquer`
- **Description:** Bloque un utilisateur
- **Paramètres:** `id` (Integer)
- **Réponse:** 
  ```json
  {
    "message": "Utilisateur bloqué avec succès",
    "dateBlocage": "date",
    "utilisateurId": "id"
  }
  ```
- **Erreurs:** 
  - `404` si l'utilisateur n'existe pas
  - `409` si déjà bloqué

#### `DELETE /api/utilisateurs/{id}/bloquer`
- **Description:** Débloque un utilisateur
- **Paramètres:** `id` (Integer)
- **Réponse:** 
  ```json
  {
    "message": "Utilisateur débloqué avec succès"
  }
  ```
- **Erreurs:** 
  - `404` si l'utilisateur n'existe pas
  - `409` si pas bloqué

#### `GET /api/utilisateurs/{id}/est-bloque`
- **Description:** Vérifie si un utilisateur est bloqué
- **Paramètres:** `id` (Integer)
- **Réponse:** 
  ```json
  {
    "utilisateurId": "id",
    "estBloque": true/false
  }
  ```

---

## Résumé des Endpoints

| Controller | Nombre d'endpoints |
|------------|-------------------|
| Auth | 3 |
| Entreprise | 2 |
| Signalement | 13 |
| Signalement Photo | 2 |
| Statut Avancement | 2 |
| Sync | 7 |
| Role | 1 |
| Utilisateur | 9 |
| **Total** | **39** |
