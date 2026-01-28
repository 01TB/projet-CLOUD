# Spécification API - Application Mobile Roadwork

## Vue d'ensemble

Cette application mobile est une application de signalement de problèmes routiers qui permet aux utilisateurs de :
- Signaler des problèmes routiers
- Consulter la carte des signalements existants
- Créer et gérer leur profil
- Voir des statistiques sur les signalements

## Architecture

### Frontend (Ionic Vue 3)
- **Framework** : Vue 3 + Ionic 8
- **State Management** : Pinia
- **Routing** : Vue Router 4
- **HTTP Client** : Axios
- **Maps** : Leaflet + @vue-leaflet/vue-leaflet

### Backend (Spring Boot)
- **Framework** : Spring Boot
- **Base de données** : PostgreSQL
- **Authentication** : JWT + Spring Security

## Endpoints API

### Authentification (`/api/auth`)

#### POST `/api/auth/register`
- **Description** : Inscription d'un nouvel utilisateur
- **Arguments** :
  ```json
  {
    "nom": "string",
    "prenom": "string", 
    "email": "string",
    "password": "string",
    "telephone": "string (optionnel)",
    "role": "integer" // 1: Manager, 2: Utilisateur
  }
  ```
- **Retour attendu** :
  ```json
  {
    "success": true,
    "user": {
      "id": "integer",
      "nom": "string",
      "prenom": "string",
      "email": "string",
      "telephone": "string",
      "role": "integer",
      "date_creation": "datetime",
      "date_modification": "datetime"
    },
    "token": "string",
    "entreprises": {
      "id": "integer",
      "nom": "string"
    }
  }
  ```
- **Erreurs possibles** :
  ```json
  {
    "success": false,
    "message": "Email déjà utilisé",
    "code": "EMAIL_EXISTS"
  }
  ```

#### POST `/api/auth/login`
- **Description** : Connexion d'un utilisateur existant
- **Arguments** :
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Retour attendu** :
  ```json
  {
    "success": true,
    "user": {
      "id": "integer",
      "nom": "string",
      "prenom": "string",
      "email": "string",
      "telephone": "string",
      "role": "integer",
      "date_creation": "datetime",
      "date_modification": "datetime"
    },
    "token": "string",
    "entreprises": {
      "id": "integer",
      "nom": "string"
    }
  }
  ```
- **Erreurs possibles** :
  ```json
  {
    "success": false,
    "message": "Email ou mot de passe incorrect",
    "code": "INVALID_CREDENTIALS"
  }
  ```

#### POST `/api/auth/logout`
- **Description** : Déconnexion de l'utilisateur
- **Headers** : `Authorization: Bearer <token>`
- **Retour attendu** :
  ```json
  {
    "success": true,
    "message": "Déconnexion réussie"
  }
  ```

#### GET `/api/auth/me`
- **Description** : Récupérer les informations de l'utilisateur connecté
- **Headers** : `Authorization: Bearer <token>`
- **Retour attendu** :
  ```json
  {
    "success": true,
    "user": {
      "id": "integer",
      "nom": "string",
      "prenom": "string",
      "email": "string",
      "telephone": "string",
      "role": "integer",
      "date_creation": "datetime",
      "date_modification": "datetime"
    }
  }
  ```

#### PUT `/api/auth/update`
- **Description** : Mettre à jour le profil utilisateur
- **Headers** : `Authorization: Bearer <token>`
- **Arguments** :
  ```json
  {
    "nom": "string (optionnel)",
    "prenom": "string (optionnel)",
    "telephone": "string (optionnel)"
  }
  ```
- **Retour attendu** :
  ```json
  {
    "success": true,
    "user": {
      "id": "integer",
      "nom": "string",
      "prenom": "string",
      "email": "string",
      "telephone": "string",
      "role": "integer",
      "date_creation": "datetime",
      "date_modification": "datetime"
    }
  }
  ```

### Signalements (`/api/signalements`)

#### GET `/api/signalements`
- **Description** : Récupérer tous les signalements (avec pagination et filtres)
- **Headers** : `Authorization: Bearer <token>` (optionnel)
- **Paramètres query** :
  - `page` : integer (page actuelle, défaut: 1)
  - `limit` : integer (nombre par page, défaut: 20)
  - `statut` : string[] (filtre par statut)
  - `id_utilisateur_createur` : integer (filtre par utilisateur)
- **Retour attendu** :
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "integer",
        "description": "string",
        "surface": "decimal",
        "budget": "decimal",
        "adresse": "string",
        "localisation": {
          "type": "Point",
          "coordinates": [longitude, latitude]
        },
        "date_creation": "datetime",
        "date_modification": "datetime",
        "id_utilisateur_createur": "integer",
        "avancement_signalements": [
          {
            "id": "integer",
            "statut_avancement": {
              "id": "integer",
              "nom": "string"
            },
            "date_creation": "datetime",
            "commentaire": "string"
          }
        ]
      }
    ],
    "pagination": {
      "page": "integer",
      "limit": "integer",
      "total": "integer",
      "totalPages": "integer"
    }
  }
  ```

#### POST `/api/signalements`
- **Description** : Créer un nouveau signalement
- **Headers** : `Authorization: Bearer <token>`
- **Arguments** :
  ```json
  {
    "description": "string",
    "surface": "decimal",
    "budget": "decimal",
    "adresse": "string",
    "localisation": {
      "type": "Point",
      "coordinates": [longitude, latitude]
    },
    "images": ["string"] // URLs des images
  }
  ```
- **Retour attendu** :
  ```json
  {
    "success": true,
    "data": {
      "id": "integer",
      "description": "string",
      "surface": "decimal",
      "budget": "decimal",
      "adresse": "string",
      "localisation": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "date_creation": "datetime",
      "id_utilisateur_createur": "integer"
    }
  }
  ```

#### GET `/api/signalements/{id}`
- **Description** : Récupérer un signalement spécifique
- **Headers** : `Authorization: Bearer <token>` (optionnel)
- **Retour attendu** :
  ```json
  {
    "success": true,
    "data": {
      "id": "integer",
      "description": "string",
      "surface": "decimal",
      "budget": "decimal",
      "adresse": "string",
      "localisation": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "date_creation": "datetime",
      "date_modification": "datetime",
      "id_utilisateur_createur": "integer",
      "avancement_signalements": [
        {
          "id": "integer",
          "statut_avancement": {
            "id": "integer",
            "nom": "string"
          },
          "date_creation": "datetime",
          "commentaire": "string"
        }
      ]
    }
  }
  ```

#### PUT `/api/signalements/{id}`
- **Description** : Mettre à jour un signalement
- **Headers** : `Authorization: Bearer <token>`
- **Arguments** :
  ```json
  {
    "description": "string (optionnel)",
    "surface": "decimal (optionnel)",
    "budget": "decimal (optionnel)",
    "adresse": "string (optionnel)"
  }
  ```
- **Retour attendu** : Même format que GET `/api/signalements/{id}`

#### DELETE `/api/signalements/{id}`
- **Description** : Supprimer un signalement
- **Headers** : `Authorization: Bearer <token>`
- **Retour attendu** :
  ```json
  {
    "success": true,
    "message": "Signalement supprimé avec succès"
  }
  ```

### Statuts (`/api/statuts`)

#### GET `/api/statuts`
- **Description** : Récupérer tous les statuts d'avancement possibles
- **Retour attendu** :
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "integer",
        "nom": "string"
      }
    ]
  }
  ```

### Statistiques (`/api/stats`)

#### GET `/api/stats`
- **Description** : Récupérer les statistiques globales
- **Headers** : `Authorization: Bearer <token>` (optionnel)
- **Retour attendu** :
  ```json
  {
    "success": true,
    "data": {
      "total_signalements": "integer",
      "total_surface": "decimal",
      "total_budget": "decimal",
      "avancement_moyen": "decimal",
      "signalements_par_statut": [
        {
          "statut": "string",
          "count": "integer"
        }
      ]
    }
  }
  ```

## Gestion des erreurs

### Codes d'erreur standards
- `AUTH_REQUIRED` : Authentification requise
- `INVALID_CREDENTIALS` : Email ou mot de passe incorrect
- `EMAIL_EXISTS` : Email déjà utilisé
- `USER_NOT_FOUND` : Utilisateur non trouvé
- `SIGNALEMENT_NOT_FOUND` : Signalement non trouvé
- `UNAUTHORIZED` : Non autorisé à accéder à cette ressource
- `FORBIDDEN` : Accès interdit
- `VALIDATION_ERROR` : Erreur de validation des données
- `INTERNAL_ERROR` : Erreur interne du serveur

### Format des réponses d'erreur
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Message d'erreur détaillé",
    "details": {} // Informations supplémentaires si nécessaire
  }
}
```

## Sécurité

### JWT (JSON Web Tokens)
- **Durée de vie** : 24 heures
- **Algorithme** : HS256
- **Header** : `Authorization: Bearer <token>`

### CORS
- **Origines autorisées** : `http://localhost:8100`, `http://localhost:3000`
- **Méthodes autorisées** : GET, POST, PUT, DELETE
- **Headers autorisés** : `Content-Type`, `Authorization`

## Validation des données

### Signalements
- `description` : requis, max 1000 caractères
- `surface` : décimal, max 999999.99
- `budget` : décimal, max 999999.99
- `adresse` : string, max 500 caractères
- `localisation.coordinates` : tableau [longitude, latitude], valeurs entre -180 et 180

### Utilisateurs
- `email` : format email valide
- `password` : min 8 caractères, au moins 1 lettre, 1 chiffre
- `nom`, `prenom` : string, max 100 caractères
- `telephone` : format téléphone malgache (optionnel)

## Notes importantes pour le développement

1. **Base URL** : Toutes les URLs doivent être relatives à `/api`
2. **Timestamps** : Utiliser le format ISO 8601 (YYYY-MM-DDTHH:mm:ss)
3. **Pagination** : Commencer à 1, retourner le nombre total de pages
4. **Fichiers** : Les images doivent être uploadées via multipart/form-data
5. **Logs** : Logger toutes les requêtes importantes avec les timestamps
6. **Tests** : Prévoir des tests unitaires et d'intégration pour tous les endpoints

## Technologies recommandées pour le backend

- **Spring Boot 3.x** avec Spring Security
- **Spring Data JPA** pour l'accès à la base de données
- **PostgreSQL** avec PostGIS pour les données géospatiales
- **JWT** pour l'authentification
- **Maven** pour la gestion des dépendances
- **Swagger/OpenAPI** pour la documentation de l'API
